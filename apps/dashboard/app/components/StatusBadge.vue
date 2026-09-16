<script setup lang="ts">
const props = defineProps<{ status: string }>();

const labels: Record<string, string> = {
  AVAILABLE: 'Свободен',
  IN_TRIP: 'В рейсе',
  SERVICE: 'В сервисе',
  UNAVAILABLE: 'Недоступен',
  CREATED: 'Создан',
  ASSIGNED: 'Назначен',
  LOADING: 'На погрузке',
  IN_TRANSIT: 'В пути',
  DELIVERED: 'Доставлен',
  CLOSED: 'Закрыт',
  CANCELLED: 'Отменён',
  SUCCESS: 'Успешно',
  ERROR: 'Ошибка',
  RECEIVED: 'Получено',
  IGNORED: 'Пропущено',
};

const color = computed(() => {
  if (['AVAILABLE', 'DELIVERED', 'CLOSED', 'SUCCESS'].includes(props.status))
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10';
  if (['SERVICE', 'LOADING', 'RECEIVED'].includes(props.status))
    return 'bg-amber-50 text-amber-700 ring-amber-600/10';
  if (['UNAVAILABLE', 'CANCELLED', 'ERROR'].includes(props.status))
    return 'bg-rose-50 text-rose-700 ring-rose-600/10';
  return 'bg-sky-50 text-sky-700 ring-sky-600/10';
});
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
    :class="color"
  >
    {{ labels[status] ?? status }}
  </span>
</template>
