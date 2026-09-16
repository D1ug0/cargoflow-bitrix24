import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import type { IntegrationEnvelope } from '@cargoflow/contracts';
import { PrismaService } from '../database/prisma.service';
import { RabbitPublisher } from './rabbit.publisher';

@Injectable()
export class OutboxService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private timer?: NodeJS.Timeout;
  private dispatching = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: RabbitPublisher,
  ) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.dispatchPending(), 5_000);
    this.timer.unref();
    void this.dispatchPending();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async dispatchById(id: string) {
    const event = await this.prisma.integrationEvent.findUnique({ where: { id } });
    if (!event || event.status !== 'PENDING') return;

    const envelope: IntegrationEnvelope = {
      id: event.id,
      type: event.eventType as IntegrationEnvelope['type'],
      occurredAt: event.createdAt.toISOString(),
      correlationId: event.correlationId,
      payload: event.payload,
    };

    try {
      await this.publisher.publish(envelope);
      await this.prisma.integrationEvent.update({
        where: { id },
        data: { status: 'PUBLISHED', attempts: { increment: 1 }, lastError: null },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown RabbitMQ error';
      await this.prisma.integrationEvent.update({
        where: { id },
        data: { attempts: { increment: 1 }, lastError: message.slice(0, 2_000) },
      });
      this.logger.warn(`Outbox event ${id} remains pending: ${message}`);
    }
  }

  async dispatchPending() {
    if (this.dispatching) return;
    this.dispatching = true;
    try {
      const events = await this.prisma.integrationEvent.findMany({
        where: { status: 'PENDING', attempts: { lt: 20 } },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
      for (const event of events) await this.dispatchById(event.id);
    } catch (error) {
      this.logger.warn(
        `Outbox dispatch skipped: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      this.dispatching = false;
    }
  }
}
