<!-- Estadísticas de la organización (de la base, en vivo) -->
<template>
  <div v-if="datos" class="space-y-8">
    <div class="grid grid-cols-3 gap-3">
      <div v-for="c in cifras" :key="c.etiqueta" class="rounded-2xl bg-default px-5 py-4 shadow-tarjeta">
        <p class="text-[13px] text-muted">
          {{ c.etiqueta }}
        </p>
        <p class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-highlighted">
          {{ c.valor.toLocaleString('es-MX') }}
        </p>
      </div>
    </div>

    <GrupoDatos titulo="Integrantes activos por especialidad">
      <EstadoVacio v-if="!datos.porEspecialidad.length" icono="i-lucide-chart-bar" titulo="Aún no hay integrantes activos" />
      <ul v-else class="space-y-3 px-5 py-4">
        <li v-for="e in datos.porEspecialidad" :key="e.especialidad" class="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-3 text-sm">
          <span class="truncate text-muted" :title="e.especialidad">{{ e.especialidad }}</span>
          <span class="h-2 overflow-hidden rounded-full bg-muted">
            <span class="block h-full rounded-full bg-primary" :style="{ width: `${(e.total / maximo) * 100}%` }" />
          </span>
          <span class="w-8 text-right font-medium tabular-nums text-highlighted">{{ e.total }}</span>
        </li>
      </ul>
    </GrupoDatos>

    <GrupoDatos titulo="Altas validadas en los últimos 12 meses">
      <EstadoVacio v-if="!datos.altasPorMes.length" icono="i-lucide-calendar" titulo="Sin altas en el periodo" />
      <div v-else class="flex h-40 items-end gap-2 px-5 pb-3 pt-6">
        <div v-for="m in meses" :key="m.mes" class="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span class="text-xs tabular-nums text-muted">{{ m.total || '' }}</span>
          <span class="w-full max-w-8 rounded-t-md bg-primary/80" :style="{ height: `${(m.total / maximoMes) * 100}%`, minHeight: m.total ? '4px' : '0' }" />
          <span class="text-[11px] text-dimmed">{{ m.etiqueta }}</span>
        </div>
      </div>
    </GrupoDatos>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ organizacionId: string }>()
const api = useApi()

interface Estadisticas { activos: number, solicitudes: number, bajas: number, porEspecialidad: { especialidad: string, total: number }[], altasPorMes: { mes: string, total: number }[] }
const { data: datos } = await useAsyncData(`estadisticas-${props.organizacionId}`, () => api<Estadisticas>(`/api/organizaciones/${props.organizacionId}/estadisticas`))

const cifras = computed(() => [
  { etiqueta: 'Activos', valor: datos.value?.activos ?? 0 },
  { etiqueta: 'Solicitudes', valor: datos.value?.solicitudes ?? 0 },
  { etiqueta: 'Bajas', valor: datos.value?.bajas ?? 0 },
])
const maximo = computed(() => Math.max(1, ...(datos.value?.porEspecialidad.map(e => e.total) ?? [])))

// Los 12 meses, aunque alguno no tenga altas.
const meses = computed(() => {
  const hoy = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 11 + i, 1))
    const mes = d.toISOString().slice(0, 7)
    return {
      mes,
      etiqueta: new Intl.DateTimeFormat('es-MX', { month: 'short', timeZone: 'UTC' }).format(d).replace('.', ''),
      total: datos.value?.altasPorMes.find(a => a.mes === mes)?.total ?? 0,
    }
  })
})
const maximoMes = computed(() => Math.max(1, ...meses.value.map(m => m.total)))
</script>
