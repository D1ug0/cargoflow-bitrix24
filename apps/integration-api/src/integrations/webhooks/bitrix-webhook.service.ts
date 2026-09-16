import { createHash, timingSafeEqual } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { bitrixEventSchema, type BitrixEvent } from '@cargoflow/contracts';
import { Prisma } from '@cargoflow/database';
import { PrismaService } from '../../common/database/prisma.service';
import { OutboxService } from '../../common/messaging/outbox.service';
import { RedisService } from '../../common/cache/redis.service';

@Injectable()
export class BitrixWebhookService {
  private readonly logger = new Logger(BitrixWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly outbox: OutboxService,
  ) {}

  async accept(rawBody: unknown, correlationId: string) {
    const parsed = bitrixEventSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new UnprocessableEntityException({
        message: 'Некорректное событие Bitrix24',
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    const event = parsed.data;
    this.assertApplicationToken(event.auth.application_token);

    const externalEventId = this.externalEventId(event);
    const cacheKey = `cargoflow:webhook:${externalEventId}`;
    const ttl = Number(process.env.WEBHOOK_IDEMPOTENCY_TTL_SECONDS ?? 86_400);
    let claimed: boolean;
    try {
      claimed = await this.redis.claim(cacheKey, ttl);
    } catch (error) {
      this.logger.error(
        `Redis idempotency check failed: ${error instanceof Error ? error.message : error}`,
      );
      throw new ServiceUnavailableException('Сервис идемпотентности временно недоступен');
    }

    if (!claimed) {
      await this.writeLog(event, correlationId, 'IGNORED', undefined, 1);
      return { status: 'ignored', reason: 'duplicate', correlationId };
    }

    try {
      const record = await this.prisma.integrationEvent.create({
        data: {
          externalEventId,
          correlationId,
          source: 'BITRIX24',
          eventType: event.event === 'ONCRMDEALADD' ? 'trip.create' : 'trip.update',
          payload: this.safePayload(event),
        },
      });
      await this.writeLog(event, correlationId, 'RECEIVED', undefined, 1);
      await this.redis.complete(cacheKey, ttl);
      await this.outbox.dispatchById(record.id);
      return { status: 'accepted', correlationId, eventId: record.id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        await this.redis.complete(cacheKey, ttl);
        await this.writeLog(event, correlationId, 'IGNORED', undefined, 1);
        return { status: 'ignored', reason: 'duplicate', correlationId };
      }
      await this.redis.release(cacheKey).catch(() => undefined);
      throw error;
    }
  }

  private assertApplicationToken(actual: string) {
    const expected = process.env.BITRIX_APPLICATION_TOKEN;
    if (!expected || expected === 'replace-me') {
      throw new ServiceUnavailableException('BITRIX_APPLICATION_TOKEN is not configured');
    }
    const actualHash = createHash('sha256').update(actual).digest();
    const expectedHash = createHash('sha256').update(expected).digest();
    if (!timingSafeEqual(actualHash, expectedHash)) {
      throw new ForbiddenException('Подпись события Bitrix24 не прошла проверку');
    }
  }

  private externalEventId(event: BitrixEvent) {
    const raw = [event.event, event.auth.member_id, event.data.FIELDS.ID, event.ts ?? 0].join(':');
    return createHash('sha256').update(raw).digest('hex');
  }

  private safePayload(event: BitrixEvent) {
    return {
      event: event.event,
      dealId: event.data.FIELDS.ID,
      ...(event.ts === undefined ? {} : { timestamp: event.ts }),
      domain: event.auth.domain,
      memberId: event.auth.member_id,
    };
  }

  private writeLog(
    event: BitrixEvent,
    correlationId: string,
    status: 'RECEIVED' | 'IGNORED',
    error?: string,
    attempts = 1,
  ) {
    return this.prisma.integrationLog.create({
      data: {
        correlationId,
        source: 'BITRIX24',
        eventType: event.event,
        request: this.safePayload(event),
        status,
        ...(error ? { error } : {}),
        attempts,
      },
    });
  }
}
