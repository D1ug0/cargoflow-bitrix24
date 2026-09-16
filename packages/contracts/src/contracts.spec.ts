import { describe, expect, it } from 'vitest';
import { bitrixEventSchema, createTripSchema } from './index.js';

describe('CargoFlow contracts', () => {
  it('rejects delivery before loading', () => {
    const result = createTripSchema.safeParse({
      bitrixDealId: 42,
      from: 'Москва',
      to: 'Казань',
      loadingDate: '2026-09-20',
      deliveryDate: '2026-09-19',
    });

    expect(result.success).toBe(false);
  });

  it('accepts a form-compatible Bitrix event', () => {
    const result = bitrixEventSchema.safeParse({
      event: 'ONCRMDEALADD',
      data: { FIELDS: { ID: '100' } },
      auth: { domain: 'example.bitrix24.ru', member_id: 'member', application_token: 'token' },
    });

    expect(result.success).toBe(true);
  });
});
