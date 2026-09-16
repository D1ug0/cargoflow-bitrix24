import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const route = request.route?.path ?? request.path;
        const labels = { method: request.method, route, status: String(response.statusCode) };
        this.metrics.httpRequests.inc(labels);
        if (response.statusCode >= 400) this.metrics.httpErrors.inc(labels);
        if (request.path === '/webhooks/bitrix') {
          const duration = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
          this.metrics.webhookDuration.observe(
            { event: typeof request.body?.event === 'string' ? request.body.event : 'unknown' },
            duration,
          );
        }
      }),
    );
  }
}
