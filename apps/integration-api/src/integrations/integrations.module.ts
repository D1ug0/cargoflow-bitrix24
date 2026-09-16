import { Module } from '@nestjs/common';
import { BitrixController } from './bitrix/bitrix.controller';
import { BitrixService } from './bitrix/bitrix.service';
import { IntegrationLogsController } from './integration-logs.controller';
import { BitrixWebhookController } from './webhooks/bitrix-webhook.controller';
import { BitrixWebhookService } from './webhooks/bitrix-webhook.service';

@Module({
  controllers: [BitrixWebhookController, BitrixController, IntegrationLogsController],
  providers: [BitrixWebhookService, BitrixService],
  exports: [BitrixService],
})
export class IntegrationsModule {}
