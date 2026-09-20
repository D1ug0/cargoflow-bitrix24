import { IntegrationLogStatus } from '@cargoflow/database';
import { describe, expect, it, vi } from 'vitest';
import { LogQueryDto } from './dto/log-query.dto';
import { IntegrationLogsController } from './integration-logs.controller';

describe('IntegrationLogsController', () => {
  it('filters the journal by status and exact correlation ID', async () => {
    const correlationId = '790b733d-6572-4e70-8d7c-e422fa4561c9';
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = {
      integrationLog: { findMany, count },
      $transaction: vi.fn().mockResolvedValue([[], 0]),
    };
    const controller = new IntegrationLogsController(prisma as never);
    const query = Object.assign(new LogQueryDto(), {
      status: IntegrationLogStatus.ERROR,
      correlationId,
      limit: 25,
      offset: 5,
    });

    await expect(controller.list(query)).resolves.toEqual({
      items: [],
      total: 0,
      limit: 25,
      offset: 5,
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { status: IntegrationLogStatus.ERROR, correlationId },
      orderBy: { createdAt: 'desc' },
      take: 25,
      skip: 5,
    });
    expect(count).toHaveBeenCalledWith({
      where: { status: IntegrationLogStatus.ERROR, correlationId },
    });
  });
});
