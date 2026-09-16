<script setup lang="ts">
const route = useRoute();
const links = [
  { to: '/', label: 'Обзор', icon: '◫' },
  { to: '/vehicles', label: 'Транспорт', icon: '▰' },
  { to: '/trips', label: 'Рейсы', icon: '↗' },
  { to: '/integrations', label: 'Интеграции', icon: '⌁' },
];
</script>

<template>
  <div class="min-h-screen bg-[#f4f5f1] text-slate-900">
    <aside
      class="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#15231f] px-5 py-7 text-white lg:flex"
    >
      <NuxtLink to="/" class="mb-10 flex items-center gap-3 px-2">
        <span
          class="grid h-10 w-10 place-items-center rounded-xl bg-[#e7ff63] font-black text-[#15231f]"
          >CF</span
        >
        <span>
          <strong class="block text-lg tracking-tight">CargoFlow</strong>
          <small class="text-xs text-slate-400">operations center</small>
        </span>
      </NuxtLink>

      <nav class="space-y-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          :class="route.path === link.to ? 'bg-white/10 text-white' : ''"
        >
          <span class="text-[#e7ff63]">{{ link.icon }}</span>
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div
        class="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-400"
      >
        <span class="mb-2 flex items-center gap-2 text-white">
          <i class="h-2 w-2 rounded-full bg-emerald-400" /> Система подключена
        </span>
        Bitrix24 · Fleet · Queue
      </div>
    </aside>

    <div class="lg:pl-64">
      <header
        class="sticky top-0 z-10 border-b border-black/5 bg-[#f4f5f1]/90 px-5 py-4 backdrop-blur lg:px-10"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 font-bold lg:hidden">
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-[#15231f] text-xs text-[#e7ff63]"
              >CF</span
            >
            CargoFlow
          </NuxtLink>
          <nav class="flex gap-1 overflow-x-auto lg:hidden">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="rounded-lg px-3 py-2 text-xs"
              :class="route.path === link.to ? 'bg-[#15231f] text-white' : 'text-slate-600'"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
          <div class="ml-auto hidden items-center gap-3 text-sm text-slate-500 lg:flex">
            <span>Учебный контур</span>
            <span class="h-4 w-px bg-slate-300" />
            <strong class="text-slate-800">Диспетчер</strong>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
