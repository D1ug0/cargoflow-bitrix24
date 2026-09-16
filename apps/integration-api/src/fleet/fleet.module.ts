import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [VehiclesController, TripsController, DashboardController],
  providers: [VehiclesService, TripsService],
  exports: [TripsService],
})
export class FleetModule {}
