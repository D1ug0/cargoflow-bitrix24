# 09. Webhook Bitrix24

Исходящее событие приходит как `application/x-www-form-urlencoded` с вложенными полями. Endpoint
`POST /webhooks/bitrix` принимает `ONCRMDEALADD` и `ONCRMDEALUPDATE`, проверяет структуру и
сравнивает `auth[application_token]` с `BITRIX_APPLICATION_TOKEN` через постоянное по времени
сравнение SHA-256.

Обработчик строит отпечаток события, захватывает ключ Valkey командой `SET NX EX`, сохраняет
событие и отвечает `202`. Повтор возвращает `202` со статусом `ignored`. Публикация идёт через
outbox, поэтому недоступность RabbitMQ не уничтожает принятое событие.

Для локального исходящего webhook укажите публичный HTTPS-адрес обработчика и скопируйте показанный
Bitrix24 токен. Для OAuth-приложения подпишите обработчик на события через `event.bind`: обычный
входящий webhook не даёт контекст приложения для `event.bind`. Событие передаёт только ID сделки,
после чего worker вызывает `crm.item.get`.

Проверьте неверный токен, некорректное тело, дубль, отказ Redis/RabbitMQ и настоящее обновление.
Официальная документация: https://apidocs.bitrix24.com/local-integrations/local-webhooks.html
