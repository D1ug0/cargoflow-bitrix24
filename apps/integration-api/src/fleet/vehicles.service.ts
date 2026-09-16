import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@cargoflow/database';
import { PrismaService } from '../common/database/prisma.service';
import type { VehicleQueryDto } from './dto/vehicle-query.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: VehicleQueryDto, availableOnly = false) {
    const where: Prisma.VehicleWhereInput = {};
    if (availableOnly) where.status = 'AVAILABLE';
    else if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.search) {
      where.OR = [
        { plateNumber: { contains: query.search, mode: 'insensitive' } },
        { driver: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.vehicle.findMany({
      where,
      include: { driver: true },
      orderBy: [{ status: 'asc' }, { plateNumber: 'asc' }],
    });
  }

  async get(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { driver: true },
    });
    if (!vehicle) throw new NotFoundException('Автомобиль не найден');
    return vehicle;
  }
}
