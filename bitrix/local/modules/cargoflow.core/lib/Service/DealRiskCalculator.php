<?php

declare(strict_types=1);

namespace CargoFlow\Core\Service;

final class DealRiskCalculator
{
    public const LOW = 'LOW';
    public const MEDIUM = 'MEDIUM';
    public const HIGH = 'HIGH';

    public function calculate(float $amount, float $marginPercent, float $discountPercent): string
    {
        $score = 0;
        if ($amount >= 1_000_000) {
            $score += 1;
        }
        if ($marginPercent < 10) {
            $score += 2;
        } elseif ($marginPercent <= 15) {
            $score += 1;
        }
        if ($discountPercent >= 15) {
            $score += 2;
        } elseif ($discountPercent >= 7) {
            $score += 1;
        }

        return match (true) {
            $score >= 4 => self::HIGH,
            $score >= 2 => self::MEDIUM,
            default => self::LOW,
        };
    }
}

