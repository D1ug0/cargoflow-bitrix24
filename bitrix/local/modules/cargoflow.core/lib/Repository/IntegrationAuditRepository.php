<?php

declare(strict_types=1);

namespace CargoFlow\Core\Repository;

use CargoFlow\Core\ORM\IntegrationAuditTable;
use JsonException;

final class IntegrationAuditRepository
{
    /** @param array<string, mixed> $payload */
    public function add(int $dealId, string $eventType, ?string $riskLevel, array $payload): void
    {
        IntegrationAuditTable::add([
            'DEAL_ID' => $dealId,
            'EVENT_TYPE' => $eventType,
            'RISK_LEVEL' => $riskLevel,
            'PAYLOAD' => $this->encode($payload),
        ])->throwException();
    }

    /** @param array<string, mixed> $payload */
    private function encode(array $payload): string
    {
        try {
            return json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        } catch (JsonException) {
            return '{}';
        }
    }
}

