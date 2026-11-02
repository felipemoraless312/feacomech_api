<template>
  <PanelPagina id="eventos" titulo="Eventos" tamano="xl">
    <template #acciones>
      <UButton v-if="puede('evento.gestionar')" to="/plataforma/eventos/gestion" icon="i-lucide-calendar-cog" label="Gestionar" color="neutral" variant="soft" />
    </template>
    <template #herramientas>
      <UTabs v-model="pestana" :items="pestanas" :content="false" size="sm" variant="link" />
    </template>

    <div v-if="pestana === 'proximos'">
      <EstadoVacio v-if="!datos?.proximos.length" icono="i-lucide-calendar-days" titulo="No hay eventos próximos" descripcion="Cuando la Federación o su colegio publiquen eventos, aparecerán aquí." />
      <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <EventosTarjeta v-for="e in datos.proximos" :key="e.id" :to="`/plataforma/eventos/${e.id}`" :evento="e">
          <UBadge v-if="e.miEstado" :label="NOMBRE_INSCRIPCION[e.miEstado]" :color="e.miEstado === 'CONFIRMADA' ? 'success' : 'warning'" variant="soft" size="sm" />
          <UBadge v-else-if="e.lugares === 0" label="Cupo lleno" color="warning" variant="soft" size="sm" />
          <UBadge v-else-if="e.lugares != null" :label="`${e.lugares} lugares`" color="primary" variant="soft" size="sm" />
          <UBadge v-if="e.valorCurricular" :label="e.valorCurricular" color="neutral" variant="soft" size="sm" />
        </EventosTarjeta>
      </div>
    </div>

    <div v-else class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio v-if="!datos?.inscripciones.length" icono="i-lucide-ticket" titulo="Aún no se ha inscrito a ningún evento" />
      <ul v-else class="divide-y divide-default">
        <li v-for="i in datos.inscripciones" :key="i.evento.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
          <EventosFecha :fecha="i.evento.inicio" />
          <NuxtLink :to="`/plataforma/eventos/${i.evento.id}`" class="min-w-0 flex-1">
            <p class="font-medium text-highlighted hover:text-primary">
              {{ i.evento.titulo }}
            </p>
            <p class="text-sm text-muted">
              {{ rangoEvento(i.evento.inicio, i.evento.fin) }}
            </p>
          </NuxtLink>
          <EstadoPunto :texto="i.evento.estado === 'CANCELADO' ? 'Evento cancelado' : NOMBRE_INSCRIPCION[i.estado]" :tono="i.evento.estado === 'CANCELADO' ? 'error' : i.estado === 'CONFIRMADA' ? 'exito' : 'alerta'" />
          <UButton v-if="i.constancia && !i.constancia.revocadaEn" :to="`/imprimir/constancia/${i.constancia.id}`" icon="i-lucide-award" label="Constancia" size="sm" />
        </li>
      </ul>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NOMBRE_INSCRIPCION } from '#shared/schemas/eventos'
import type { EventosUsuarioDto } from '~~/server/services/eventos'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Eventos' })

const api = useApi()
const route = useRoute()
const { puede } = usePermisos()
const pestanas = [{ label: 'Próximos eventos', value: 'proximos' }, { label: 'Mis inscripciones y constancias', value: 'mias' }]
const pestana = ref(route.query.p === 'mias' ? 'mias' : 'proximos')

const { data: datos } = await useAsyncData('eventos-usuario', () => api<EventosUsuarioDto>('/api/eventos'))
</script>
