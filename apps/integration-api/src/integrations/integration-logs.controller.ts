import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Prisma } from '@cargoflow/database';
import { PrismaService } from '../common/database/prisma.service';
import { LogQueryDto } from './dto/log-query.dto';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List integration log records' })
  async list(@Query() query: LogQueryDto) {
    const where: Prisma.IntegrationLogWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.correlationId ? { correlationId: query.correlationId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.integrationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.integrationLog.count({ where }),
    ]);
    return { items, total, limit: query.limit, offset: query.offset };
  }
}
