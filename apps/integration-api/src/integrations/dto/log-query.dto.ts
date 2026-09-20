import { ApiPropertyOptional } from '@nestjs/swagger';
import { IntegrationLogStatus } from '@cargoflow/database';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class LogQueryDto {
  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 50;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @ApiPropertyOptional({ enum: IntegrationLogStatus })
  @IsOptional()
  @IsEnum(IntegrationLogStatus)
  status?: IntegrationLogStatus;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Exact correlation ID used across API, queue, worker, and logs',
  })
  @IsOptional()
  @IsUUID()
  correlationId?: string;
}
