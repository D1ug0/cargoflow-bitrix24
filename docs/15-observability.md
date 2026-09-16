# 15. Наблюдаемость

API публикует стандартные метрики процесса и:

- `http_requests_total` по методу, маршруту и статусу;
- `http_errors_total` по методу, маршруту и статусу;
- histogram `webhook_processing_time` по типу события Bitrix24.

Prometheus читает `/metrics`, Grafana показывает трафик, ошибки, p95 webhook и логи Loki. Promtail
обнаруживает контейнеры Compose-проекта `cargoflow`.

Логи содержат `correlationId`, но не адреса и токены webhook. RabbitMQ Management показывает
глубину очередей и DLQ. `OTEL_EXPORTER_OTLP_ENDPOINT` и `SENTRY_DSN` зарезервированы: экспортёры
подключаются после выбора реального collector и проекта Sentry, чтобы не имитировать мониторинг.

В production нужны alerts на health, рост 5xx, p95 webhook, возраст outbox, DLQ и глубину очередей.
