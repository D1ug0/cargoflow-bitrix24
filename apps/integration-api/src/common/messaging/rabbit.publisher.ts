import { Injectable, OnModuleDestroy } from '@nestjs/common';
import amqp, { ChannelModel, ConfirmChannel } from 'amqplib';
import type { IntegrationEnvelope } from '@cargoflow/contracts';

@Injectable()
export class RabbitPublisher implements OnModuleDestroy {
  private connection: ChannelModel | undefined;
  private channel: ConfirmChannel | undefined;

  async publish(message: IntegrationEnvelope) {
    const channel = await this.getChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'cargoflow.events';
    await channel.assertExchange(exchange, 'topic', { durable: true });
    channel.publish(exchange, message.type, Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json',
      deliveryMode: 2,
      messageId: message.id,
      correlationId: message.correlationId,
      timestamp: Date.now(),
    });
    await channel.waitForConfirms();
  }

  async check() {
    await this.getChannel();
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  private async getChannel() {
    if (this.channel) return this.channel;
    const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
    this.connection = await amqp.connect(url);
    this.connection.on('close', () => {
      this.channel = undefined;
      this.connection = undefined;
    });
    this.channel = await this.connection.createConfirmChannel();
    return this.channel;
  }
}
