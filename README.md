<div align="center">

# 🚚 CargoFlow

### Bitrix24 Integration Platform for Transport Operations

Учебная интеграционная платформа для автоматизации грузоперевозок  
на базе **Bitrix24 CRM, NestJS, Nuxt, PostgreSQL, RabbitMQ и Redis**.

<br>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt_4-00DC82?style=for-the-badge&logo=nuxt&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## О проекте

**CargoFlow** — учебная интеграционная система для транспортной компании.

Bitrix24 используется как CRM и точка работы менеджеров, а отдельный backend отвечает за транспорт, рейсы, интеграционные события и синхронизацию данных.

Проект моделирует реальный сценарий, в котором CRM связана с внешней системой управления перевозками через REST API, webhooks и очереди сообщений.

Основной фокус проекта:

- интеграция с Bitrix24 REST API;
- обработка исходящих webhook-событий;
- надёжная асинхронная обработка через RabbitMQ;
- идемпотентность и распределённые блокировки;
- отдельный Fleet Domain;
- мониторинг и логирование;
- воспроизводимое Docker-окружение.

---

## Возможности

<table>
<tr>
<td width="50%">

### 🔗 Bitrix24 Integration

Работа с Bitrix24 CRM через:

- REST API;
- входящие webhook;
- исходящие события;
- `crm.item.get`;
- `crm.item.update`;
- `crm.item.fields`.

</td>

<td width="50%">

### 🚛 Fleet Management

Fleet API позволяет:

- получать список транспорта;
- фильтровать автомобили;
- находить свободный транспорт;
- создавать рейсы;
- управлять статусами рейсов.

</td>
</tr>

<tr>
<td width="50%">

### 📨 Event Processing

Интеграционные события проходят через:

- validation;
- idempotency;
- transactional outbox;
- RabbitMQ;
- retry;
- Dead Letter Queue.

</td>

<td width="50%">

### 📊 Operations Dashboard

Nuxt-dashboard содержит:

- обзор системы;
- транспорт;
- рейсы;
- integration log;
- состояние интеграции.

</td>
</tr>

<tr>
<td width="50%">

### 🔒 Reliability

Для защиты интеграционного контура используются:

- correlation ID;
- Redis / Valkey;
- idempotency keys;
- controlled retries;
- transactional outbox.

</td>

<td width="50%">

### 📈 Observability

В инфраструктуру входят:

- Prometheus;
- Grafana;
- Loki;
- структурированные логи;
- метрики сервисов.

</td>
</tr>
</table>

---

## Архитектура

```text
                         ┌─────────────────────┐
                         │      Bitrix24       │
                         │        CRM          │
                         └──────────┬──────────┘
                                    │
                          outgoing webhook
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Integration API   │
                         │       NestJS        │
                         └──────┬───────┬──────┘
                                │       │
                         outbox │       │ REST
                                ▼       ▼
                        ┌──────────┐  PostgreSQL
                        │ RabbitMQ │
                        └────┬─────┘
                             │
                             ▼
                        ┌──────────┐
                        │  Worker  │
                        └────┬─────┘
                             │
                       Redis / Valkey
                             │
                             ▼
                         Bitrix24 API

                               ▲
                               │
                         Fleet / API
                               │
                        ┌──────┴──────┐
                        │ Nuxt Admin  │
                        │  Dashboard  │
                        └─────────────┘
```

Основная идея — отделить CRM от доменной логики транспортной системы.

Bitrix24 отвечает за работу менеджеров и сделки, а CargoFlow — за транспорт, рейсы, интеграцию и обработку событий.

---

## Поток события

Пример сценария:

```text
Сделка изменена в Bitrix24
            ↓
Outgoing Webhook
            ↓
Integration API
            ↓
Validation
            ↓
Idempotency check
            ↓
PostgreSQL transaction
            ↓
Transactional Outbox
            ↓
RabbitMQ
            ↓
Worker
            ↓
Fleet Domain / Bitrix24
```

Такой подход позволяет не терять события при временной недоступности внешних сервисов.

---

## Integration API

API принимает события от Bitrix24 и выполняет:

```text
request validation
token validation
idempotency
correlation ID
integration logging
transactional outbox
```

Поддерживаются актуальные Bitrix24 REST-методы для сделок:

```text
crm.item.get
crm.item.update
crm.item.fields
```

Для сделок используется:

```text
entityTypeId = 2
```

---

## RabbitMQ Worker

Асинхронный worker обрабатывает события из RabbitMQ.

Используются:

```text
durable queues
manual acknowledgements
exponential retry
dead letter queue
correlation ID
```

Если Bitrix24 временно недоступен, событие может быть повторно обработано без потери исходных данных.

---

## Idempotency

Повторная доставка одного события не должна приводить к повторной бизнес-операции.

Для этого используется Redis / Valkey.

```text
Bitrix Event
      ↓
Idempotency Key
      ↓
Redis / Valkey
      ↓
new? ───── yes ───→ process
 │
 no
 ↓
ignore
```

---

## Fleet Domain

Отдельный Fleet API отвечает за транспорт и рейсы.

Основные сценарии:

```text
GET available vehicles

GET vehicles

POST trip

GET trip

change trip status
```

Статусы рейсов изменяются только через разрешённые переходы.

---

## Dashboard

Frontend построен на:

```text
Nuxt 4
Vue 3
TypeScript
Pinia
Tailwind CSS
```

Dashboard предоставляет интерфейс для:

```text
Overview
Vehicles
Trips
Integration Log
```

---

## Bitrix24 CRM

CRM-направление **«Грузоперевозки»** описано независимо от конкретного портала.

Документация включает:

```text
Stages
Custom Fields
Roles
Robots
Triggers
Approval Flow
Test Deal
```

ID стадий и полей не хардкодятся и передаются через environment variables.

Это позволяет адаптировать проект под разные Bitrix24-порталы.

---

## Bitrix D7 Module

Для коробочной версии Bitrix24 предусмотрен отдельный PHP-модуль.

Он содержит:

```text
D7 ORM
event handlers
audit log
margin calculation
risk calculation
PHP tests
```

Модуль расположен в:

```text
bitrix/local/modules/cargoflow.core
```

---

## Observability

В Docker-окружение включены:

```text
Prometheus
Grafana
Loki
nginx
```

Основная цель — возможность наблюдать состояние интеграционного контура и расследовать ошибки.

---

## Стек

| Layer | Technologies |
|---|---|
| CRM | Bitrix24 |
| Backend | NestJS, TypeScript |
| Frontend | Nuxt 4, Vue 3, Pinia, Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Messaging | RabbitMQ |
| Cache / Locks | Redis / Valkey |
| Bitrix Backend | PHP 8.2, Bitrix D7 |
| Observability | Prometheus, Grafana, Loki |
| Proxy | nginx |
| Tests | Vitest, PHPUnit |
| Static Analysis | PHPStan |
| Infrastructure | Docker Compose |
| Monorepo | pnpm, Turborepo |
| CI | GitHub Actions |

---

## Monorepo

Проект организован как monorepo.

```text
bitrix-project/
│
├── apps/
│   ├── api/
│   ├── worker/
│   └── dashboard/
│
├── packages/
│
├── bitrix/
│   └── local/modules/cargoflow.core/
│
├── infrastructure/
├── docs/
│
├── docker-compose.yml
├── package.json
└── README.md
```

Backend, frontend и worker развиваются как отдельные приложения, но используют общую инфраструктуру и shared packages.

---

## Быстрый запуск

Для полного локального окружения нужен Docker.

```bash
cp .env.example .env
docker compose up --build
```

После запуска доступны:

```text
Dashboard
http://localhost:8080

Swagger
http://localhost:8080/api/docs

RabbitMQ
http://localhost:15672

Prometheus
http://localhost:9090

Grafana
http://localhost:3002
```

Fleet API и dashboard могут работать без подключения Bitrix24.

---

## Локальная разработка

Для запуска приложений без Docker:

```bash
pnpm install

pnpm db:generate
pnpm db:migrate
pnpm db:seed

pnpm dev
```

Требуются:

```text
Node.js 22+
pnpm 10+
PostgreSQL
RabbitMQ
Redis / Valkey
```

---

## Environment

Основные переменные:

```dotenv
DATABASE_URL=
RABBITMQ_URL=
REDIS_URL=

BITRIX_WEBHOOK_URL=
BITRIX_APPLICATION_TOKEN=

BITRIX_FIELD_*
BITRIX_STAGE_*

NUXT_PUBLIC_API_BASE=
```

Секреты не должны попадать в Git.

Пример находится в:

```text
.env.example
```

---

## Проверки

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build

docker compose config
```

PHP-модуль:

```bash
cd bitrix/local/modules/cargoflow.core

composer install
composer test
composer phpstan
```

---

## Документация

В `docs/` находятся отдельные документы по:

```text
Architecture
Bitrix24 CRM setup
Roles & Permissions
Automation
REST API
Webhooks
RabbitMQ
Redis
Fleet Domain
Error Handling
Monitoring
Testing
Local Development
```

Архитектурные решения дополнительно оформляются как ADR.

---

## Что хотелось изучить в проекте

CargoFlow создавался как практический проект для изучения разработки и эксплуатации интеграций Bitrix24.

Основные технические направления:

```text
Bitrix24 REST API
Bitrix24 Webhooks
Bitrix D7
NestJS
Nuxt
PostgreSQL
RabbitMQ
Redis
Transactional Outbox
Idempotency
Distributed Systems
Observability
Docker
CI/CD
```

---

## Дальнейшее развитие

Планируется:

- подключение учебного Bitrix24-портала;
- проверка реального потока Bitrix24 → Fleet → Bitrix24;
- OAuth для устанавливаемого приложения;
- OpenTelemetry;
- Sentry;
- интеграционные тесты инфраструктуры;
- тестирование D7-модуля в коробочной версии Bitrix24.

---

<div align="center">

### 🚚 CargoFlow

**Bitrix24 · NestJS · Nuxt · PostgreSQL · RabbitMQ · Redis**

CRM integration, transport operations and reliable event processing.

</div>
