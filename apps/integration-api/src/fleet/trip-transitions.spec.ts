import { describe, expect, it } from 'vitest';
import { canTransition } from './trip-transitions';

describe('trip transitions', () => {
  it('allows the normal route', () => {
    expect(canTransition('ASSIGNED', 'LOADING')).toBe(true);
    expect(canTransition('IN_TRANSIT', 'DELIVERED')).toBe(true);
  });

  it('rejects jumping over stages', () => {
    expect(canTransition('CREATED', 'DELIVERED')).toBe(false);
    expect(canTransition('CLOSED', 'IN_TRANSIT')).toBe(false);
  });
});
