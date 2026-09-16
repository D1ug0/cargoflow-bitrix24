import { describe, expect, it } from 'vitest';
import { retryDelay } from './queue';

describe('retryDelay', () => {
  it('uses bounded exponential backoff', () => {
    expect(retryDelay(1)).toBe(1_000);
    expect(retryDelay(2)).toBe(2_000);
    expect(retryDelay(10)).toBe(60_000);
  });
});
