<script setup lang="ts">
defineProps<{ label: string; value: number | string; accent: string; note: string }>();
</script>

<template>
  <article class="panel relative overflow-hidden p-5 lg:p-6">
    <span class="absolute right-5 top-5 h-3 w-3 rounded-full" :style="{ background: accent }" />
    <p class="pr-6 text-sm text-slate-500">{{ label }}</p>
    <strong class="mt-4 block text-4xl tracking-tight text-slate-900">{{ value }}</strong>
    <p class="mt-3 text-xs text-slate-400">{{ note }}</p>
  </article>
</template>
