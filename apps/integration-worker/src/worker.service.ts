import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import type { IntegrationEnvelope } from '@cargoflow/contracts';
import {
  DEAD_LETTER_EXCHANGE,
  DEAD_LETTER_QUEUE,
  DEFAULT_EXCHANGE,
  DEFAULT_WORKER_QUEUE,
  RETRY_EXCHANGE,
  RETRY_QUEUE,
  retryDelay,
} from '@cargoflow/shared';
import amqp, { ChannelModel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { PrismaService } from './prisma.service';
import { TripSyncService } from './trip-sync.service';

@Injectable()
export class WorkerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;

  constructor(
    private readonly trips: TripSyncService,
    private readonly prisma: PrismaService,
  ) {}

  async onApplicationBootstrap() {
    const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
    const connection = await amqp.connect(url);
    const channel = await connection.createConfirmChannel();
    this.connection = connection;
    this.channel = channel;
    await this.configureTopology(channel);
    await channel.prefetch(10);
    await channel.consume(
      process.env.RABBITMQ_QUEUE ?? DEFAULT_WORKER_QUEUE,
      (message) => void this.consume(message),
      { noAck: false },
    );
    this.logger.log('CargoFlow worker is consuming integration events');
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  private async configureTopology(channel: ConfirmChannel) {
    const exchange = process.env.RABBITMQ_EXCHANGE ?? DEFAULT_EXCHANGE;
    const queue = process.env.RABBITMQ_QUEUE ?? DEFAULT_WORKER_QUEUE;
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, 'trip.#');
    await channel.bindQueue(queue, exchange, 'bitrix.#');
    await channel.bindQueue(queue, exchange, '__retry__');

    await channel.assertExchange(RETRY_EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(RETRY_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': exchange,
        'x-dead-letter-routing-key': '__retry__',
      },
    });
    await channel.bindQueue(RETRY_QUEUE, RETRY_EXCHANGE, 'retry');

    await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, '#');
  }

  private async consume(raw: ConsumeMessage | null) {
    if (!raw || !this.channel) return;
    const channel = this.channel;
    const attempt = Number(raw.properties.headers?.['x-attempt'] ?? 0);
    const routingKey = String(
      raw.properties.headers?.['x-original-routing-key'] ?? raw.fields.routingKey,
    );
    let envelope: IntegrationEnvelope;
    try {
      envelope = JSON.parse(raw.content.toString('utf8')) as IntegrationEnvelope;
      this.assertEnvelope(envelope);
    } catch (error) {
      this.logger.error(
        `Discarding invalid message: ${error instanceof Error ? error.message : error}`,
      );
      await this.deadLetter(raw, routingKey, attempt + 1, 'Invalid message');
      return;
    }

    try {
      await this.trips.process(envelope);
      await this.prisma.integrationEvent
        .update({
          where: { id: envelope.id },
          data: { status: 'PROCESSED', attempts: attempt + 1, lastError: null },
        })
        .catch(() => undefined);
      await this.prisma.integrationLog.create({
        data: {
          correlationId: envelope.correlationId,
          source: 'WORKER',
          eventType: envelope.type,
          request: envelope.payload as object,
          status: 'SUCCESS',
          attempts: attempt + 1,
        },
      });
      channel.ack(raw);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown worker error';
      const nextAttempt = attempt + 1;
      await this.prisma.integrationLog
        .create({
          data: {
            correlationId: envelope.correlationId,
            source: 'WORKER',
            eventType: envelope.type,
            request: envelope.payload as object,
            status: 'ERROR',
            attempts: nextAttempt,
            error: message.slice(0, 2_000),
          },
        })
        .catch(() => undefined);

      if (nextAttempt <= 3) {
        channel.publish(RETRY_EXCHANGE, 'retry', raw.content, {
          contentType: 'application/json',
          deliveryMode: 2,
          correlationId: envelope.correlationId,
          messageId: envelope.id,
          expiration: String(retryDelay(nextAttempt)),
          headers: { 'x-attempt': nextAttempt, 'x-original-routing-key': routingKey },
        });
        await channel.waitForConfirms();
        channel.ack(raw);
        this.logger.warn(`Retry ${nextAttempt}/3 scheduled for ${envelope.id}: ${message}`);
      } else {
        await this.deadLetter(raw, routingKey, nextAttempt, message);
        await this.prisma.integrationEvent
          .update({
            where: { id: envelope.id },
            data: {
              status: 'DEAD_LETTERED',
              attempts: nextAttempt,
              lastError: message.slice(0, 2_000),
            },
          })
          .catch(() => undefined);
      }
    }
  }

  private async deadLetter(
    raw: ConsumeMessage,
    routingKey: string,
    attempt: number,
    error: string,
  ) {
    if (!this.channel) return;
    this.channel.publish(DEAD_LETTER_EXCHANGE, routingKey, raw.content, {
      contentType: raw.properties.contentType ?? 'application/json',
      deliveryMode: 2,
      correlationId: raw.properties.correlationId,
      messageId: raw.properties.messageId,
      headers: {
        ...raw.properties.headers,
        'x-attempt': attempt,
        'x-final-error': error.slice(0, 500),
      },
    });
    await this.channel.waitForConfirms();
    this.channel.ack(raw);
  }

  private assertEnvelope(value: IntegrationEnvelope) {
    if (
      !value ||
      typeof value.id !== 'string' ||
      typeof value.correlationId !== 'string' ||
      typeof value.type !== 'string'
    ) {
      throw new Error('Integration envelope is malformed');
    }
  }
}
