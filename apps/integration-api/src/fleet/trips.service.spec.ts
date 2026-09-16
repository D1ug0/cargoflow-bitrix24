import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { TripsService } from './trips.service';

describe('TripsService assignment', () => {
  it('atomically assigns an available vehicle and publishes trip.update', async () => {
    const updated = {
      id: 'f655018b-9556-4ceb-ac47-061fe55f76c0',
      bitrixDealId: 1001,
      status: 'ASSIGNED',
    };
    const tx = {
      trip: {
        findUnique: vi.fn().mockResolvedValue({
          id: updated.id,
          bitrixDealId: updated.bitrixDealId,
          status: 'CREATED',
        }),
        update: vi.fn().mockResolvedValue(updated),
      },
      vehicle: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'cb7d274b-4768-458b-aa78-da075f887703',
          status: 'AVAILABLE',
          driverId: 'd4a05fac-b34f-4464-b65b-a50834a9954a',
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      driver: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      integrationEvent: {
        create: vi.fn().mockResolvedValue({ id: 'f4699283-b020-43f1-8065-4c54be38f58f' }),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (work: (client: typeof tx) => unknown) => work(tx)),
    };
    const outbox = { dispatchById: vi.fn().mockResolvedValue(undefined) };
    const service = new TripsService(prisma as never, outbox as never);

    await expect(
      service.assignVehicle(
        updated.id,
        'cb7d274b-4768-458b-aa78-da075f887703',
        '790b733d-6572-4e70-8d7c-e422fa4561c9',
      ),
    ).resolves.toBe(updated);

    expect(tx.vehicle.updateMany).toHaveBeenCalledWith({
      where: { id: 'cb7d274b-4768-458b-aa78-da075f887703', status: 'AVAILABLE' },
      data: { status: 'IN_TRIP' },
    });
    expect(tx.driver.updateMany).toHaveBeenCalledWith({
      where: { id: 'd4a05fac-b34f-4464-b65b-a50834a9954a', status: 'AVAILABLE' },
      data: { status: 'IN_TRIP' },
    });
    expect(tx.integrationEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: 'trip.update',
        payload: expect.objectContaining({ tripId: updated.id, status: 'ASSIGNED' }),
      }),
    });
    expect(outbox.dispatchById).toHaveBeenCalledWith('f4699283-b020-43f1-8065-4c54be38f58f');
  });

  it('does not assign a second vehicle after the trip has started', async () => {
    const tx = {
      trip: { findUnique: vi.fn().mockResolvedValue({ status: 'LOADING' }) },
    };
    const prisma = {
      $transaction: vi.fn(async (work: (client: typeof tx) => unknown) => work(tx)),
    };
    const service = new TripsService(prisma as never, { dispatchById: vi.fn() } as never);

    await expect(
      service.assignVehicle(
        'f655018b-9556-4ceb-ac47-061fe55f76c0',
        'cb7d274b-4768-458b-aa78-da075f887703',
        '790b733d-6572-4e70-8d7c-e422fa4561c9',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
