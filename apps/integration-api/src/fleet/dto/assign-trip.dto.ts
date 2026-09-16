import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTripDto {
  @ApiProperty({ description: 'Available vehicle assigned to the trip' })
  @IsUUID()
  vehicleId!: string;
}
