import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IntegrationEnvelope } from '@cargoflow/contracts';
import { TripSyncService } from './trip-sync.service';

function message(payload: Record<string, unknown>): IntegrationEnvelope {
  return {
    id: '8285ea0e-b102-41db-9261-4bfb7673c307',
    correlationId: '31fe0b8b-45a8-43a4-a0c8-31ff33732f6b',
    occurredAt: '2026-09-16T00:00:00.000Z',
    type: 'trip.create',
    payload,
  };
}

describe('TripSyncService', () => {
  afterEach(() => {
    delete process.env.BITRIX_WEBHOOK_URL;
    vi.restoreAllMocks();
  });

  it('подтверждает локальное событие без обращения к Bitrix24, пока портал не подключён', async () => {
    const locks = { withLock: vi.fn() };
    const service = new TripSyncService({} as never, locks as never);

    await service.process(message({ bitrixDealId: 1001, tripId: 'trip-1' }));

    expect(locks.withLock).not.toHaveBeenCalled();
  });

  it('отправляет локально созданный рейс в Bitrix24 после подключения портала', async () => {
    process.env.BITRIX_WEBHOOK_URL = 'https://example.bitrix24.ru/rest/1/secret/';
    const locks = {
      withLock: vi.fn(async (_key: string, task: () => Promise<void>) => task()),
    };
    const service = new TripSyncService({} as never, locks as never);
    const internals = service as unknown as {
      pushTripToBitrix: (dealId: number, tripId: string) => Promise<void>;
    };
    const pushTrip = vi.fn().mockResolvedValue(undefined);
    internals.pushTripToBitrix = pushTrip;

    await service.process(message({ bitrixDealId: 1001, tripId: 'trip-1' }));

    expect(locks.withLock).toHaveBeenCalledWith('deal:1001', expect.any(Function));
    expect(pushTrip).toHaveBeenCalledWith(1001, 'trip-1');
  });
});
