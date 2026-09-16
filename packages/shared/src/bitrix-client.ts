export interface BitrixClientOptions {
  webhookUrl: string;
  entityTypeId?: number;
  timeoutMs?: number;
}

export interface BitrixDeal {
  id: number;
  title?: string;
  stageId?: string;
  categoryId?: number;
  [field: string]: unknown;
}

interface BitrixResponse<T> {
  result?: T;
  error?: string;
  error_description?: string;
  time?: Record<string, unknown>;
}

export class BitrixApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'BitrixApiError';
  }
}

export class BitrixRestClient {
  private readonly webhookUrl: string;
  private readonly entityTypeId: number;
  private readonly timeoutMs: number;

  constructor(options: BitrixClientOptions) {
    this.webhookUrl = options.webhookUrl.replace(/\/+$/, '');
    this.entityTypeId = options.entityTypeId ?? 2;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async getDeal(id: number) {
    const result = await this.call<{ item: BitrixDeal }>('crm.item.get', {
      entityTypeId: this.entityTypeId,
      id,
      useOriginalUfNames: 'N',
    });
    return result.item;
  }

  async updateDeal(id: number, fields: Record<string, unknown>) {
    const result = await this.call<{ item: BitrixDeal }>('crm.item.update', {
      entityTypeId: this.entityTypeId,
      id,
      fields,
      useOriginalUfNames: 'N',
    });
    return result.item;
  }

  async getDealFields() {
    return this.call<Record<string, unknown>>('crm.item.fields', {
      entityTypeId: this.entityTypeId,
      useOriginalUfNames: 'N',
    });
  }

  async listStages(categoryId?: number) {
    const entityId = categoryId ? `DEAL_STAGE_${categoryId}` : 'DEAL_STAGE';
    return this.call<Array<Record<string, unknown>>>('crm.status.list', {
      filter: { ENTITY_ID: entityId },
      order: { SORT: 'ASC' },
    });
  }

  private async call<T>(method: string, params: Record<string, unknown>): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.webhookUrl}/${method}.json`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'TimeoutError'
          ? 'Bitrix24 timeout'
          : 'Bitrix24 network error';
      throw new BitrixApiError(message, 'NETWORK_ERROR', 503, true);
    }

    const payload = (await response.json().catch(() => ({}))) as BitrixResponse<T>;
    if (!response.ok || payload.error) {
      const status = response.status || 502;
      const retryable = status === 429 || status >= 500;
      throw new BitrixApiError(
        payload.error_description ?? payload.error ?? `Bitrix24 returned HTTP ${status}`,
        payload.error ?? 'BITRIX_ERROR',
        status,
        retryable,
      );
    }
    if (payload.result === undefined) {
      throw new BitrixApiError('Bitrix24 response has no result', 'INVALID_RESPONSE', 502, false);
    }
    return payload.result;
  }
}
