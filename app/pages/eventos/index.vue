<template>
  <div>
    <SitioEncabezado antetitulo="Eventos" titulo="Educación médica continua" descripcion="Congresos, cursos, conferencias, talleres y jornadas médicas de la Federación y sus organizaciones.">
      <div class="flex flex-wrap gap-2">
        <UTabs v-model="vista" :items="vistas" :content="false" size="sm" />
      </div>
    </SitioEncabezado>

    <UContainer class="space-y-8 py-12">
      <template v-if="vista === 'calendario'">
        <EventosCalendario v-model="mes" :eventos="delMes?.datos ?? []" />
        <div v-if="delMes?.datos.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EventosTarjeta v-for="e in delMes.datos" :key="e.slug" :to="`/eventos/${e.slug}`" :evento="e" />
        </div>
        <p v-else class="text-center text-muted">
          Sin eventos este mes.
        </p>
      </template>

      <template v-else>
        <EstadoVacio
          v-if="!lista?.datos.length"
          icono="i-lucide-calendar-days"
          :titulo="vista === 'proximos' ? 'No hay eventos próximos anunciados' : 'Aún no hay eventos anteriores'"
          descripcion="Consulte esta sección periódicamente."
        />
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EventosTarjeta v-for="e in lista.datos" :key="e.slug" v-revelar :to="`/eventos/${e.slug}`" :evento="e" />
        </div>
        <div v-if="(lista?.total ?? 0) > POR_PAGINA" class="flex justify-center">
          <UPagination v-model:page="numeroPagina" :total="lista?.total ?? 0" :items-per-page="POR_PAGINA" />
        </div>
      </template>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { EventoPublico } from '~~/server/services/eventos'

useSeoMeta({ title: 'Eventos', description: 'Congresos, cursos, conferencias, talleres y jornadas médicas en Chiapas.' })

const POR_PAGINA = 12
const vista = ref<'proximos' | 'calendario' | 'pasados'>('proximos')
const vistas = [{ label: 'Próximos', value: 'proximos' }, { label: 'Calendario', value: 'calendario' }, { label: 'Anteriores', value: 'pasados' }]
const numeroPagina = ref(1)
watch(vista, () => (numeroPagina.value = 1))
const mes = ref(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date()).slice(0, 7))

type Pagina = { total: number, datos: EventoPublico[] }
const { data: lista } = await useFetch<Pagina>('/api/publico/eventos', {
  query: computed(() => ({ periodo: vista.value === 'pasados' ? 'pasados' : 'proximos', pagina: numeroPagina.value, porPagina: POR_PAGINA })),
})
const { data: delMes } = await useFetch<Pagina>('/api/publico/eventos', {
  query: computed(() => ({ mes: mes.value, porPagina: 100 })),
  immediate: false,
  watch: [mes, vista],
})
</script>
