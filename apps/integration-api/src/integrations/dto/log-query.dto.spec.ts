import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { LogQueryDto } from './log-query.dto';

describe('LogQueryDto', () => {
  it('accepts a supported status and a UUID correlation ID', async () => {
    const query = Object.assign(new LogQueryDto(), {
      status: 'ERROR',
      correlationId: '790b733d-6572-4e70-8d7c-e422fa4561c9',
    });

    await expect(validate(query)).resolves.toHaveLength(0);
  });

  it.each([
    { field: 'status', value: 'FAILED' },
    { field: 'correlationId', value: 'not-a-uuid' },
  ])('rejects an invalid $field filter', async ({ field, value }) => {
    const query = Object.assign(new LogQueryDto(), { [field]: value });

    const errors = await validate(query);

    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ property: field })]));
  });
});
