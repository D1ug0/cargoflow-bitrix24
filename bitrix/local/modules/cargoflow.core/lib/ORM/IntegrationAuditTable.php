<?php

declare(strict_types=1);

namespace CargoFlow\Core\ORM;

use Bitrix\Main\Entity;
use Bitrix\Main\ORM\Data\DataManager;
use Bitrix\Main\ORM\Fields;

final class IntegrationAuditTable extends DataManager
{
    public static function getTableName(): string
    {
        return 'cargoflow_integration_audit';
    }

    public static function getMap(): array
    {
        return [
            (new Fields\IntegerField('ID'))->configurePrimary()->configureAutocomplete(),
            (new Fields\IntegerField('DEAL_ID'))->configureRequired(),
            (new Fields\StringField('EVENT_TYPE'))->configureRequired()->configureSize(100),
            (new Fields\StringField('RISK_LEVEL'))->configureSize(20),
            new Fields\TextField('PAYLOAD'),
            (new Fields\DatetimeField('CREATED_AT'))
                ->configureRequired()
                ->configureDefaultValue(static fn() => new \Bitrix\Main\Type\DateTime()),
        ];
    }
}

