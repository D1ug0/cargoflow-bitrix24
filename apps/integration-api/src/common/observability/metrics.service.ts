import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'] as const,
    registers: [this.registry],
  });
  readonly httpErrors = new Counter({
    name: 'http_errors_total',
    help: 'Total HTTP responses with status 4xx or 5xx',
    labelNames: ['method', 'route', 'status'] as const,
    registers: [this.registry],
  });
  readonly webhookDuration = new Histogram({
    name: 'webhook_processing_time',
    help: 'Bitrix webhook processing time in seconds',
    labelNames: ['event'] as const,
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'cargoflow_api_' });
  }
}
