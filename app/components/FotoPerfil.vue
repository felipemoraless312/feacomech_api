<!-- Foto de perfil (archivo servido por /api/archivos/:id, o ruta estática en src) o iniciales -->
<template>
  <UAvatar :src="src || (fotoId ? `/api/archivos/${fotoId}` : undefined)" :alt="nombre" :size="tamano" :ui="{ root: 'bg-marca-100 text-marca-800 dark:bg-marca-900 dark:text-marca-100', fallback: 'font-semibold' }" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ fotoId?: string | null, src?: string, nombre: string, tamano?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' }>(), { tamano: 'md' })
</script>
