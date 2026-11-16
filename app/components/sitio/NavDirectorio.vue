<!-- Secciones del directorio público -->
<template>
  <nav class="-mx-1 flex gap-1 overflow-x-auto pb-1" aria-label="Secciones del directorio">
    <NuxtLink
      v-for="s in SECCIONES"
      :key="s.to"
      :to="s.to"
      class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all"
      :class="route.path === s.to ? 'bg-acento-500 text-white shadow-[0_6px_16px_-6px_rgb(217_106_34/0.6)]' : 'bg-white/70 text-marca-800 ring-1 ring-marca-200 backdrop-blur hover:bg-white hover:text-marca-950 dark:bg-white/10 dark:text-white/80 dark:ring-white/15'"
    >
      {{ s.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const SECCIONES = [
  { label: 'Colegios agremiados', to: '/directorio' },
  { label: 'Mesa directiva', to: '/directorio/mesa-directiva' },
  { label: 'Consejo consultivo', to: '/directorio/consejo-consultivo' },
  { label: 'Profesionales', to: '/directorio/profesionales' },
]
</script>
