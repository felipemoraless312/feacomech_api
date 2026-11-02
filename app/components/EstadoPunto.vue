<!-- Estado con punto de color: "● Activo" -->
<template>
  <span class="inline-flex items-center gap-2 whitespace-nowrap text-sm">
    <span class="size-2 shrink-0 rounded-full" :class="COLOR[tono]" />
    <slot>{{ texto }}</slot>
  </span>
</template>

<script setup lang="ts">
export type TonoEstado = 'exito' | 'alerta' | 'error' | 'info' | 'neutro'
withDefaults(defineProps<{ texto?: string, tono?: TonoEstado }>(), { tono: 'neutro' })
const COLOR: Record<TonoEstado, string> = {
  exito: 'bg-success',
  alerta: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutro: 'bg-(--ui-text-dimmed)',
}
</script>
