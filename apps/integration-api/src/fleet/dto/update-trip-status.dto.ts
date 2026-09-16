import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '@cargoflow/database';
import { IsEnum } from 'class-validator';

export class UpdateTripStatusDto {
  @ApiProperty({ enum: TripStatus })
  @IsEnum(TripStatus)
  status!: TripStatus;
}
