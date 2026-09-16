import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { BitrixRestClient } from '@cargoflow/shared';

@Injectable()
export class BitrixService {
  private client?: BitrixRestClient;

  getDeal(id: number) {
    return this.getClient().getDeal(id);
  }

  updateDeal(id: number, fields: Record<string, unknown>) {
    return this.getClient().updateDeal(id, fields);
  }

  getDealFields() {
    return this.getClient().getDealFields();
  }

  listStages() {
    const raw = process.env.BITRIX_CATEGORY_ID;
    return this.getClient().listStages(raw ? Number(raw) : undefined);
  }

  private getClient() {
    if (this.client) return this.client;
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('replace-me')) {
      throw new ServiceUnavailableException('BITRIX_WEBHOOK_URL is not configured');
    }
    this.client = new BitrixRestClient({
      webhookUrl,
      entityTypeId: Number(process.env.BITRIX_ENTITY_TYPE_ID ?? 2),
    });
    return this.client;
  }
}
