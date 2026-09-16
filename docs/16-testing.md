# 16. Тестирование

Автоматические тесты покрывают контракты, переходы статусов, retry backoff, расчёт маржи и риска.

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose config
```

После `docker compose up --build` проверьте:

1. `/api/health` сообщает `up` для всех зависимостей.
2. Seed-машины видны в `/vehicles` и dashboard.
3. `POST /trips` работает; дубль `bitrixDealId`, неверная дата и перескок стадии дают ожидаемые ошибки.
4. Корректное событие Bitrix24 даёт `accepted`, повтор — `ignored`, неверный токен — 403.
5. Остановите RabbitMQ, примите событие, запустите RabbitMQ и проверьте публикацию outbox.
6. Укажите неверный Bitrix endpoint и проверьте три повтора и DLQ.
7. Найдите один `correlationId` в `/integrations` и логах.

Для реального Bitrix24 используйте учебный портал и синтетические контакты. Полноценные
интеграционные тесты во временных контейнерах остаются следующим этапом.
