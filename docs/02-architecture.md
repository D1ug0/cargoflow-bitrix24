# 02. Архитектура

```mermaid
flowchart LR
  B[Bitrix24 CRM] -->|исходящий webhook| A[Integration API]
  A -->|транзакция| P[(PostgreSQL)]
  A -->|публикация outbox| Q[(RabbitMQ)]
  Q --> W[Integration Worker]
  W -->|crm.item.get/update| B
  W --> P
  A --> R[(Valkey)]
  W --> R
  D[Nuxt Dashboard] -->|REST| A
  N[nginx] --> D
  N --> A
  A --> M[Prometheus]
  L[Loki] --> G[Grafana]
  M --> G
```

Границы ответственности:

- Bitrix24 хранит CRM-процесс, клиентов, коммерческие поля, задачи и согласования.
- PostgreSQL — источник истины для транспорта, рейсов и истории интеграции.
- Redis/Valkey хранит только временные ключи идемпотентности и распределённые блокировки.
- RabbitMQ отделяет быстрый ответ webhook от внешних вызовов. Publisher confirms и ручной `ack`
  защищают от незаметной потери, а retry queue и DLQ сохраняют ошибки.
- API записывает outbox в той же транзакции, что и доменное изменение; dispatcher повторяет
  публикацию незавершённых событий.
- На всём пути используется один UUID `correlationId`.

Публичный webhook считается недоверенным. Секреты нельзя логировать. В production нужны TLS,
сильные пароли, сетевые ограничения и отдельная аутентификация пользовательского API.
