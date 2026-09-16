# 10. Integration API

Swagger доступен по `/docs` напрямую и `/api/docs` через nginx.

| Метод   | Путь                    | Назначение                              |
| ------- | ----------------------- | --------------------------------------- |
| `GET`   | `/health`               | готовность PostgreSQL, RabbitMQ и Redis |
| `GET`   | `/metrics`              | метрики Prometheus                      |
| `GET`   | `/vehicles`             | список и фильтрация транспорта          |
| `GET`   | `/vehicles/available`   | свободные машины                        |
| `GET`   | `/vehicles/:id`         | карточка машины                         |
| `GET`   | `/trips`                | список рейсов                           |
| `POST`  | `/trips`                | создать рейс для сделки Bitrix24        |
| `GET`   | `/trips/:id`            | карточка рейса                          |
| `PATCH` | `/trips/:id/assignment` | назначить свободную машину и водителя   |
| `PATCH` | `/trips/:id/status`     | изменить статус по допустимому переходу |
| `POST`  | `/webhooks/bitrix`      | принять проверенное событие Bitrix24    |
| `GET`   | `/integrations`         | журнал интеграции                       |
| `GET`   | `/dashboard/summary`    | оперативные счётчики                    |
| `GET`   | `/bitrix/deals/:id`     | диагностическое чтение сделки           |
| `GET`   | `/bitrix/deal-fields`   | получить коды полей                     |
| `GET`   | `/bitrix/stages`        | получить стадии направления             |

DTO запрещают неизвестные поля. Ответ содержит `x-correlation-id`; ошибка — `statusCode`, `code`,
безопасное `message`, `correlationId`, время и путь. Внутренние детали 5xx не возвращаются клиенту.
До публичного production-развёртывания добавьте пользовательскую аутентификацию на gateway и
закройте диагностические endpoint; сейчас предметная аутентификация есть только у webhook.
