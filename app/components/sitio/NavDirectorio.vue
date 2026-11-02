<!-- Secciones del directorio público -->
<template>
  <nav class="-mx-1 flex gap-1 overflow-x-auto pb-1" aria-label="Secciones del directorio">
    <NuxtLink
      v-for="s in SECCIONES"
      :key="s.to"
      :to="s.to"
      class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
      :class="route.path === s.to ? 'bg-primary text-white' : 'bg-default text-muted ring-1 ring-default hover:text-highlighted'"
    >
      {{ s.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const SECCIONES = [
  { label: 'Colegios y asociaciones', to: '/directorio' },
  { label: 'Mesa directiva', to: '/directorio/mesa-directiva' },
  { label: 'Consejo consultivo', to: '/directorio/consejo-consultivo' },
  { label: 'Profesionales', to: '/directorio/profesionales' },
]
</script>
