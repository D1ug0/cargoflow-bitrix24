<script setup lang="ts">
import type { Trip } from '~/types/api';

const api = useCargoApi();
const { data, error, status, refresh } = await useAsyncData('trips', () =>
  api.get<Trip[]>('/trips'),
);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
</script>

<template>
  <section>
    <div class="mb-7 flex items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Перевозки</p>
        <h1 class="text-3xl font-bold tracking-tight">Рейсы</h1>
        <p class="mt-2 text-sm text-slate-500">Маршруты, экипажи и связь со сделками Bitrix24.</p>
      </div>
      <button
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
        @click="refresh()"
      >
        Обновить
      </button>
    </div>
    <div class="panel table-shell">
      <p v-if="error" class="p-5 text-sm text-rose-700">Не удалось загрузить рейсы.</p>
      <table v-else class="data-table" :class="status === 'pending' ? 'opacity-50' : ''">
        <thead>
          <tr>
            <th>Маршрут</th>
            <th>Период</th>
            <th>Автомобиль</th>
            <th>Водитель</th>
            <th>Сделка</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trip in data" :key="trip.id">
            <td>
              <strong>{{ trip.from }}</strong
              ><span class="mx-2 text-slate-300">→</span><strong>{{ trip.to }}</strong
              ><small class="mt-1 block font-mono text-[10px] text-slate-400">{{ trip.id }}</small>
            </td>
            <td>
              {{ formatDate(trip.loadingDate) }}<span class="mx-1 text-slate-300">—</span
              >{{ formatDate(trip.deliveryDate) }}
            </td>
            <td>{{ trip.vehicle?.plateNumber ?? '—' }}</td>
            <td>{{ trip.driver?.name ?? '—' }}</td>
            <td>
              <span class="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs"
                >#{{ trip.bitrixDealId }}</span
              >
            </td>
            <td><StatusBadge :status="trip.status" /></td>
          </tr>
          <tr v-if="!data?.length">
            <td colspan="6" class="text-center text-slate-400">Рейсов пока нет</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
