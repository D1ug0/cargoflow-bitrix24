<script setup lang="ts">
import type { IntegrationLog } from '~/types/api';

const api = useCargoApi();
const ui = useUiStore();
const correlationInput = ref(ui.integrationCorrelationId);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const correlationIsInvalid = computed(() => {
  const value = correlationInput.value.trim();
  return value.length > 0 && !uuidPattern.test(value);
});
const query = computed(() => ({
  status: ui.integrationStatus || undefined,
  correlationId: ui.integrationCorrelationId || undefined,
  limit: 100,
}));
const { data, error, status, refresh } = await useAsyncData(
  'integrations',
  () => api.get<{ items: IntegrationLog[]; total: number }>('/integrations', query.value),
  { watch: [query] },
);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'medium' }).format(
    new Date(value),
  );

function applyCorrelationFilter() {
  if (correlationIsInvalid.value) return;
  ui.integrationCorrelationId = correlationInput.value.trim();
}

function clearCorrelationFilter() {
  correlationInput.value = '';
  ui.integrationCorrelationId = '';
}
</script>

<template>
  <section>
    <div class="mb-7">
      <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
        Наблюдаемость
      </p>
      <h1 class="text-3xl font-bold tracking-tight">Интеграции</h1>
      <p class="mt-2 text-sm text-slate-500">Единый журнал прохождения событий между системами.</p>
    </div>
    <form
      class="panel mb-5 flex flex-wrap items-start gap-3 p-4"
      @submit.prevent="applyCorrelationFilter"
    >
      <select
        v-model="ui.integrationStatus"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
      >
        <option value="">Все статусы</option>
        <option value="SUCCESS">Успешно</option>
        <option value="ERROR">Ошибка</option>
        <option value="RECEIVED">Получено</option>
        <option value="IGNORED">Пропущено</option>
      </select>
      <label class="min-w-64 flex-1">
        <span class="sr-only">Correlation ID</span>
        <input
          v-model="correlationInput"
          type="search"
          autocomplete="off"
          class="w-full rounded-xl border bg-white px-4 py-2.5 font-mono text-xs outline-none"
          :class="correlationIsInvalid ? 'border-rose-400' : 'border-slate-200'"
          placeholder="Correlation ID"
          aria-describedby="correlation-id-hint"
          :aria-invalid="correlationIsInvalid"
        />
        <span
          id="correlation-id-hint"
          class="mt-1 block text-xs"
          :class="correlationIsInvalid ? 'text-rose-600' : 'text-slate-400'"
        >
          {{ correlationIsInvalid ? 'Введите UUID целиком' : 'Точный UUID из ответа или лога' }}
        </span>
      </label>
      <button
        type="submit"
        class="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="correlationIsInvalid"
      >
        Найти
      </button>
      <button
        v-if="ui.integrationCorrelationId"
        type="button"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
        @click="clearCorrelationFilter"
      >
        Сбросить
      </button>
      <span class="self-center text-sm text-slate-400">Записей: {{ data?.total ?? 0 }}</span>
      <button
        type="button"
        class="ml-auto rounded-xl bg-[#15231f] px-4 py-2.5 text-sm font-semibold text-white"
        @click="refresh()"
      >
        Обновить
      </button>
    </form>
    <div class="panel table-shell">
      <p v-if="error" class="p-5 text-sm text-rose-700">Не удалось загрузить журнал.</p>
      <table v-else class="data-table" :class="status === 'pending' ? 'opacity-50' : ''">
        <thead>
          <tr>
            <th>Время</th>
            <th>Источник</th>
            <th>Событие</th>
            <th>Статус</th>
            <th>Попыток</th>
            <th>Correlation ID / ошибка</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data?.items" :key="item.id">
            <td class="whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
            <td class="font-semibold">{{ item.source }}</td>
            <td class="font-mono text-xs">{{ item.eventType }}</td>
            <td><StatusBadge :status="item.status" /></td>
            <td>{{ item.attempts }}</td>
            <td>
              <span
                class="block max-w-xs truncate font-mono text-[10px] text-slate-400"
                :title="item.correlationId"
                >{{ item.correlationId }}</span
              ><span
                v-if="item.error"
                class="mt-1 block max-w-xs truncate text-xs text-rose-600"
                :title="item.error"
                >{{ item.error }}</span
              >
            </td>
          </tr>
          <tr v-if="!data?.items.length">
            <td colspan="6" class="text-center text-slate-400">Журнал пока пуст</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
