# CargoFlow

CargoFlow — учебная интеграционная платформа для транспортной компании на базе Bitrix24. Проект
объединяет воспроизводимую настройку CRM, Integration API на NestJS, Fleet Domain на
PostgreSQL/Prisma, worker с RabbitMQ, идемпотентность и блокировки в Redis/Valkey, операционный
dashboard на Nuxt, модуль Bitrix D7 и наблюдаемое Docker-окружение.

## Что уже реализовано

- Независимая от конкретного портала спецификация направления **Грузоперевозки**: стадии,
  поля карточки, роли, роботы, триггеры, согласование и тестовая сделка.
- Fleet API: список и фильтрация транспорта, свободные машины, создание и просмотр рейсов,
  контролируемые переходы между статусами.
- Приём исходящих событий Bitrix24: валидация, безопасная проверка токена, идемпотентность через
  Redis, `correlationId`, журнал интеграции и транзакционный outbox.
- Клиент актуальных методов `crm.item.get`, `crm.item.update` и `crm.item.fields` для сделок
  (`entityTypeId = 2`).
- RabbitMQ worker с устойчивыми очередями, ручным подтверждением, экспоненциальными повторами и
  Dead Letter Queue.
- Dashboard на Nuxt 4, Vue 3, Pinia и Tailwind CSS: обзор, транспорт, рейсы и журнал интеграции.
- PostgreSQL schema, миграция и seed; Prometheus, Grafana, Loki, nginx и Docker Compose.
- Модуль для коробочного Bitrix: D7 ORM-аудит, обработчик событий, расчёт маржи/риска и PHP-тесты.

Настройки CRM нельзя безопасно применить без доступа к учебному порталу: идентификаторы, тариф и
права различаются. Точная инструкция находится в
[docs/03-bitrix-crm.md](docs/03-bitrix-crm.md), а полученные ID сохраняются только в `.env`.

## Архитектура

```text
Bitrix24 CRM --исходящий webhook--> Integration API --outbox--> RabbitMQ
      ^                                  |                         |
      |                                  v                         v
      +----------- crm.item.* ------- PostgreSQL <------------ Worker
                                         ^                         |
                                         |                         v
Nuxt Dashboard <---- nginx /api ---------+                   Redis/Valkey
```

Границы систем и сценарии отказов описаны в
[docs/02-architecture.md](docs/02-architecture.md).

## Технологии

Node.js 22, pnpm, Turborepo, NestJS, TypeScript, Nuxt 4, Vue 3, Pinia, Tailwind CSS,
PostgreSQL, Prisma, RabbitMQ, Valkey, PHP 8.2, Bitrix D7, Prometheus, Grafana, Loki, nginx,
Vitest, PHPUnit, PHPStan, Docker Compose и GitHub Actions.

## Быстрый запуск

Понадобится Docker с Compose. Для разработки без контейнеров нужны Node.js 22 и pnpm 10.

```bash
cp .env.example .env
docker compose up --build
```

После запуска доступны:

- dashboard: `http://localhost:8080`;
- Swagger: `http://localhost:8080/api/docs`;
- RabbitMQ: `http://localhost:15672` (`cargoflow` / `cargoflow` только для локальной разработки);
- Prometheus: `http://localhost:9090`;
- Grafana: `http://localhost:3002` (`admin` / `admin` по умолчанию).

Fleet API и dashboard работают без реквизитов Bitrix24. Синхронизация с порталом начнётся только
после заполнения `BITRIX_WEBHOOK_URL`, `BITRIX_APPLICATION_TOKEN`, кодов полей и стадий. Пока URL
портала не задан, worker безопасно подтверждает локальные события, не отправляя их в DLQ.

### Запуск без Docker для приложений

Сначала запустите PostgreSQL, RabbitMQ и Valkey, укажите доступные с хоста адреса в `.env`, затем:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Примеры API

```bash
curl http://localhost:8080/api/vehicles/available

curl -X POST http://localhost:8080/api/trips \
  -H 'content-type: application/json' \
  -d '{
    "bitrixDealId": 1001,
    "from": "Москва",
    "to": "Казань",
    "loadingDate": "2026-09-20T05:00:00.000Z",
    "deliveryDate": "2026-09-21T11:00:00.000Z"
  }'
```

Полный контракт и модели ошибок находятся в Swagger. Пример события Bitrix24 и проверка токена
описаны в [docs/09-webhooks.md](docs/09-webhooks.md).

## Переменные окружения

Скопируйте `.env.example`, но не записывайте в него настоящие секреты:

- `DATABASE_URL`, `RABBITMQ_URL`, `REDIS_URL` — инфраструктура;
- `BITRIX_WEBHOOK_URL` — приватный адрес входящего webhook для REST-вызовов;
- `BITRIX_APPLICATION_TOKEN` — ожидаемый токен исходящих событий;
- `BITRIX_FIELD_*`, `BITRIX_STAGE_*` — ID, полученные после настройки портала;
- `NUXT_PUBLIC_API_BASE` — адрес API, доступный браузеру;
- `SENTRY_DSN`, `OTEL_EXPORTER_OTLP_ENDPOINT` — зарезервированные необязательные экспортёры.

## Проверки качества

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose config
```

Проверки PHP-модуля:

```bash
cd bitrix/local/modules/cargoflow.core
composer install
composer test
composer phpstan
```

## Документация

Нумерованные файлы в `docs/` описывают CRM, права, автоматизацию, REST/webhook, очереди, Redis,
правила Fleet Domain, ошибки, мониторинг, тестирование и запуск. Архитектурные решения хранятся в
`docs/adr/`.

## Скриншоты

Список доказательных скриншотов находится в
[screenshots/README.md](screenshots/README.md). На снимках нельзя оставлять токены, персональные
данные, документы клиентов и внутренние адреса.

## Следующие этапы

- Применить и проверить Phase 1 в учебном портале Bitrix24.
- Подключить реальные исходящие события и проверить критический путь Bitrix24 ↔ Fleet.
- Добавить хранение OAuth-токенов для распространяемого приложения Bitrix24.
- Подключить OpenTelemetry и Sentry после выбора реальных endpoint/проекта.
- Добавить интеграционные тесты с временными PostgreSQL, RabbitMQ и Valkey.
- Проверить D7-модуль внутри лицензированной тестовой коробочной установки.
