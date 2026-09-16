import { Injectable } from '@nestjs/common';
import type { IntegrationEnvelope, TripStatus } from '@cargoflow/contracts';
import { BitrixRestClient } from '@cargoflow/shared';
import { PrismaService } from './prisma.service';
import { RedisLockService } from './redis-lock.service';

interface BitrixPayload {
  dealId?: number;
  bitrixDealId?: number;
  tripId?: string;
  status?: TripStatus;
}

@Injectable()
export class TripSyncService {
  private bitrix?: BitrixRestClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly locks: RedisLockService,
  ) {}

  async process(message: IntegrationEnvelope) {
    const payload = message.payload as BitrixPayload;
    const dealId = Number(payload.dealId ?? payload.bitrixDealId);
    if (!Number.isInteger(dealId) || dealId <= 0)
      throw new Error('Event has no valid Bitrix deal ID');

    // The local Fleet demo is intentionally usable before a Bitrix24 portal is connected.
    if (!this.isBitrixConfigured()) return;

    await this.locks.withLock(`deal:${dealId}`, async () => {
      if (message.type === 'trip.status.changed') {
        await this.pushStatusToBitrix(dealId, payload.status);
      } else if (
        (message.type === 'trip.create' || message.type === 'bitrix.deal.update') &&
        payload.tripId
      ) {
        await this.pushTripToBitrix(dealId, payload.tripId);
      } else if (message.type === 'trip.create' || message.type === 'trip.update') {
        await this.pullDealFromBitrix(dealId);
      } else {
        throw new Error(`Unsupported integration event: ${message.type}`);
      }
    });
  }

  private async pushTripToBitrix(dealId: number, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error(`Trip ${tripId} was not found`);

    const stageId = process.env[`BITRIX_STAGE_${trip.status}`];
    await this.getBitrix().updateDeal(dealId, {
      [this.fieldName('BITRIX_FIELD_EXTERNAL_TRIP_ID')]: trip.id,
      [this.fieldName('BITRIX_FIELD_FROM_CITY')]: trip.from,
      [this.fieldName('BITRIX_FIELD_TO_CITY')]: trip.to,
      [this.fieldName('BITRIX_FIELD_LOADING_DATE')]: trip.loadingDate.toISOString(),
      [this.fieldName('BITRIX_FIELD_DELIVERY_DATE')]: trip.deliveryDate.toISOString(),
      [this.fieldName('BITRIX_FIELD_INTEGRATION_STATUS')]: 'SYNCED',
      [this.fieldName('BITRIX_FIELD_LAST_SYNC_AT')]: new Date().toISOString(),
      [this.fieldName('BITRIX_FIELD_INTEGRATION_ERROR')]: '',
      ...(stageId ? { stageId } : {}),
    });
  }

  private async pullDealFromBitrix(dealId: number) {
    const deal = await this.getBitrix().getDeal(dealId);
    const from = this.stringField(deal, 'BITRIX_FIELD_FROM_CITY');
    const to = this.stringField(deal, 'BITRIX_FIELD_TO_CITY');
    const loadingDate = this.dateField(deal, 'BITRIX_FIELD_LOADING_DATE');
    const deliveryDate = this.dateField(deal, 'BITRIX_FIELD_DELIVERY_DATE');
    if (!from || !to || !loadingDate || !deliveryDate) {
      throw new Error('Bitrix deal is missing required route or date fields');
    }

    const mappedStatus = this.statusFromStage(String(deal.stageId ?? ''));
    const trip = await this.prisma.trip.upsert({
      where: { bitrixDealId: dealId },
      create: {
        bitrixDealId: dealId,
        from,
        to,
        loadingDate,
        deliveryDate,
        status: mappedStatus ?? 'CREATED',
      },
      update: {
        from,
        to,
        loadingDate,
        deliveryDate,
        ...(mappedStatus ? { status: mappedStatus } : {}),
      },
    });

    const externalTripField = this.fieldName('BITRIX_FIELD_EXTERNAL_TRIP_ID');
    const statusField = this.fieldName('BITRIX_FIELD_INTEGRATION_STATUS');
    const errorField = this.fieldName('BITRIX_FIELD_INTEGRATION_ERROR');
    const alreadySynchronized =
      String(deal[externalTripField] ?? '') === trip.id &&
      String(deal[statusField] ?? '') === 'SYNCED' &&
      String(deal[errorField] ?? '') === '';

    // crm.item.update emits ONCRMDEALUPDATE too. Skip a no-op update to avoid an event loop.
    if (!alreadySynchronized) {
      await this.getBitrix().updateDeal(dealId, {
        [externalTripField]: trip.id,
        [statusField]: 'SYNCED',
        [this.fieldName('BITRIX_FIELD_LAST_SYNC_AT')]: new Date().toISOString(),
        [errorField]: '',
      });
    }
  }

  private async pushStatusToBitrix(dealId: number, status?: TripStatus) {
    if (!status) throw new Error('trip.status.changed has no status');
    const stageId = process.env[`BITRIX_STAGE_${status}`];
    if (!stageId) throw new Error(`Bitrix stage is not configured for ${status}`);
    await this.getBitrix().updateDeal(dealId, {
      stageId,
      [this.fieldName('BITRIX_FIELD_INTEGRATION_STATUS')]: 'SYNCED',
      [this.fieldName('BITRIX_FIELD_LAST_SYNC_AT')]: new Date().toISOString(),
      [this.fieldName('BITRIX_FIELD_INTEGRATION_ERROR')]: '',
    });
  }

  private getBitrix() {
    if (this.bitrix) return this.bitrix;
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('replace-me'))
      throw new Error('BITRIX_WEBHOOK_URL is not configured');
    this.bitrix = new BitrixRestClient({
      webhookUrl,
      entityTypeId: Number(process.env.BITRIX_ENTITY_TYPE_ID ?? 2),
    });
    return this.bitrix;
  }

  private isBitrixConfigured() {
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
    return Boolean(webhookUrl && !webhookUrl.includes('replace-me'));
  }

  private fieldName(environmentName: string) {
    const value = process.env[environmentName];
    if (!value) throw new Error(`${environmentName} is not configured`);
    return value;
  }

  private stringField(deal: Record<string, unknown>, environmentName: string) {
    const value = deal[this.fieldName(environmentName)];
    return typeof value === 'string' ? value.trim() : '';
  }

  private dateField(deal: Record<string, unknown>, environmentName: string) {
    const raw = deal[this.fieldName(environmentName)];
    if (typeof raw !== 'string') return undefined;
    const value = new Date(raw);
    return Number.isNaN(value.valueOf()) ? undefined : value;
  }

  private statusFromStage(stageId: string): TripStatus | undefined {
    const statuses: TripStatus[] = [
      'ASSIGNED',
      'LOADING',
      'IN_TRANSIT',
      'DELIVERED',
      'CLOSED',
      'CANCELLED',
    ];
    return statuses.find((status) => process.env[`BITRIX_STAGE_${status}`] === stageId);
  }
}
