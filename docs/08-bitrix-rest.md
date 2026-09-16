# 08. REST API Bitrix24

Новая интеграция использует универсальные методы с `entityTypeId = 2`:

- `crm.item.get` — получить сделку после события;
- `crm.item.update` — изменить поля или стадию;
- `crm.item.fields` — получить описание актуальных полей;
- `crm.category.list` — получить направления;
- `crm.status.list` — получить стадии справочника `DEAL_STAGE_<categoryId>`.

`crm.deal.*` оставлен Bitrix24 для совместимости и не является основным вариантом CargoFlow. ID
полей и стадий различаются между порталами. REST действует с правами владельца входящего webhook,
поэтому нужен отдельный интеграционный пользователь с минимальными правами.

Официальная документация:

- https://apidocs.bitrix24.com/api-reference/crm/deals/
- https://apidocs.bitrix24.com/settings/how-to-call-rest-api/general-principles.html
- https://apidocs.bitrix24.com/first-steps/first-rest-api-call.html

Полный адрес входящего webhook содержит секрет. Храните его только в `BITRIX_WEBHOOK_URL`, не
логируйте и перевыпустите при утечке. Клиент отправляет JSON POST, использует timeout 10 секунд и
передаёт временные ошибки в очередь повторов.

Если `BITRIX_WEBHOOK_URL` не задан, локальные события Fleet обрабатываются без внешнего REST-вызова.
Это позволяет использовать демонстрационный API и dashboard до подключения учебного портала.
