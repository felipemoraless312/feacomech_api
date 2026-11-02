<!-- Fecha en bloque (día grande, mes abreviado) para listas y tarjetas de eventos -->
<template>
  <span class="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-marca-50 text-marca-800 dark:bg-marca-950 dark:text-marca-200">
    <span class="text-xl font-semibold leading-none tabular-nums">{{ partes.dia }}</span>
    <span class="mt-0.5 text-[11px] font-medium uppercase tracking-wide">{{ partes.mes }}</span>
  </span>
</template>

<script setup lang="ts">
import { ZONA_HORARIA } from '#shared/texto'

const props = defineProps<{ fecha: string | Date }>()
const partes = computed(() => {
  const d = new Date(props.fecha)
  return {
    dia: new Intl.DateTimeFormat('es-MX', { day: 'numeric', timeZone: ZONA_HORARIA }).format(d),
    mes: new Intl.DateTimeFormat('es-MX', { month: 'short', timeZone: ZONA_HORARIA }).format(d).replace('.', ''),
  }
})
</script>
