import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client?: Redis;

  async claim(key: string, ttlSeconds: number) {
    const result = await (await this.getClient()).set(key, 'processing', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async complete(key: string, ttlSeconds: number) {
    await (await this.getClient()).set(key, 'processed', 'EX', ttlSeconds);
  }

  async release(key: string) {
    await (await this.getClient()).del(key);
  }

  async ping() {
    return (await this.getClient()).ping();
  }

  async onModuleDestroy() {
    await this.client?.quit().catch(() => undefined);
  }

  private async getClient() {
    if (!this.client) {
      this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false,
      });
    }
    if (this.client.status === 'wait') await this.client.connect();
    return this.client;
  }
}
