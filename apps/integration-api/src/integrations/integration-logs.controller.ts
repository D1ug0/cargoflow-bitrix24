import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IntegrationLogStatus } from '@cargoflow/database';
import { PrismaService } from '../common/database/prisma.service';
import { LogQueryDto } from './dto/log-query.dto';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List integration log records' })
  async list(@Query() query: LogQueryDto) {
    const status = Object.values(IntegrationLogStatus).includes(
      query.status as IntegrationLogStatus,
    )
      ? (query.status as IntegrationLogStatus)
      : undefined;
    const where = status ? { status } : {};
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
