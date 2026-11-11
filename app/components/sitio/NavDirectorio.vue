<!-- Secciones del directorio público -->
<template>
  <nav class="-mx-1 flex gap-1 overflow-x-auto pb-1" aria-label="Secciones del directorio">
    <NuxtLink
      v-for="s in SECCIONES"
      :key="s.to"
      :to="s.to"
      class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
      :class="route.path === s.to ? 'bg-acento-500 text-white' : 'bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/20 hover:text-white'"
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
