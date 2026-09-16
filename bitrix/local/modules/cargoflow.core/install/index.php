<?php

declare(strict_types=1);

use Bitrix\Main\Application;
use Bitrix\Main\EventManager;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\ModuleManager;

Loc::loadMessages(__FILE__);

final class cargoflow_core extends CModule
{
    public $MODULE_ID = 'cargoflow.core';
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;
    public $MODULE_NAME = 'CargoFlow Core';
    public $MODULE_DESCRIPTION = 'Расчёт рисков и аудит изменений логистических сделок.';
    public $PARTNER_NAME = 'CargoFlow';

    public function __construct()
    {
        $version = [];
        include __DIR__ . '/version.php';
        $this->MODULE_VERSION = $arModuleVersion['VERSION'] ?? '0.1.0';
        $this->MODULE_VERSION_DATE = $arModuleVersion['VERSION_DATE'] ?? '';
    }

    public function DoInstall(): void
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->installDatabase();
        EventManager::getInstance()->registerEventHandler(
            'crm',
            'OnAfterCrmDealUpdate',
            $this->MODULE_ID,
            '\\CargoFlow\\Core\\Event\\DealEventHandler',
            'onAfterUpdate',
        );
    }

    public function DoUninstall(): void
    {
        EventManager::getInstance()->unRegisterEventHandler(
            'crm',
            'OnAfterCrmDealUpdate',
            $this->MODULE_ID,
            '\\CargoFlow\\Core\\Event\\DealEventHandler',
            'onAfterUpdate',
        );
        $this->uninstallDatabase();
        ModuleManager::unRegisterModule($this->MODULE_ID);
    }

    private function installDatabase(): void
    {
        $connection = Application::getConnection();
        if (!$connection->isTableExists('cargoflow_integration_audit')) {
            $connection->queryExecute(<<<'SQL'
CREATE TABLE cargoflow_integration_audit (
  ID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  DEAL_ID INT UNSIGNED NOT NULL,
  EVENT_TYPE VARCHAR(100) NOT NULL,
  RISK_LEVEL VARCHAR(20) NULL,
  PAYLOAD LONGTEXT NULL,
  CREATED_AT DATETIME NOT NULL,
  PRIMARY KEY (ID),
  INDEX IX_CF_AUDIT_DEAL (DEAL_ID),
  INDEX IX_CF_AUDIT_CREATED (CREATED_AT)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL);
        }
    }

    private function uninstallDatabase(): void
    {
        if (($_REQUEST['savedata'] ?? 'Y') !== 'Y') {
            Application::getConnection()->queryExecute('DROP TABLE IF EXISTS cargoflow_integration_audit');
        }
    }
}

