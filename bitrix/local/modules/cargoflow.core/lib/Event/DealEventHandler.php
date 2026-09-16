<?php

declare(strict_types=1);

namespace CargoFlow\Core\Event;

use Bitrix\Main\Config\Option;
use Bitrix\Main\Loader;
use CargoFlow\Core\Repository\IntegrationAuditRepository;
use CargoFlow\Core\Service\DealRiskCalculator;
use CargoFlow\Core\Service\MarginCalculator;
use Throwable;

final class DealEventHandler
{
    /** @param array<string, mixed> $fields */
    public static function onAfterUpdate(array &$fields): void
    {
        if (!Loader::includeModule('cargoflow.core')) {
            return;
        }
        $dealId = (int) ($fields['ID'] ?? 0);
        if ($dealId <= 0) {
            return;
        }

        try {
            $price = (float) ($fields['OPPORTUNITY'] ?? 0);
            $costField = Option::get('cargoflow.core', 'cost_field', 'UF_CRM_CARGOFLOW_COST');
            $discountField = Option::get('cargoflow.core', 'discount_field', 'UF_CRM_CARGOFLOW_DISCOUNT');
            $cost = (float) ($fields[$costField] ?? 0);
            $discount = (float) ($fields[$discountField] ?? 0);
            $margin = $price > 0 ? (new MarginCalculator())->calculate($price, $cost) : 0.0;
            $risk = (new DealRiskCalculator())->calculate($price, $margin, $discount);

            (new IntegrationAuditRepository())->add($dealId, 'DEAL_UPDATED', $risk, [
                'amount' => $price,
                'cost' => $cost,
                'marginPercent' => $margin,
                'discountPercent' => $discount,
            ]);
        } catch (Throwable $error) {
            AddMessage2Log(sprintf('CargoFlow deal %d audit failed: %s', $dealId, $error->getMessage()), 'cargoflow.core');
        }
    }
}

