import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, type TripStatus } from '@cargoflow/database';
import { PrismaService } from '../common/database/prisma.service';
import { OutboxService } from '../common/messaging/outbox.service';
import type { CreateTripDto } from './dto/create-trip.dto';
import { canTransition } from './trip-transitions';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  list() {
    return this.prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { loadingDate: 'desc' },
    });
  }

  async get(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundException('Рейс не найден');
    return trip;
  }

  async create(input: CreateTripDto, correlationId: string) {
    const loadingDate = new Date(input.loadingDate);
    const deliveryDate = new Date(input.deliveryDate);
    if (deliveryDate < loadingDate) {
      throw new UnprocessableEntityException('Дата доставки не может быть раньше даты погрузки');
    }

    let outboxId = '';
    try {
      const trip = await this.prisma.$transaction(async (tx) => {
        let resolvedDriverId = input.driverId;
        if (input.driverId && !input.vehicleId) {
          throw new UnprocessableEntityException('Водитель назначается вместе с автомобилем');
        }
        if (input.vehicleId) {
          const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } });
          if (!vehicle) throw new NotFoundException('Автомобиль не найден');
          if (vehicle.status !== 'AVAILABLE') throw new ConflictException('Автомобиль недоступен');
          if (input.driverId && vehicle.driverId && input.driverId !== vehicle.driverId) {
            throw new ConflictException('Выбранный водитель не закреплён за автомобилем');
          }
          resolvedDriverId ??= vehicle.driverId ?? undefined;
          if (!resolvedDriverId) {
            throw new UnprocessableEntityException('У автомобиля не назначен водитель');
          }

          const vehicleClaim = await tx.vehicle.updateMany({
            where: { id: input.vehicleId, status: 'AVAILABLE' },
            data: {
              status: 'IN_TRIP',
              ...(resolvedDriverId ? { driverId: resolvedDriverId } : {}),
            },
          });
          if (vehicleClaim.count !== 1) throw new ConflictException('Автомобиль уже занят');

          if (resolvedDriverId) {
            const driverClaim = await tx.driver.updateMany({
              where: { id: resolvedDriverId, status: 'AVAILABLE' },
              data: { status: 'IN_TRIP' },
            });
            if (driverClaim.count !== 1) throw new ConflictException('Водитель недоступен');
          }
        }

        const created = await tx.trip.create({
          data: {
            bitrixDealId: input.bitrixDealId,
            ...(input.vehicleId ? { vehicleId: input.vehicleId } : {}),
            ...(resolvedDriverId ? { driverId: resolvedDriverId } : {}),
            from: input.from,
            to: input.to,
            loadingDate,
            deliveryDate,
            status: input.vehicleId ? 'ASSIGNED' : 'CREATED',
          },
          include: { vehicle: true, driver: true },
        });

        const event = await tx.integrationEvent.create({
          data: {
            correlationId,
            source: 'FLEET',
            eventType: 'trip.create',
            payload: { tripId: created.id, bitrixDealId: created.bitrixDealId },
          },
        });
        outboxId = event.id;
        return created;
      });
      await this.outbox.dispatchById(outboxId);
      return trip;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Рейс для этой сделки уже существует');
      }
      throw error;
    }
  }

  async assignVehicle(id: string, vehicleId: string, correlationId: string) {
    let outboxId = '';
    const trip = await this.prisma.$transaction(async (tx) => {
      const current = await tx.trip.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Рейс не найден');
      if (current.status !== 'CREATED') {
        throw new ConflictException('Назначить автомобиль можно только созданному рейсу');
      }

      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) throw new NotFoundException('Автомобиль не найден');
      if (vehicle.status !== 'AVAILABLE') throw new ConflictException('Автомобиль недоступен');
      if (!vehicle.driverId) {
        throw new UnprocessableEntityException('У автомобиля не назначен водитель');
      }

      const vehicleClaim = await tx.vehicle.updateMany({
        where: { id: vehicleId, status: 'AVAILABLE' },
        data: { status: 'IN_TRIP' },
      });
      if (vehicleClaim.count !== 1) throw new ConflictException('Автомобиль уже занят');

      const driverClaim = await tx.driver.updateMany({
        where: { id: vehicle.driverId, status: 'AVAILABLE' },
        data: { status: 'IN_TRIP' },
      });
      if (driverClaim.count !== 1) throw new ConflictException('Водитель недоступен');

      const updated = await tx.trip.update({
        where: { id },
        data: { vehicleId, driverId: vehicle.driverId, status: 'ASSIGNED' },
        include: { vehicle: true, driver: true },
      });
      const event = await tx.integrationEvent.create({
        data: {
          correlationId,
          source: 'FLEET',
          eventType: 'trip.update',
          payload: {
            tripId: updated.id,
            bitrixDealId: updated.bitrixDealId,
            previousStatus: current.status,
            status: updated.status,
          },
        },
      });
      outboxId = event.id;
      return updated;
    });

    await this.outbox.dispatchById(outboxId);
    return trip;
  }

  async updateStatus(id: string, status: TripStatus, correlationId: string) {
    let outboxId = '';
    const trip = await this.prisma.$transaction(async (tx) => {
      const current = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });
      if (!current) throw new NotFoundException('Рейс не найден');
      if (current.status === status) return current;
      if (!canTransition(current.status, status)) {
        throw new ConflictException(`Переход ${current.status} → ${status} запрещён`);
      }
      if (status === 'ASSIGNED' && !current.vehicleId) {
        throw new ConflictException('Сначала назначьте автомобиль');
      }

      const updated = await tx.trip.update({
        where: { id },
        data: { status },
        include: { vehicle: true, driver: true },
      });
      if (status === 'CLOSED' || status === 'CANCELLED') {
        if (current.vehicleId) {
          await tx.vehicle.update({
            where: { id: current.vehicleId },
            data: { status: 'AVAILABLE' },
          });
        }
        if (current.driverId) {
          await tx.driver.update({
            where: { id: current.driverId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      const event = await tx.integrationEvent.create({
        data: {
          correlationId,
          source: 'FLEET',
          eventType: 'trip.status.changed',
          payload: {
            tripId: updated.id,
            bitrixDealId: updated.bitrixDealId,
            previousStatus: current.status,
            status,
          },
        },
      });
      outboxId = event.id;
      return updated;
    });

    if (outboxId) await this.outbox.dispatchById(outboxId);
    return trip;
  }
}
