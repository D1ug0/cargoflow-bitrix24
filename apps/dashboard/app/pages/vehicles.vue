<script setup lang="ts">
import type { Vehicle } from '~/types/api';

const api = useCargoApi();
const ui = useUiStore();
const query = computed(() => ({
  search: ui.vehicleSearch || undefined,
  status: ui.vehicleStatus || undefined,
  type: ui.vehicleType || undefined,
  city: ui.vehicleCity || undefined,
}));
const { data, error, status, refresh } = await useAsyncData(
  'vehicles',
  () => api.get<Vehicle[]>('/vehicles', query.value),
  {
    watch: [query],
  },
);
</script>

<template>
  <section>
    <div class="mb-7">
      <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Автопарк</p>
      <h1 class="text-3xl font-bold tracking-tight">Транспорт</h1>
      <p class="mt-2 text-sm text-slate-500">
        Доступность машин, назначенные водители и текущий город.
      </p>
    </div>
    <div class="panel mb-5 flex flex-wrap gap-3 p-4">
      <input
        v-model="ui.vehicleSearch"
        class="min-w-0 basis-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-600 lg:basis-auto lg:flex-1"
        placeholder="Поиск по госномеру или водителю"
        aria-label="Поиск по госномеру или водителю"
        maxlength="100"
      />
      <input
        v-model.trim="ui.vehicleCity"
        class="form-control min-w-0 flex-1 sm:flex-none sm:w-44"
        placeholder="Город"
        aria-label="Город автомобиля"
        maxlength="100"
      />
      <select v-model="ui.vehicleType" class="form-control w-auto" aria-label="Тип кузова">
        <option value="">Все типы кузова</option>
        <option value="TENT">Тент</option>
        <option value="REFRIGERATOR">Рефрижератор</option>
        <option value="ISOTHERM">Изотерм</option>
        <option value="VAN">Фургон</option>
      </select>
      <select
        v-model="ui.vehicleStatus"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
        aria-label="Статус автомобиля"
      >
        <option value="">Все статусы</option>
        <option value="AVAILABLE">Свободен</option>
        <option value="IN_TRIP">В рейсе</option>
        <option value="SERVICE">В сервисе</option>
        <option value="UNAVAILABLE">Недоступен</option>
      </select>
      <button
        class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"
        @click="ui.resetVehicleFilters()"
      >
        Сбросить
      </button>
      <button
        class="rounded-xl bg-[#15231f] px-4 py-2.5 text-sm font-semibold text-white"
        @click="refresh()"
      >
        Обновить
      </button>
    </div>
    <div class="panel table-shell">
      <p v-if="error" class="p-5 text-sm text-rose-700">Не удалось загрузить транспорт.</p>
      <table v-else class="data-table" :class="status === 'pending' ? 'opacity-50' : ''">
        <thead>
          <tr>
            <th>Автомобиль</th>
            <th>Тип</th>
            <th>Грузоподъёмность</th>
            <th>Город</th>
            <th>Водитель</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in data" :key="vehicle.id">
            <td class="font-bold">{{ vehicle.plateNumber }}</td>
            <td>{{ vehicle.type }}</td>
            <td>{{ vehicle.capacity }} т</td>
            <td>{{ vehicle.city }}</td>
            <td>
              <span class="font-medium">{{ vehicle.driver?.name ?? 'Не назначен' }}</span
              ><small v-if="vehicle.driver" class="block text-slate-400">{{
                vehicle.driver.phone
              }}</small>
            </td>
            <td><StatusBadge :status="vehicle.status" /></td>
          </tr>
          <tr v-if="!data?.length">
            <td colspan="6" class="text-center text-slate-400">Нет машин по выбранному фильтру</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
