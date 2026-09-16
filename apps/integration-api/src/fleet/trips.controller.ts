import { Body, Controller, Get, Param, Patch, Post, ParseUUIDPipe, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AssignTripDto } from './dto/assign-trip.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { TripsService } from './trips.service';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'List trips' })
  list() {
    return this.trips.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a trip linked to a Bitrix24 deal' })
  create(@Body() body: CreateTripDto, @Req() request: Request) {
    return this.trips.create(body, request.correlationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.get(id);
  }

  @Patch(':id/assignment')
  @ApiOperation({ summary: 'Assign an available vehicle and its driver to a created trip' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AssignTripDto,
    @Req() request: Request,
  ) {
    return this.trips.assignVehicle(id, body.vehicleId, request.correlationId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance or cancel a trip' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTripStatusDto,
    @Req() request: Request,
  ) {
    return this.trips.updateStatus(id, body.status, request.correlationId);
  }
}
