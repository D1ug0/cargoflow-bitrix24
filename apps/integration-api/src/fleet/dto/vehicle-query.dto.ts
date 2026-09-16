import { ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus, VehicleType } from '@cargoflow/database';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class VehicleQueryDto {
  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Plate number or driver name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
