<script setup lang="ts">
const api = useCargoApi();
const { data, status, error, refresh } = await useAsyncData('summary', () =>
  api.get<{
    activeTrips: number;
    availableVehicles: number;
    serviceVehicles: number;
    integrationErrors: number;
  }>('/dashboard/summary'),
);

const metrics = computed(() => [
  {
    label: 'Активные рейсы',
    value: data.value?.activeTrips ?? '—',
    accent: '#2563eb',
    note: 'Назначены, грузятся или в пути',
  },
  {
    label: 'Свободный транспорт',
    value: data.value?.availableVehicles ?? '—',
    accent: '#22c55e',
    note: 'Готов к назначению',
  },
  {
    label: 'Транспорт в сервисе',
    value: data.value?.serviceVehicles ?? '—',
    accent: '#f59e0b',
    note: 'Требует внимания логиста',
  },
  {
    label: 'Ошибки интеграции',
    value: data.value?.integrationErrors ?? '—',
    accent: '#ef4444',
    note: 'За всё время в журнале',
  },
]);
</script>

<template>
  <section>
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          Оперативная сводка
        </p>
        <h1 class="text-3xl font-bold tracking-tight lg:text-4xl">Добрый день, диспетчер</h1>
        <p class="mt-2 text-sm text-slate-500">Состояние перевозок и интеграции прямо сейчас.</p>
      </div>
      <button
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        @click="refresh()"
      >
        Обновить
      </button>
    </div>

    <div v-if="error" class="panel border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      API недоступен. Проверьте `NUXT_PUBLIC_API_BASE` и состояние контейнеров.
    </div>
    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      :class="status === 'pending' ? 'animate-pulse' : ''"
    >
      <MetricCard v-for="metric in metrics" :key="metric.label" v-bind="metric" />
    </div>

    <div class="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <article class="panel p-6">
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Процесс перевозки
        </p>
        <h2 class="mt-2 text-xl font-bold">От сделки до доставки</h2>
        <div class="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="(step, index) in ['Заявка', 'Назначение', 'В пути', 'Доставлено']"
            :key="step"
            class="rounded-2xl bg-slate-50 p-4"
          >
            <span class="text-xs font-bold text-emerald-700">0{{ index + 1 }}</span>
            <p class="mt-6 text-sm font-semibold">{{ step }}</p>
          </div>
        </div>
      </article>
      <article class="rounded-[1.25rem] bg-[#e7ff63] p-6 text-[#15231f]">
        <p class="text-xs font-bold uppercase tracking-[0.16em] opacity-60">
          Интеграционный контур
        </p>
        <h2 class="mt-2 text-xl font-bold">Bitrix24 ↔ CargoFlow</h2>
        <p class="mt-4 text-sm leading-6 opacity-75">
          События проходят через защищённый webhook, outbox и RabbitMQ. Повторы отсекаются Redis.
        </p>
        <NuxtLink
          to="/integrations"
          class="mt-8 inline-flex rounded-xl bg-[#15231f] px-4 py-2.5 text-sm font-bold text-white"
          >Открыть журнал →</NuxtLink
        >
      </article>
    </div>
  </section>
</template>
