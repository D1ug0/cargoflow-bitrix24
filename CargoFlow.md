# CargoFlow — учебная Bitrix24 Integration Platform для транспортной компании

## 1. Цель проекта

Создать учебный, но максимально приближенный к реальному корпоративному проект на базе Bitrix24 для транспортной компании.

Проект должен демонстрировать навыки:

- настройки Bitrix24;
- проектирования CRM;
- создания воронок;
- настройки карточек и пользовательских полей;
- настройки ролей и прав;
- работы с роботами;
- работы с триггерами;
- проектирования бизнес-процессов;
- работы с REST API Bitrix24;
- работы с webhooks;
- интеграции Bitrix24 с внешними системами;
- разработки на PHP;
- работы с Bitrix Framework и D7;
- разработки backend на TypeScript;
- работы с PostgreSQL;
- работы с очередями;
- работы с Redis/Valkey;
- разработки frontend на Vue/Nuxt;
- логирования;
- мониторинга;
- тестирования;
- Docker;
- CI/CD;
- Git;
- технической документации.

Проект предназначен прежде всего для:

1. изучения Bitrix24;
2. получения практики интегратора;
3. получения практики Bitrix-разработчика;
4. создания сильного GitHub-кейса;
5. подготовки к техническим интервью.

---

# 2. Основной принцип разработки

Основным техническим помощником проекта является Codex.

Codex должен выполнять значительную часть разработки, но проект строится так, чтобы разработчик понимал происходящее.

Недопустимый сценарий:

```text
Codex написал весь проект
↓
проект запустился
↓
разработчик не понимает архитектуру
```

Целевой процесс:

```text
Задача
↓
Codex объясняет её смысл
↓
Codex анализирует Bitrix24
↓
Codex предлагает архитектуру
↓
Codex реализует
↓
разработчик запускает
↓
результат проверяется
↓
ошибки разбираются
↓
решение документируется
↓
Git commit
```

---

# 3. Бизнес-контекст

CargoFlow имитирует работу транспортной компании, которая занимается автомобильными грузоперевозками.

Компания имеет:

- отдел продаж;
- логистов;
- руководителей;
- бухгалтерию;
- собственный автопарк;
- водителей;
- HR;
- внешние информационные системы.

Основным центром работы сотрудников является Bitrix24.

---

# 4. Основной бизнес-процесс

Клиент оставляет заявку на перевозку.

Пример:

```text
Клиент:
ООО «Ромашка»

Маршрут:
Москва → Казань

Груз:
охлаждённые продукты

Вес:
8 тонн

Температура:
+2…+6 °C

Дата погрузки:
20.09.2026
```

После этого перевозка проходит этапы:

```text
Новая заявка
↓
Расчёт стоимости
↓
Предложение отправлено
↓
Согласование
↓
Поиск транспорта
↓
Транспорт назначен
↓
На погрузке
↓
В пути
↓
Доставлено
↓
Документы
↓
Закрыто
```

---

# 5. Архитектура системы

Целевая архитектура:

```text
                         BITRIX24

            CRM / Robots / Triggers / BP
                     PHP / D7
                         │
                  REST / Webhooks
                         │
                         ▼
              ┌─────────────────────┐
              │  Integration API    │
              │ NestJS + TypeScript │
              └──────────┬──────────┘
                         │
          ┌──────────────┼───────────────┐
          │              │               │
          ▼              ▼               ▼
     PostgreSQL      RabbitMQ       Redis/Valkey
                         │
                         ▼
                Integration Worker
                         │
                         ▼
                  Fleet Domain
                         │
                         ▼
                  Nuxt Dashboard
```

Дополнительно:

```text
Bitrix On-Premise
↓
PHP
↓
Bitrix D7
↓
MySQL
```

---

# 6. Технологический стек

## Bitrix

- Bitrix24 Cloud — начальный этап;
- Bitrix24 On-Premise — продвинутый этап;
- Bitrix Framework;
- D7;
- PHP 8.2+;
- MySQL 8;
- REST API;
- webhooks;
- CRM;
- роботы;
- триггеры;
- бизнес-процессы.

---

## Backend

- Node.js;
- TypeScript;
- NestJS.

Используется для:

- Integration API;
- обработки webhook;
- бизнес-логики;
- работы с Bitrix24 REST API;
- работы с очередями;
- фоновых задач;
- интеграций.

---

## Frontend

- Nuxt;
- Vue 3;
- TypeScript;
- Pinia;
- Tailwind CSS;
- Zod.

---

## Database

Основная БД внешней части:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

---

## Messaging

```text
RabbitMQ
```

Используется для:

- асинхронной обработки;
- интеграционных событий;
- retry;
- фоновых задач.

---

## Cache / locks

```text
Redis или Valkey
```

Используется для:

- idempotency;
- cache;
- distributed locks;
- временных данных.

---

## Infrastructure

- Docker;
- Docker Compose;
- nginx;
- GitHub Actions.

---

## Observability

- OpenTelemetry;
- Prometheus;
- Grafana;
- Loki;
- Sentry.

---

## Tests

TypeScript:

- Vitest;
- integration tests.

PHP:

- PHPUnit;
- PHPStan.

---

## Repository

- pnpm;
- Turborepo;
- monorepo.

---

## AI development

- Codex;
- Bitrix24 MCP;
- AGENTS.md.

---

# 7. Структура monorepo

```text
cargoflow/

├── apps/
│   ├── dashboard/
│   │   └── Nuxt
│   │
│   ├── integration-api/
│   │   └── NestJS
│   │
│   └── integration-worker/
│       └── NestJS worker
│
├── packages/
│   ├── contracts/
│   ├── shared/
│   ├── config/
│   └── database/
│
├── bitrix/
│   └── local/
│       └── modules/
│           └── cargoflow.core/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── prometheus/
│   ├── grafana/
│   └── loki/
│
├── docs/
│
├── screenshots/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
├── AGENTS.md
├── .env.example
└── README.md
```

---

# 8. CRM Bitrix24

Создать направление:

```text
Грузоперевозки
```

Стадии:

1. Новая заявка
2. Расчёт стоимости
3. Предложение отправлено
4. Согласование
5. Поиск транспорта
6. Транспорт назначен
7. На погрузке
8. В пути
9. Доставлено
10. Документы
11. Успешно закрыто

Неуспешные:

- отказ клиента;
- невозможно выполнить;
- проиграно.

---

# 9. Карточка перевозки

## Клиент

- компания;
- контакт;
- телефон;
- email.

## Маршрут

- город погрузки;
- адрес погрузки;
- город выгрузки;
- адрес выгрузки;
- расстояние.

## Груз

- название;
- тип;
- вес;
- объём;
- температурный режим;
- опасный груз.

## Перевозка

- дата погрузки;
- дата доставки;
- срочность;
- тип автомобиля.

Тип:

```text
Тент
Рефрижератор
Изотерм
Фургон
```

## Автомобиль

- vehicleId;
- госномер;
- водитель;
- телефон водителя.

## Финансы

- стоимость;
- себестоимость;
- маржинальность;
- скидка;
- статус оплаты.

## Интеграция

- externalTripId;
- integrationStatus;
- lastSyncAt;
- integrationError.

---

# 10. Роли и права

Создать:

```text
Менеджер
Логист
Руководитель
Бухгалтер
Администратор
```

## Менеджер

Работает с клиентом и коммерческими данными.

## Логист

Работает с маршрутом, автомобилем и перевозкой.

## Руководитель

Видит процессы отдела и выполняет согласования.

## Бухгалтер

Работает с финансовыми данными и документами.

## Администратор

Полный доступ.

---

# 11. Роботы

## Robot 1

Стадия:

```text
Расчёт стоимости
```

Создать задачу:

```text
Рассчитать стоимость перевозки
```

---

## Robot 2

Стадия:

```text
Поиск транспорта
```

Создать задачу логисту.

В задачу передать:

- маршрут;
- вес;
- дату;
- тип машины;
- температурный режим.

---

## Robot 3

После назначения транспорта уведомить ответственных сотрудников.

---

## Robot 4

При длительном нахождении сделки на стадии создавать напоминание.

---

# 12. Триггеры

Триггеры должны использоваться для событий извне.

Пример:

```text
Fleet System:
IN_TRANSIT
```

↓

```text
Bitrix:
В пути
```

Пример:

```text
Fleet System:
DELIVERED
```

↓

```text
Bitrix:
Доставлено
```

---

# 13. Бизнес-процесс согласования

Условия:

```text
Маржинальность > 15%
→ автоматическое продолжение

10–15%
→ руководитель

< 10%
→ руководитель
→ директор
```

Результат:

```text
APPROVED
REJECTED
```

При отказе:

- уведомить менеджера;
- записать причину;
- вернуть сделку.

---

# 14. Integration API

Создать:

```text
apps/integration-api
```

Стек:

```text
NestJS
TypeScript
```

Ответственность:

- принимать webhooks Bitrix;
- вызывать REST API Bitrix;
- работать с Fleet Domain;
- публиковать события;
- сохранять интеграционные данные;
- предоставлять REST API.

---

# 15. API документация

Использовать:

```text
OpenAPI / Swagger
```

Документировать:

- endpoints;
- request;
- response;
- ошибки;
- authentication.

---

# 16. Validation

Использовать:

- DTO NestJS;
- class-validator либо Zod.

Невалидные запросы должны завершаться предсказуемой ошибкой.

---

# 17. Fleet Domain

Fleet Domain имитирует систему управления транспортом.

Сущности:

```text
Vehicle
Driver
Trip
```

---

# 18. Vehicle

Поля:

```text
id
plateNumber
type
capacity
status
city
driverId
```

Статусы:

```text
AVAILABLE
IN_TRIP
SERVICE
UNAVAILABLE
```

---

# 19. Driver

Поля:

```text
id
name
phone
licenseCategories
status
```

---

# 20. Trip

Поля:

```text
id
bitrixDealId
vehicleId
driverId
from
to
loadingDate
deliveryDate
status
```

Статусы:

```text
CREATED
ASSIGNED
LOADING
IN_TRANSIT
DELIVERED
CLOSED
CANCELLED
```

---

# 21. REST Fleet API

Реализовать:

```text
GET /vehicles
```

```text
GET /vehicles/available
```

```text
GET /vehicles/:id
```

```text
POST /trips
```

```text
GET /trips/:id
```

```text
PATCH /trips/:id/status
```

---

# 22. PostgreSQL

Таблицы:

```text
vehicles
drivers
trips
integration_events
integration_logs
```

Работа через Prisma.

---

# 23. Prisma

Использовать:

```text
Prisma Schema
Migrations
Seed
Prisma Client
```

Создать seed с тестовыми машинами и водителями.

---

# 24. Bitrix → Integration API

Bitrix24 должен уметь отправлять события:

```text
deal created
deal updated
stage changed
```

Integration API получает webhook.

Пример:

```text
POST /webhooks/bitrix
```

---

# 25. Integration API → Bitrix24

Реализовать клиент Bitrix24.

Пример структуры:

```text
src/integrations/bitrix/

bitrix.module.ts
bitrix.client.ts
bitrix.service.ts
bitrix.types.ts
```

Методы:

- получение сделки;
- обновление сделки;
- работа со стадиями;
- работа с пользовательскими полями.

---

# 26. RabbitMQ

Интеграционные операции не должны выполняться только синхронно.

Пример:

```text
Bitrix webhook
↓
Integration API
↓
RabbitMQ
↓
Trip Worker
↓
Fleet Domain
```

События:

```text
trip.create
trip.update
trip.status.changed
bitrix.deal.update
```

---

# 27. Worker

Создать:

```text
apps/integration-worker
```

Worker должен:

- читать RabbitMQ;
- выполнять задачи;
- обрабатывать ошибки;
- выполнять retry;
- логировать результат.

---

# 28. Retry

Пример:

```text
Attempt 1
↓
error

Attempt 2
↓
error

Attempt 3
↓
success
```

Использовать exponential backoff.

---

# 29. Dead Letter Queue

Если задача окончательно не выполнена:

```text
main queue
↓
retry
↓
retry
↓
retry
↓
DLQ
```

Задача не должна теряться.

---

# 30. Redis / Valkey

Использовать для:

## Idempotency

Если один webhook пришёл дважды:

```text
eventId = BX-10023
```

первый:

```text
processed
```

второй:

```text
ignored
```

---

## Locks

Не допускать одновременного изменения одного и того же рейса.

---

## Cache

Кэшировать редко меняющиеся данные.

---

# 31. Integration Logs

Хранить:

```text
id
correlationId
source
eventType
request
response
status
error
createdAt
```

---

# 32. Correlation ID

Каждая интеграционная операция должна иметь:

```text
correlationId
```

Пример:

```text
Bitrix
↓
Integration API
↓
RabbitMQ
↓
Worker
↓
Fleet
```

Во всех логах используется один ID.

---

# 33. Error Handling

Обработать:

```text
400
401
403
404
409
422
429
500
503
Timeout
Network Error
```

Ошибки должны быть:

- логируемыми;
- понятными;
- диагностируемыми.

---

# 34. Nuxt Dashboard

Создать:

```text
apps/dashboard
```

Стек:

```text
Nuxt
Vue 3
TypeScript
Pinia
Tailwind
```

---

# 35. Dashboard

Главная страница:

```text
Активные рейсы

Свободный транспорт

Транспорт в сервисе

Количество ошибок интеграции
```

---

# 36. Vehicles page

```text
/vehicles
```

Функции:

- список;
- статус;
- водитель;
- фильтрация;
- поиск.

---

# 37. Trips page

```text
/trips
```

Функции:

- список рейсов;
- маршрут;
- автомобиль;
- водитель;
- статус;
- связь с Bitrix deal.

---

# 38. Integration page

```text
/integrations
```

Показывать:

```text
timestamp
source
event
status
attempts
error
correlationId
```

---

# 39. PHP часть

После основной интеграции добавить PHP.

Создать:

```text
bitrix/local/modules/cargoflow.core
```

---

# 40. Bitrix module

Структура:

```text
cargoflow.core/

├── install/
├── lib/
│   ├── Service/
│   ├── Event/
│   ├── Repository/
│   └── ORM/
├── admin/
├── include.php
└── options.php
```

---

# 41. PHP Services

Пример:

```text
MarginCalculator
DealRiskCalculator
```

---

# 42. DealRiskCalculator

Пример:

```text
сумма высокая
+
маржа низкая
+
скидка высокая
↓
HIGH
```

Результаты:

```text
LOW
MEDIUM
HIGH
```

---

# 43. Bitrix Events

Добавить Event Handler.

Пример:

```text
Deal Updated
↓
DealEventHandler
↓
Risk Calculator
↓
Audit
```

---

# 44. D7 ORM

Создать ORM entity.

Пример:

```text
IntegrationAuditTable
```

Сохранять историю изменений.

---

# 45. MySQL

Использовать как БД коробочного Bitrix24.

Разработчик должен познакомиться с:

- таблицами Bitrix;
- D7 ORM;
- миграционной логикой модуля.

---

# 46. Observability

## OpenTelemetry

Добавить tracing.

---

## Prometheus

Метрики:

```text
http_requests_total
http_errors_total
queue_jobs_total
queue_jobs_failed
webhook_processing_time
```

---

## Grafana

Dashboard:

```text
API traffic
Errors
Latency
RabbitMQ queues
Webhook processing
```

---

# 47. Loki

Централизованные логи.

---

# 48. Sentry

Отслеживание application exceptions.

---

# 49. Docker

Разработка должна запускаться через:

```text
docker compose up
```

Поднять:

```text
PostgreSQL
RabbitMQ
Redis
Integration API
Worker
Dashboard
Prometheus
Grafana
Loki
nginx
```

---

# 50. Health checks

Добавить:

```text
GET /health
```

Проверять:

```text
PostgreSQL
RabbitMQ
Redis
```

---

# 51. nginx

Использовать как reverse proxy.

Пример:

```text
/api
→ NestJS

/
→ Nuxt
```

---

# 52. CI/CD

GitHub Actions.

Pipeline:

```text
install
↓
lint
↓
typecheck
↓
test
↓
build
```

Дополнительно:

```text
PHPStan
PHPUnit
Docker build
```

---

# 53. Testing

## Unit

Тестировать:

```text
DealRiskCalculator
MarginCalculator
Trip Service
```

## Integration

Тестировать:

```text
POST /trips
Bitrix webhook
RabbitMQ worker
```

## Failure scenarios

Тестировать:

```text
Fleet unavailable
RabbitMQ unavailable
Bitrix timeout
duplicate webhook
invalid payload
```

---

# 54. Документация

Каталог:

```text
docs/
```

---

# 55. Документы

```text
01-overview.md
02-architecture.md
03-bitrix-crm.md
04-permissions.md
05-robots.md
06-triggers.md
07-business-processes.md
08-bitrix-rest.md
09-webhooks.md
10-integration-api.md
11-rabbitmq.md
12-redis.md
13-fleet-domain.md
14-errors.md
15-observability.md
16-testing.md
17-deployment.md
```

---

# 56. Architecture Decision Records

Создать:

```text
docs/adr/
```

Например:

```text
001-use-nestjs.md
002-use-rabbitmq.md
003-use-postgresql.md
004-use-redis-for-idempotency.md
```

Каждый ADR:

```text
Problem
Decision
Alternatives
Reason
Consequences
```

---

# 57. Screenshots

Сохранять:

```text
screenshots/
```

## Bitrix

- CRM pipeline;
- deal card;
- fields;
- permissions;
- robots;
- triggers;
- business process.

## Dashboard

- overview;
- vehicles;
- trips;
- integrations.

## Monitoring

- Grafana;
- RabbitMQ.

---

# 58. README

README должен включать:

- описание;
- архитектуру;
- стек;
- screenshots;
- запуск;
- Bitrix24 setup;
- environment variables;
- API;
- testing;
- roadmap.

---

# 59. AGENTS.md

Codex обязан соблюдать правила проекта.

---

# 60. Правила Codex

Перед крупной задачей:

1. изучить существующий код;
2. изучить ТЗ;
3. определить затрагиваемые модули;
4. проверить Bitrix API через актуальную документацию/MCP;
5. объяснить задачу простыми словами;
6. предложить план;
7. только после этого писать код.

После:

1. запустить lint;
2. typecheck;
3. tests;
4. объяснить изменения;
5. описать проверку;
6. обновить документацию;
7. предложить commit.

---

# 61. Формат запроса к Codex

```text
Мы продолжаем проект CargoFlow.

Задача:
[описание]

Перед реализацией:

1. Объясни простыми словами, что мы делаем.
2. Объясни, какая часть относится к Bitrix24.
3. Объясни, какая часть относится к нашему приложению.
4. Проверь актуальную документацию Bitrix24.
5. Предложи небольшой план.

После этого реализуй задачу.

После реализации:

1. перечисли изменённые файлы;
2. объясни основные изменения;
3. запусти проверки;
4. дай инструкции тестирования;
5. перечисли возможные ошибки;
6. обнови документацию;
7. предложи commit message;
8. скажи, какие screenshots сохранить.
```

---

# 62. Этапы разработки

Проект нельзя реализовывать целиком сразу.

---

## Phase 1 — MVP Bitrix

Приоритет:

```text
MVP
```

Сделать:

- Bitrix24;
- CRM;
- воронку;
- поля;
- карточку;
- роли;
- права;
- тестовые сделки.

---

## Phase 2 — Automation

```text
MVP
```

Сделать:

- роботы;
- триггеры;
- бизнес-процесс.

---

## Phase 3 — First REST Integration

```text
MVP
```

Сделать:

- Bitrix REST;
- webhook;
- получение сделки;
- обновление сделки.

---

## Phase 4 — Core Backend

```text
MVP
```

Создать:

- monorepo;
- NestJS;
- PostgreSQL;
- Prisma;
- Fleet entities.

---

## Phase 5 — Bitrix ↔ Fleet

```text
MVP
```

Реализовать:

```text
Bitrix
→ Integration API
→ Fleet
```

и обратно.

---

## Phase 6 — Dashboard

```text
MVP
```

Nuxt dashboard.

---

## Phase 7 — Messaging

```text
ADVANCED
```

Добавить:

- RabbitMQ;
- worker;
- retries;
- DLQ.

---

## Phase 8 — Redis

```text
ADVANCED
```

Добавить:

- idempotency;
- locks;
- cache.

---

## Phase 9 — Bitrix PHP

```text
ADVANCED
```

Добавить:

- коробочный Bitrix;
- PHP;
- D7;
- module;
- events;
- ORM.

---

## Phase 10 — Observability

```text
ADVANCED
```

Добавить:

- OpenTelemetry;
- Prometheus;
- Grafana;
- Loki;
- Sentry.

---

## Phase 11 — Infrastructure

```text
ADVANCED
```

Добавить:

- Docker Compose;
- nginx;
- GitHub Actions.

---

## Phase 12 — Kubernetes

```text
OPTIONAL
```

Дополнительный этап:

```text
Kubernetes
Helm
```

Перенести сервисы из Docker Compose.

Не является обязательной частью Bitrix-проекта.

---

# 63. Definition of Done

Каждая задача считается завершённой только если:

- функция работает;
- есть понятный способ проверки;
- ошибки обработаны;
- тесты проходят;
- код понятен;
- документация обновлена;
- необходимые screenshots сохранены;
- подготовлен Git commit.

---

# 64. Git workflow

Основная ветка:

```text
main
```

Разработка:

```text
feature/bitrix-crm
feature/fleet-api
feature/rabbitmq
feature/dashboard
```

Commits:

```text
feat: configure logistics pipeline

feat: add fleet trip API

feat: process Bitrix deal webhooks

feat: add RabbitMQ trip worker

feat: prevent duplicate webhook processing

docs: describe Bitrix CRM configuration

test: cover trip creation flow
```

---

# 65. Environment Variables

Не хранить secrets в Git.

Создать:

```text
.env.example
```

Например:

```text
DATABASE_URL=

REDIS_URL=

RABBITMQ_URL=

BITRIX_WEBHOOK_URL=

BITRIX_CLIENT_ID=

BITRIX_CLIENT_SECRET=

SENTRY_DSN=
```

---

# 66. Security

Запрещено:

- хранить Bitrix webhook token в коде;
- коммитить `.env`;
- выводить secrets в logs;
- отдавать внутренние ошибки пользователю.

---

# 67. Что должно быть видно в GitHub

GitHub должен показывать не только исходный код.

Должно быть видно:

```text
Bitrix CRM configuration
↓
Screenshots

Automation
↓
Screenshots + docs

Architecture
↓
Diagrams

Backend
↓
Code

Integration
↓
REST + Webhooks

Infrastructure
↓
Docker

Quality
↓
Tests + CI

Operations
↓
Monitoring
```

---

# 68. Что разработчик должен уметь объяснить

После проекта необходимо уметь объяснить:

## Bitrix24

- что такое CRM;
- что такое сделка;
- что такое направление;
- как устроены стадии;
- пользовательские поля;
- роли;
- права;
- роботы;
- триггеры;
- бизнес-процессы.

## Integration

- REST;
- webhook;
- inbound/outbound flow;
- retries;
- idempotency;
- queue;
- DLQ.

## Backend

- NestJS modules;
- DI;
- services;
- controllers;
- workers.

## Database

- PostgreSQL;
- Prisma;
- migrations;
- relations.

## Bitrix development

- PHP;
- D7;
- events;
- ORM;
- modules.

## Infrastructure

- Docker;
- CI;
- metrics;
- logs;
- tracing.

---

# 69. Что проект должен показывать работодателю

CargoFlow должен демонстрировать, что разработчик способен:

- разобраться в бизнес-процессе;
- перевести его в CRM;
- настроить Bitrix24;
- автоматизировать процесс;
- выбрать между стандартным функционалом и кодом;
- разработать интеграцию;
- работать с REST API;
- работать с webhooks;
- обрабатывать ошибки;
- диагностировать проблемы;
- читать чужой код;
- работать с PHP;
- работать с TypeScript;
- работать с SQL;
- документировать решение;
- объяснять техническое решение понятным языком.

---

# 70. Итоговый результат

Итоговый проект представляет собой:

```text
Bitrix24
+
CRM
+
Automation
+
Business Processes
+
REST/Webhooks
+
PHP/D7
+
NestJS
+
PostgreSQL
+
RabbitMQ
+
Redis/Valkey
+
Nuxt
+
Docker
+
CI/CD
+
Observability
```

При этом проект развивается постепенно:

```text
сначала Bitrix24
↓
затем интеграция
↓
затем backend
↓
затем устойчивость
↓
затем инфраструктура
```

Главная цель — не использовать максимальное количество технологий ради README, а понять, зачем каждая технология появилась в архитектуре и какую проблему она решает.
