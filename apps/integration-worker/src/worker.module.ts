import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { RedisLockService } from './redis-lock.service';
import { TripSyncService } from './trip-sync.service';
import { WorkerService } from './worker.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [PrismaService, RedisLockService, TripSyncService, WorkerService],
})
export class WorkerModule {}
