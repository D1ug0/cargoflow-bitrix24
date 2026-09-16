<?php

declare(strict_types=1);

namespace CargoFlow\Core\Tests;

use CargoFlow\Core\Service\MarginCalculator;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class MarginCalculatorTest extends TestCase
{
    public function testCalculatesMarginPercent(): void
    {
        self::assertSame(20.0, (new MarginCalculator())->calculate(100_000, 80_000));
    }

    public function testRejectsZeroPrice(): void
    {
        $this->expectException(InvalidArgumentException::class);
        (new MarginCalculator())->calculate(0, 10);
    }
}

