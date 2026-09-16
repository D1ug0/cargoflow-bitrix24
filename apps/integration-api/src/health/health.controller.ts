import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/database/prisma.service';
import { RabbitPublisher } from '../common/messaging/rabbit.publisher';
import { RedisService } from '../common/cache/redis.service';

@ApiTags('system')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbit: RabbitPublisher,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Readiness check for PostgreSQL, RabbitMQ, and Redis' })
  async health() {
    const checks = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.rabbit.check(),
      this.redis.ping(),
    ]);
    const names = ['postgresql', 'rabbitmq', 'redis'];
    const dependencies = Object.fromEntries(
      checks.map((check, index) => [names[index], check.status === 'fulfilled' ? 'up' : 'down']),
    );
    if (checks.some((check) => check.status === 'rejected')) {
      throw new ServiceUnavailableException({
        message: 'One or more dependencies are unavailable',
        dependencies,
      });
    }
    return { status: 'ok', dependencies, timestamp: new Date().toISOString() };
  }
}
