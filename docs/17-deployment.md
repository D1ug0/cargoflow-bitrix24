# 17. Развёртывание

Локальный контур запускается `docker compose up --build`; nginx публикует приложение на порту 8080. Перед API-стартом контейнер применяет сохранённые Prisma migrations и идемпотентный seed.

Checklist для production:

1. Заменить стандартные пароли, использовать secret store и перевыпустить webhook Bitrix24.
2. Включить TLS, закрыть `/docs`, `/metrics`, RabbitMQ, Grafana и диагностические Bitrix-маршруты.
3. Добавить вход пользователей в dashboard/Fleet API; токен webhook не заменяет общую авторизацию.
4. Использовать управляемые PostgreSQL/RabbitMQ/Valkey или шифрованные тома и проверенные backup.
5. Запускать миграции отдельной release-задачей, а не в каждой реплике API.
6. Использовать минимум две реплики API/worker, resource limits, health probes и network policies.
7. Настроить retention Loki, alerts Prometheus/Grafana, OTLP и Sentry с учётом защиты данных.
8. Привязать исходящие события Bitrix24 к стабильному публичному HTTPS и проверить отказоустойчивость.

Kubernetes/Helm — необязательный этап и намеренно не включён в первую итерацию репозитория.
