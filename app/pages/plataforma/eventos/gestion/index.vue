<template>
  <PanelPagina id="eventos-gestion" titulo="Gestión de eventos" tamano="lg">
    <template #acciones>
      <UButton icon="i-lucide-plus" label="Nuevo evento" @click="abierto = true" />
    </template>
    <template #herramientas>
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar por título" class="w-full min-w-48 max-w-xs" />
      <UTabs v-model="periodo" :items="pestanas" :content="false" size="sm" />
    </template>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio v-if="status !== 'pending' && !pagina?.datos.length" icono="i-lucide-calendar-days" titulo="No hay eventos en esta vista">
        <UButton label="Crear evento" @click="abierto = true" />
      </EstadoVacio>
      <ul v-else class="divide-y divide-default">
        <li v-for="e in pagina?.datos" :key="e.id">
          <NuxtLink :to="`/plataforma/eventos/gestion/${e.id}`" class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60">
            <EventosFecha :fecha="e.inicio" />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
                {{ NOMBRE_TIPO_EVENTO[e.tipo] }} · {{ NOMBRE_MODALIDAD[e.modalidad] }}<template v-if="e.organizacion">
                  · {{ e.organizacion.siglas || e.organizacion.nombre }}
                </template>
              </p>
              <p class="truncate font-medium text-highlighted">
                {{ e.titulo }}
              </p>
              <p class="text-sm text-muted">
                {{ e.confirmados }} inscrito(s){{ e.capacidad ? ` de ${e.capacidad}` : '' }}
              </p>
            </div>
            <EstadoPunto :texto="NOMBRE_ESTADO_EVENTO[e.estado]" :tono="e.estado === 'PUBLICADO' ? 'exito' : e.estado === 'CANCELADO' ? 'error' : 'neutro'" />
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="mt-6 flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <UModal v-model:open="abierto" title="Nuevo evento" :ui="{ content: 'sm:max-w-3xl' }">
      <template #body>
        <EventosFormulario cancelable @cancelar="abierto = false" @guardado="id => navigateTo(`/plataforma/eventos/gestion/${id}`)" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import { NOMBRE_ESTADO_EVENTO, NOMBRE_MODALIDAD, NOMBRE_TIPO_EVENTO } from '#shared/schemas/eventos'
import type { EventoFila } from '~~/server/services/eventos'

definePageMeta({ layout: 'plataforma', permiso: 'evento.gestionar' })
useSeoMeta({ title: 'Gestión de eventos' })

const api = useApi()
const POR_PAGINA = 20
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const periodo = ref<'proximos' | 'pasados'>('proximos')
const pestanas = [{ label: 'Próximos', value: 'proximos' }, { label: 'Anteriores', value: 'pasados' }]
const numeroPagina = ref(1)
watch([q, periodo], () => (numeroPagina.value = 1))
const abierto = ref(false)

const { data: pagina, status } = await useAsyncData(
  'eventos-gestion',
  () => api<Pagina<EventoFila>>('/api/eventos/gestion', { query: { q: q.value || undefined, periodo: periodo.value, pagina: numeroPagina.value, porPagina: POR_PAGINA } }),
  { watch: [q, periodo, numeroPagina] },
)
</script>
