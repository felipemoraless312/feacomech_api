<!-- Logotipo de una organización o, si no tiene, sus iniciales en un recuadro -->
<template>
  <span class="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-marca-50 font-semibold text-marca-700 ring-1 ring-default dark:bg-marca-950 dark:text-marca-200" :class="tamanos[tamano]">
    <img v-if="logoId" :src="`/api/archivos/${logoId}`" :alt="`Logotipo de ${nombre}`" class="size-full bg-white object-contain p-1" loading="lazy">
    <span v-else>{{ iniciales }}</span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ logoId?: string | null, nombre: string, tamano?: 'md' | 'lg' | 'xl' }>(), { tamano: 'md' })
const tamanos = { md: 'size-12 text-sm', lg: 'size-16 text-base', xl: 'size-20 text-xl' }
const iniciales = computed(() => props.nombre.split(/\s+/).filter(p => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p)).slice(0, 3).map(p => p[0]).join('').toUpperCase())
</script>
