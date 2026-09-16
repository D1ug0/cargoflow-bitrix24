import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/database/prisma.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Operational dashboard counters' })
  async summary() {
    const [activeTrips, availableVehicles, serviceVehicles, integrationErrors] = await Promise.all([
      this.prisma.trip.count({ where: { status: { in: ['ASSIGNED', 'LOADING', 'IN_TRANSIT'] } } }),
      this.prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.vehicle.count({ where: { status: 'SERVICE' } }),
      this.prisma.integrationLog.count({ where: { status: 'ERROR' } }),
    ]);
    return { activeTrips, availableVehicles, serviceVehicles, integrationErrors };
  }
}
