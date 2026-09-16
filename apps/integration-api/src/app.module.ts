import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorrelationIdMiddleware } from './common/http/correlation-id.middleware';
import { DatabaseModule } from './common/database/database.module';
import { CacheModule } from './common/cache/cache.module';
import { MessagingModule } from './common/messaging/messaging.module';
import { MetricsInterceptor } from './common/observability/metrics.interceptor';
import { MetricsModule } from './common/observability/metrics.module';
import { FleetModule } from './fleet/fleet.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CacheModule,
    MessagingModule,
    MetricsModule,
    FleetModule,
    IntegrationsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: MetricsInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
