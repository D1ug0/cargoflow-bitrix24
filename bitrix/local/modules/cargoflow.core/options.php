<?php

declare(strict_types=1);

use Bitrix\Main\Config\Option;
use Bitrix\Main\HttpApplication;
use Bitrix\Main\Loader;

defined('B_PROLOG_INCLUDED') && B_PROLOG_INCLUDED === true || die();
Loader::includeModule('cargoflow.core');

$moduleId = 'cargoflow.core';
$fields = ['cost_field', 'discount_field'];
if (HttpApplication::getInstance()->getContext()->getRequest()->isPost() && check_bitrix_sessid()) {
    foreach ($fields as $field) {
        Option::set($moduleId, $field, trim((string) ($_POST[$field] ?? '')));
    }
}
?>
<form method="post">
    <?= bitrix_sessid_post() ?>
    <label>Код поля себестоимости<br><input name="cost_field" value="<?= htmlspecialcharsbx(Option::get($moduleId, 'cost_field', 'UF_CRM_CARGOFLOW_COST')) ?>"></label><br><br>
    <label>Код поля скидки<br><input name="discount_field" value="<?= htmlspecialcharsbx(Option::get($moduleId, 'discount_field', 'UF_CRM_CARGOFLOW_DISCOUNT')) ?>"></label><br><br>
    <button type="submit">Сохранить</button>
</form>

