export const DEFAULT_EXCHANGE = 'cargoflow.events';
export const DEFAULT_WORKER_QUEUE = 'cargoflow.worker';
export const RETRY_EXCHANGE = 'cargoflow.retry';
export const RETRY_QUEUE = 'cargoflow.worker.retry';
export const DEAD_LETTER_EXCHANGE = 'cargoflow.dlx';
export const DEAD_LETTER_QUEUE = 'cargoflow.worker.dlq';

export function retryDelay(attempt: number, baseMs = 1_000) {
  return Math.min(baseMs * 2 ** Math.max(0, attempt - 1), 60_000);
}
