# 11. RabbitMQ

API публикует устойчивый envelope в topic exchange `cargoflow.events` только после сохранения
outbox. Поля: `id`, `type`, `occurredAt`, `correlationId`, `payload`.

События: `trip.create`, `trip.update`, `trip.status.changed`, `bitrix.deal.update`.

Worker использует `noAck: false` и подтверждает сообщение после успеха либо подтверждённой
повторной публикации. Ошибка попадает в retry queue с TTL; dead-letter routing возвращает её в
основной exchange. Интервалы — 1, 2 и 4 секунды. Четвёртая ошибка уходит в `cargoflow.dlx` и
сохраняется в `cargoflow.worker.dlq`.

Очереди видны на `http://localhost:15672`. Содержимое DLQ сначала диагностируется, затем
переигрывается вручную. Автоматически очищать DLQ нельзя.
