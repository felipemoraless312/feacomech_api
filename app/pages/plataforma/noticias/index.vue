<template>
  <PanelPagina id="noticias" titulo="Noticias y comunicados" tamano="lg">
    <template #acciones>
      <UButton to="/plataforma/noticias/nueva" icon="i-lucide-plus" label="Redactar" />
    </template>
    <template #herramientas>
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar por título" class="w-full min-w-48 max-w-xs" />
      <USelect v-model="filtroTipo" :items="opcionesTipo" value-key="value" class="w-48 shrink-0" />
      <USelect v-model="filtroEstado" :items="opcionesEstado" value-key="value" class="w-40 shrink-0" />
    </template>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio v-if="status !== 'pending' && !pagina?.datos.length" icono="i-lucide-newspaper" titulo="No hay noticias en esta vista">
        <UButton to="/plataforma/noticias/nueva" label="Redactar la primera" />
      </EstadoVacio>
      <ul v-else class="divide-y divide-default">
        <li v-for="n in pagina?.datos" :key="n.id">
          <NuxtLink :to="`/plataforma/noticias/${n.id}`" class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60">
            <span class="hidden size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
              <img v-if="n.portadaId" :src="`/api/archivos/${n.portadaId}`" alt="" class="size-full object-cover" loading="lazy">
              <UIcon v-else name="i-lucide-newspaper" class="m-5 size-6 text-dimmed" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
                {{ NOMBRE_NOTICIA[n.tipo] }}<template v-if="n.organizacion">
                  · {{ n.organizacion.siglas || n.organizacion.nombre }}
                </template>
              </p>
              <p class="mt-0.5 truncate font-medium text-highlighted">
                <UIcon v-if="n.destacada" name="i-lucide-star" class="mr-1 size-4 align-[-2px] text-warning" />{{ n.titulo }}
              </p>
              <p class="text-sm text-muted">
                {{ n.autor ? `${n.autor.nombre} ${n.autor.apellidoPaterno} · ` : '' }}{{ n.publicadaEn ? `Publicada ${formatoFecha(n.publicadaEn)}` : `Actualizada ${formatoFechaHora(n.actualizadoEn)}` }}
              </p>
            </div>
            <EstadoPunto :texto="NOMBRE_ESTADO_NOTICIA[n.estado]" :tono="TONO[n.estado]" />
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="mt-6 flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import { ESTADOS_NOTICIA, NOMBRE_ESTADO_NOTICIA, NOMBRE_NOTICIA, TIPOS_NOTICIA } from '#shared/schemas/portal'
import { formatoFecha, formatoFechaHora } from '#shared/texto'
import type { NoticiaFila } from '~~/server/services/noticias'
import type { TonoEstado } from '~/components/EstadoPunto.vue'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Noticias' })

const api = useApi()
const TONO: Record<string, TonoEstado> = { BORRADOR: 'neutro', REVISION: 'alerta', PUBLICADA: 'exito', RETIRADA: 'error' }

const TODOS = '__todos__'
const POR_PAGINA = 20
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const filtroTipo = ref(TODOS)
const filtroEstado = ref(TODOS)
const numeroPagina = ref(1)
watch([q, filtroTipo, filtroEstado], () => (numeroPagina.value = 1))
const opcionesTipo = [{ label: 'Todos los tipos', value: TODOS }, ...TIPOS_NOTICIA.map(t => ({ label: NOMBRE_NOTICIA[t], value: t }))]
const opcionesEstado = [{ label: 'Todos', value: TODOS }, ...ESTADOS_NOTICIA.map(e => ({ label: NOMBRE_ESTADO_NOTICIA[e], value: e }))]

const { data: pagina, status } = await useAsyncData(
  'noticias-panel',
  () => api<Pagina<NoticiaFila>>('/api/noticias', {
    query: {
      q: q.value || undefined,
      tipo: filtroTipo.value === TODOS ? undefined : filtroTipo.value,
      estado: filtroEstado.value === TODOS ? undefined : filtroEstado.value,
      pagina: numeroPagina.value,
      porPagina: POR_PAGINA,
    },
  }),
  { watch: [q, filtroTipo, filtroEstado, numeroPagina] },
)
</script>
