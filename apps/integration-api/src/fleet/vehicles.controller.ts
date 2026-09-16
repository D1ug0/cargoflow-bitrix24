import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter vehicles' })
  list(@Query() query: VehicleQueryDto) {
    return this.vehicles.list(query);
  }

  @Get('available')
  @ApiOperation({ summary: 'List available vehicles' })
  available(@Query() query: VehicleQueryDto) {
    return this.vehicles.list(query, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.get(id);
  }
}
