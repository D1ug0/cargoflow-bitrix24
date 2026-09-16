import { randomUUID } from 'node:crypto';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisLockService implements OnModuleDestroy {
  private readonly client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  });

  async withLock<T>(resource: string, work: () => Promise<T>): Promise<T> {
    const key = `cargoflow:lock:${resource}`;
    const token = randomUUID();
    if (this.client.status === 'wait') await this.client.connect();
    const acquired = await this.client.set(key, token, 'PX', 30_000, 'NX');
    if (acquired !== 'OK') throw new Error(`Lock is busy for ${resource}`);
    try {
      return await work();
    } finally {
      await this.client
        .eval(
          "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
          1,
          key,
          token,
        )
        .catch(() => undefined);
    }
  }

  async onModuleDestroy() {
    await this.client.quit().catch(() => undefined);
  }
}
