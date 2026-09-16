import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BitrixService } from './bitrix.service';

@ApiTags('bitrix')
@Controller('bitrix')
export class BitrixController {
  constructor(private readonly bitrix: BitrixService) {}

  @Get('deals/:id')
  @ApiOperation({ summary: 'Read a Bitrix24 deal through crm.item.get' })
  getDeal(@Param('id', ParseIntPipe) id: number) {
    return this.bitrix.getDeal(id);
  }

  @Get('deal-fields')
  @ApiOperation({ summary: 'Read current Bitrix24 deal field metadata' })
  getFields() {
    return this.bitrix.getDealFields();
  }

  @Get('stages')
  @ApiOperation({ summary: 'Read stages for the configured deal funnel' })
  getStages() {
    return this.bitrix.listStages();
  }
}
