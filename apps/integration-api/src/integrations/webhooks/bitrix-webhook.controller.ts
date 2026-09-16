import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { BitrixWebhookService } from './bitrix-webhook.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class BitrixWebhookController {
  constructor(private readonly webhooks: BitrixWebhookService) {}

  @Post('bitrix')
  @HttpCode(202)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiBody({
    schema: {
      example: {
        event: 'ONCRMDEALUPDATE',
        data: { FIELDS: { ID: '1001' } },
        ts: '1789912800',
        auth: {
          domain: 'example.bitrix24.ru',
          member_id: 'portal-member-id',
          application_token: 'configured-outbound-token',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Accept and enqueue a verified Bitrix24 deal event' })
  accept(@Body() body: unknown, @Req() request: Request) {
    return this.webhooks.accept(body, request.correlationId);
  }
}
