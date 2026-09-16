<?php

declare(strict_types=1);

namespace CargoFlow\Core\Tests;

use CargoFlow\Core\Service\DealRiskCalculator;
use PHPUnit\Framework\TestCase;

final class DealRiskCalculatorTest extends TestCase
{
    public function testHighRiskDeal(): void
    {
        self::assertSame('HIGH', (new DealRiskCalculator())->calculate(2_000_000, 8, 20));
    }

    public function testLowRiskDeal(): void
    {
        self::assertSame('LOW', (new DealRiskCalculator())->calculate(100_000, 25, 0));
    }
}
