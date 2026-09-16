<?php

declare(strict_types=1);

namespace CargoFlow\Core\Service;

use InvalidArgumentException;

final class MarginCalculator
{
    public function calculate(float $price, float $cost): float
    {
        if ($price <= 0) {
            throw new InvalidArgumentException('Price must be greater than zero.');
        }
        if ($cost < 0) {
            throw new InvalidArgumentException('Cost cannot be negative.');
        }

        return round((($price - $cost) / $price) * 100, 2);
    }
}

