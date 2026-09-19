import { describe, expect, it } from 'vitest';
import { resolveCorrelationId } from './correlation-id.middleware';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('resolveCorrelationId', () => {
  it('keeps a valid UUID supplied by the caller', () => {
    const requestedId = '018f6f4e-7b5a-7cc2-8f6f-9a55fc8c4a80';

    expect(resolveCorrelationId(requestedId)).toBe(requestedId);
  });

  it.each([
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '018f6f4e7b5a7cc28f6f9a55fc8c4a80',
    'not-a-correlation-id',
    '',
  ])('replaces an invalid caller value: %s', (requestedId) => {
    const correlationId = resolveCorrelationId(requestedId);

    expect(correlationId).not.toBe(requestedId);
    expect(correlationId).toMatch(UUID_PATTERN);
  });

  it('generates a UUID when the header is absent', () => {
    expect(resolveCorrelationId()).toMatch(UUID_PATTERN);
  });
});
