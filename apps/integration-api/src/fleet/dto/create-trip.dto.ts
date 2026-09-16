import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 1001 })
  @IsInt()
  @IsPositive()
  bitrixDealId!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiProperty({ example: 'Москва' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  from!: string;

  @ApiProperty({ example: 'Казань' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  to!: string;

  @ApiProperty({ example: '2026-09-20T08:00:00.000Z' })
  @IsDateString()
  loadingDate!: string;

  @ApiProperty({ example: '2026-09-21T12:00:00.000Z' })
  @IsDateString()
  deliveryDate!: string;
}
