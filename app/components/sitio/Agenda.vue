<!-- Fechas próximas con cuenta regresiva. Las pasadas no se muestran. -->
<template>
  <div v-if="proximas.length" class="grid gap-5" :class="proximas.length > 1 ? 'lg:grid-cols-2' : ''">
    <article
      v-for="(a, i) in proximas"
      :key="a.titulo"
      v-revelar="i * 80"
      class="relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl bg-default p-7 shadow-tarjeta ring-1 ring-default sm:flex-row sm:items-center"
    >
      <MarcaRed class="pointer-events-none absolute -right-20 -top-20 -z-10 size-64 text-marca-500/10" />
      <!-- Hoja de calendario -->
      <div class="w-24 shrink-0 overflow-hidden rounded-2xl text-center shadow-tarjeta ring-1 ring-default">
        <p class="bg-marca-700 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          {{ mes(a.fecha) }}
        </p>
        <p class="bg-default py-2 font-display text-4xl font-semibold leading-none text-highlighted">
          {{ Number(a.fecha.slice(8, 10)) }}<span v-if="a.fin && a.fin !== a.fecha" class="text-2xl text-muted">–{{ Number(a.fin.slice(8, 10)) }}</span>
        </p>
        <p class="bg-default pb-2 text-xs text-muted">
          {{ a.fecha.slice(0, 4) }}
        </p>
      </div>
      <div class="min-w-0 flex-1 space-y-2">
        <p v-if="hoy" class="inline-flex items-center gap-1.5 rounded-full bg-marca-50 px-2.5 py-0.5 text-xs font-semibold text-marca-700 dark:bg-marca-950 dark:text-marca-200">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-marca-500 opacity-60 motion-reduce:hidden" />
            <span class="relative inline-flex size-2 rounded-full bg-marca-500" />
          </span>
          {{ faltan(a) }}
        </p>
        <h3 class="font-display text-xl font-semibold leading-snug text-highlighted">
          {{ a.titulo }}
        </h3>
        <p class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span v-if="a.lugar" class="inline-flex items-center gap-1"><UIcon name="i-lucide-map-pin" class="size-4" />{{ a.lugar }}</span>
          <span v-if="a.organiza" class="inline-flex items-center gap-1"><UIcon name="i-lucide-users" class="size-4" />{{ a.organiza }}</span>
        </p>
        <UButton v-if="a.url" :to="a.url" target="_blank" rel="noopener" label="Más información" trailing-icon="i-lucide-arrow-up-right" color="neutral" variant="link" class="px-0" />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { DatosPortada } from '#shared/parametros'

const props = defineProps<{ agenda: DatosPortada['agenda'] }>()

// La fecha de hoy en Chiapas sólo se calcula en el navegador (evita desfases al hidratar).
const hoy = ref<string | null>(null)
onMounted(() => {
  hoy.value = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
})
// En el servidor se muestran todas las que aún no terminan según la fecha del servidor.
const referencia = computed(() => hoy.value ?? new Date().toISOString().slice(0, 10))
const proximas = computed(() => props.agenda
  .filter(a => (a.fin || a.fecha) >= referencia.value)
  .sort((a, b) => a.fecha.localeCompare(b.fecha)))

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const mes = (iso: string) => MESES[Number(iso.slice(5, 7)) - 1]

const dias = (desde: string, hasta: string) => Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86_400_000)
function faltan(a: { fecha: string, fin: string }) {
  const d = dias(hoy.value!, a.fecha)
  if (d <= 0) return 'En curso'
  if (d === 1) return 'Mañana'
  if (d < 60) return `Faltan ${d} días`
  return `Faltan ${Math.round(d / 30)} meses`
}
</script>
