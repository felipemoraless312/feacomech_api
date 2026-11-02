<!-- Calendario mensual de eventos (vista del portal) -->
<template>
  <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default">
    <div class="flex items-center justify-between border-b border-default px-4 py-3">
      <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" aria-label="Mes anterior" @click="mover(-1)" />
      <p class="font-display text-lg font-semibold capitalize text-highlighted">
        {{ titulo }}
      </p>
      <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" aria-label="Mes siguiente" @click="mover(1)" />
    </div>
    <div class="grid grid-cols-7 border-b border-default text-center text-xs font-medium uppercase tracking-wide text-dimmed">
      <span v-for="d in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="d" class="py-2">{{ d }}</span>
    </div>
    <div class="grid grid-cols-7">
      <div
        v-for="c in celdas"
        :key="c.clave"
        class="min-h-16 border-b border-r border-default p-1.5 sm:min-h-24"
        :class="{ 'bg-muted/50': !c.delMes }"
      >
        <span class="text-xs tabular-nums" :class="c.hoy ? 'inline-flex size-6 items-center justify-center rounded-full bg-primary font-semibold text-white' : c.delMes ? 'text-muted' : 'text-dimmed'">{{ c.dia }}</span>
        <div class="mt-1 space-y-1">
          <NuxtLink
            v-for="e in c.eventos"
            :key="e.slug"
            :to="`/eventos/${e.slug}`"
            class="block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium"
            :class="e.estado === 'CANCELADO' ? 'bg-muted text-dimmed line-through' : 'bg-marca-100 text-marca-800 hover:bg-marca-200 dark:bg-marca-900 dark:text-marca-100'"
            :title="e.titulo"
          >
            <span class="hidden sm:inline">{{ e.titulo }}</span><span class="sm:hidden">•</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ZONA_HORARIA } from '#shared/texto'

const props = defineProps<{ eventos: { slug: string, titulo: string, inicio: string | Date, fin: string | Date, estado: string }[] }>()
const mes = defineModel<string>({ required: true }) // "2026-11"

const dia = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(d)
const titulo = computed(() => new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${mes.value}-01T12:00:00Z`)))

function mover(n: number) {
  const [a, m] = mes.value.split('-').map(Number)
  const d = new Date(Date.UTC(a!, m! - 1 + n, 1))
  mes.value = d.toISOString().slice(0, 7)
}

const celdas = computed(() => {
  const primero = new Date(`${mes.value}-01T12:00:00Z`)
  const inicio = new Date(primero.getTime() - ((primero.getUTCDay() + 6) % 7) * 86_400_000) // lunes
  const hoy = dia(new Date())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio.getTime() + i * 86_400_000)
    const clave = d.toISOString().slice(0, 10)
    return {
      clave,
      dia: d.getUTCDate(),
      delMes: clave.startsWith(mes.value),
      hoy: clave === hoy,
      eventos: props.eventos.filter(e => dia(new Date(e.inicio)) <= clave && dia(new Date(e.fin)) >= clave),
    }
  }).filter((c, i, todas) => i < 35 || todas.slice(35).some(x => x.delMes))
})
</script>
