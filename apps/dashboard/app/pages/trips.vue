<script setup lang="ts">
import type { Trip, TripStatus, Vehicle } from '~/types/api';

const api = useCargoApi();
const showCreate = ref(false);
const saving = ref(false);
const actionTripId = ref('');
const message = ref<{ kind: 'success' | 'error'; text: string }>();
const assignments = reactive<Record<string, string>>({});
const form = reactive({
  bitrixDealId: '',
  from: '',
  to: '',
  loadingDate: '',
  deliveryDate: '',
  vehicleId: '',
});

const { data, error, status, refresh } = await useAsyncData('trips-workspace', async () => {
  const [trips, vehicles] = await Promise.all([
    api.get<Trip[]>('/trips'),
    api.get<Vehicle[]>('/vehicles/available'),
  ]);
  return { trips, vehicles };
});

const nextStatus: Partial<Record<TripStatus, TripStatus>> = {
  ASSIGNED: 'LOADING',
  LOADING: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
  DELIVERED: 'CLOSED',
};

const statusAction: Partial<Record<TripStatus, string>> = {
  ASSIGNED: 'На погрузку',
  LOADING: 'В путь',
  IN_TRANSIT: 'Доставлено',
  DELIVERED: 'Закрыть',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );

function errorText(value: unknown) {
  if (value && typeof value === 'object' && 'data' in value) {
    const data = (value as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (data?.message) return data.message;
  }
  return 'Операция не выполнена. Проверьте данные и состояние сервисов.';
}

async function createTrip() {
  message.value = undefined;
  saving.value = true;
  try {
    await api.post<Trip>('/trips', {
      bitrixDealId: Number(form.bitrixDealId),
      from: form.from,
      to: form.to,
      loadingDate: new Date(form.loadingDate).toISOString(),
      deliveryDate: new Date(form.deliveryDate).toISOString(),
      ...(form.vehicleId ? { vehicleId: form.vehicleId } : {}),
    });
    Object.assign(form, {
      bitrixDealId: '',
      from: '',
      to: '',
      loadingDate: '',
      deliveryDate: '',
      vehicleId: '',
    });
    showCreate.value = false;
    message.value = { kind: 'success', text: 'Рейс создан.' };
    await refresh();
  } catch (value) {
    message.value = { kind: 'error', text: errorText(value) };
  } finally {
    saving.value = false;
  }
}

async function assignVehicle(trip: Trip) {
  const vehicleId = assignments[trip.id];
  if (!vehicleId) {
    message.value = { kind: 'error', text: 'Выберите свободный автомобиль.' };
    return;
  }
  await runAction(trip.id, () => api.patch<Trip>(`/trips/${trip.id}/assignment`, { vehicleId }));
}

async function advance(trip: Trip) {
  const target = nextStatus[trip.status as TripStatus];
  if (!target) return;
  await runAction(trip.id, () => api.patch<Trip>(`/trips/${trip.id}/status`, { status: target }));
}

async function cancel(trip: Trip) {
  if (!globalThis.confirm(`Отменить рейс ${trip.from} → ${trip.to}?`)) return;
  await runAction(trip.id, () =>
    api.patch<Trip>(`/trips/${trip.id}/status`, { status: 'CANCELLED' }),
  );
}

async function runAction(tripId: string, action: () => Promise<Trip>) {
  message.value = undefined;
  actionTripId.value = tripId;
  try {
    await action();
    message.value = { kind: 'success', text: 'Рейс обновлён.' };
    await refresh();
  } catch (value) {
    message.value = { kind: 'error', text: errorText(value) };
  } finally {
    actionTripId.value = '';
  }
}
</script>

<template>
  <section>
    <div class="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Перевозки</p>
        <h1 class="text-3xl font-bold tracking-tight">Рейсы</h1>
        <p class="mt-2 text-sm text-slate-500">
          Создание, назначение транспорта и движение по маршруту.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          @click="refresh()"
        >
          Обновить
        </button>
        <button
          class="rounded-xl bg-[#15231f] px-4 py-2 text-sm font-semibold text-white"
          @click="showCreate = !showCreate"
        >
          {{ showCreate ? 'Скрыть форму' : 'Новый рейс' }}
        </button>
      </div>
    </div>

    <div
      v-if="message"
      class="mb-5 rounded-2xl border p-4 text-sm"
      :class="
        message.kind === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      "
    >
      {{ message.text }}
    </div>

    <form
      v-if="showCreate"
      class="panel mb-5 grid gap-4 p-5 md:grid-cols-2"
      @submit.prevent="createTrip"
    >
      <label class="field-label">
        ID сделки
        <input v-model="form.bitrixDealId" required min="1" type="number" class="form-control" />
      </label>
      <label class="field-label">
        Автомобиль
        <select v-model="form.vehicleId" class="form-control">
          <option value="">Назначить позже</option>
          <option v-for="vehicle in data?.vehicles" :key="vehicle.id" :value="vehicle.id">
            {{ vehicle.plateNumber }} · {{ vehicle.city }} · {{ vehicle.capacity }} т
          </option>
        </select>
      </label>
      <label class="field-label">
        Откуда
        <input v-model.trim="form.from" required minlength="2" class="form-control" />
      </label>
      <label class="field-label">
        Куда
        <input v-model.trim="form.to" required minlength="2" class="form-control" />
      </label>
      <label class="field-label">
        Погрузка
        <input v-model="form.loadingDate" required type="datetime-local" class="form-control" />
      </label>
      <label class="field-label">
        Доставка
        <input v-model="form.deliveryDate" required type="datetime-local" class="form-control" />
      </label>
      <div class="flex justify-end md:col-span-2">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {{ saving ? 'Создаём…' : 'Создать рейс' }}
        </button>
      </div>
    </form>

    <div class="panel table-shell">
      <p v-if="error" class="p-5 text-sm text-rose-700">Не удалось загрузить рейсы.</p>
      <table v-else class="data-table" :class="status === 'pending' ? 'opacity-50' : ''">
        <thead>
          <tr>
            <th>Маршрут</th>
            <th>Период</th>
            <th>Экипаж</th>
            <th>Сделка</th>
            <th>Статус</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trip in data?.trips" :key="trip.id">
            <td>
              <strong>{{ trip.from }}</strong
              ><span class="mx-2 text-slate-300">→</span><strong>{{ trip.to }}</strong>
              <small class="mt-1 block font-mono text-[10px] text-slate-400">{{ trip.id }}</small>
            </td>
            <td>
              {{ formatDate(trip.loadingDate) }}<span class="mx-1 text-slate-300">—</span
              >{{ formatDate(trip.deliveryDate) }}
            </td>
            <td>
              <span class="font-medium">{{ trip.vehicle?.plateNumber ?? 'Не назначен' }}</span>
              <small class="block text-slate-400">{{ trip.driver?.name ?? '—' }}</small>
            </td>
            <td>
              <span class="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs"
                >#{{ trip.bitrixDealId }}</span
              >
            </td>
            <td><StatusBadge :status="trip.status" /></td>
            <td class="min-w-56">
              <div v-if="trip.status === 'CREATED'" class="flex gap-2">
                <select v-model="assignments[trip.id]" class="form-control min-w-36">
                  <option value="">Выберите машину</option>
                  <option v-for="vehicle in data?.vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ vehicle.plateNumber }}
                  </option>
                </select>
                <button
                  :disabled="actionTripId === trip.id"
                  class="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  @click="assignVehicle(trip)"
                >
                  Назначить
                </button>
                <button
                  :disabled="actionTripId === trip.id"
                  class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"
                  @click="cancel(trip)"
                >
                  Отменить
                </button>
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-if="nextStatus[trip.status as TripStatus]"
                  :disabled="actionTripId === trip.id"
                  class="rounded-lg bg-[#15231f] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  @click="advance(trip)"
                >
                  {{ statusAction[trip.status as TripStatus] }}
                </button>
                <button
                  v-if="!['DELIVERED', 'CLOSED', 'CANCELLED'].includes(trip.status)"
                  :disabled="actionTripId === trip.id"
                  class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"
                  @click="cancel(trip)"
                >
                  Отменить
                </button>
                <span
                  v-if="['CLOSED', 'CANCELLED'].includes(trip.status)"
                  class="text-xs text-slate-400"
                >
                  Завершён
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="!data?.trips.length">
            <td colspan="6" class="text-center text-slate-400">Рейсов пока нет</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
