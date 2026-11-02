<template>
  <PanelPagina id="organizaciones" titulo="Colegios y asociaciones" tamano="xl">
    <template #acciones>
      <UButton v-if="puede('organizacion.administrar')" icon="i-lucide-plus" label="Nueva organización" @click="abierto = true" />
    </template>
    <template #herramientas>
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar por nombre, siglas o municipio" class="w-full min-w-48 max-w-sm" />
      <USelect v-model="filtroTipo" :items="opcionesTipo" value-key="value" class="w-40 shrink-0" />
      <USelect v-model="filtroEstado" :items="opcionesEstado" value-key="value" class="w-40 shrink-0" />
    </template>

    <EstadoVacio
      v-if="status !== 'pending' && !pagina?.datos.length"
      icono="i-lucide-landmark"
      :titulo="hayFiltros ? 'Ninguna organización coincide' : 'Aún no hay organizaciones registradas'"
      :descripcion="hayFiltros ? 'Cambie los filtros de búsqueda.' : 'Registre los colegios y asociaciones con sus datos oficiales.'"
    >
      <UButton v-if="!hayFiltros && puede('organizacion.administrar')" icon="i-lucide-plus" label="Registrar la primera" @click="abierto = true" />
    </EstadoVacio>

    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="(o, i) in pagina?.datos"
        :key="o.id"
        :to="`/plataforma/organizaciones/${o.id}`"
        class="entrada group flex flex-col rounded-2xl bg-default p-5 shadow-tarjeta transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante"
        :style="{ '--retraso': `${Math.min(i, 8) * 40}ms` }"
      >
        <div class="flex items-start gap-4">
          <LogoOrganizacion :logo-id="o.logoId" :nombre="o.siglas || o.nombre" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              {{ NOMBRE_TIPO[o.tipo] }}<template v-if="o.municipio">
                · {{ o.municipio }}
              </template>
            </p>
            <p class="mt-0.5 font-medium leading-snug text-highlighted group-hover:text-primary">
              {{ o.nombre }}
            </p>
          </div>
        </div>
        <div class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-sm">
          <EstadoPunto :texto="NOMBRE_AFILIACION[o.estadoAfiliacion]" :tono="TONO_AFILIACION[o.estadoAfiliacion]" />
          <span class="flex items-center gap-3 text-muted">
            <span class="inline-flex items-center gap-1"><UIcon name="i-lucide-users" class="size-4" />{{ o.integrantes }}</span>
            <UBadge v-if="o.solicitudes" :label="`${o.solicitudes} pendiente(s)`" color="warning" variant="soft" size="sm" />
          </span>
        </div>
      </NuxtLink>
    </div>

    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="mt-6 flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <UModal v-model:open="abierto" title="Nueva organización" :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <OrganizacionesFormulario modo="crear" @cancelar="abierto = false" @guardado="alGuardar" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import { ESTADOS_AFILIACION, NOMBRE_AFILIACION, NOMBRE_TIPO, TIPOS_ORGANIZACION } from '#shared/schemas/organizacion'
import type { OrganizacionFila } from '~~/server/services/organizaciones'

definePageMeta({ layout: 'plataforma', permiso: 'organizacion.ver' })
useSeoMeta({ title: 'Colegios y asociaciones' })

const api = useApi()
const toast = useToast()
const { puede } = usePermisos()

const TODOS = '__todos__'
const POR_PAGINA = 24
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const filtroTipo = ref(TODOS)
const filtroEstado = ref(TODOS)
const numeroPagina = ref(1)
watch([q, filtroTipo, filtroEstado], () => (numeroPagina.value = 1))
const hayFiltros = computed(() => !!q.value || filtroTipo.value !== TODOS || filtroEstado.value !== TODOS)

const opcionesTipo = [{ label: 'Todos los tipos', value: TODOS }, ...TIPOS_ORGANIZACION.map(t => ({ label: NOMBRE_TIPO[t], value: t }))]
const opcionesEstado = [{ label: 'Todos los estados', value: TODOS }, ...ESTADOS_AFILIACION.map(e => ({ label: NOMBRE_AFILIACION[e], value: e }))]

const { data: pagina, status, refresh } = await useAsyncData(
  'organizaciones',
  () => api<Pagina<OrganizacionFila>>('/api/organizaciones', {
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

const abierto = ref(false)
function alGuardar() {
  abierto.value = false
  toast.add({ title: 'Organización registrada', color: 'success', icon: 'i-lucide-check' })
  refresh()
}
</script>
