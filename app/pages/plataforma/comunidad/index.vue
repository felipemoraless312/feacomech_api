<template>
  <PanelPagina id="comunidad" titulo="Comunidad médica" tamano="xl">
    <template #acciones>
      <UButton v-if="puedeModerar" to="/plataforma/moderacion" icon="i-lucide-shield-check" label="Moderación" color="neutral" variant="soft" />
    </template>

    <EstadoVacio
      v-if="grupos && !grupos.grupos.length"
      icono="i-lucide-messages-square"
      titulo="Aún no participa en la comunidad"
      descripcion="La comunidad está disponible para los profesionales afiliados. Si ya lo es, pida a su colegio que valide su afiliación."
    />

    <div v-else class="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside class="hidden lg:block">
        <ComunidadListaGrupos :grupos="grupos?.grupos ?? []" class="sticky top-4" />
      </aside>

      <div class="min-w-0 space-y-5">
        <div class="lg:hidden">
          <USelectMenu :items="opcionesGrupo" value-key="value" placeholder="Ir a un grupo…" class="w-full" @update:model-value="(v: string) => navigateTo(`/plataforma/comunidad/${v}`)" />
        </div>

        <div v-if="general?.acceso.publicar" class="rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <p class="mb-3 text-sm text-muted">
            Publicar en <strong class="text-highlighted">{{ general.nombre }}</strong>
          </p>
          <ComunidadCompositor :grupo-id="general.id" @publicado="() => refresh()" />
        </div>

        <div class="flex items-center justify-between gap-3">
          <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
            Actividad reciente
          </h2>
          <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar" size="sm" class="w-48" />
        </div>

        <EstadoVacio v-if="status !== 'pending' && !pagina?.datos.length" icono="i-lucide-message-circle" :titulo="q ? 'Sin resultados' : 'Aún no hay publicaciones'" :descripcion="q ? undefined : 'Sea el primero en iniciar una conversación.'" />
        <ComunidadTarjetaPublicacion v-for="p in pagina?.datos" :key="p.id" :p="p" mostrar-grupo @reportar="reportar" />
        <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="flex justify-center">
          <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
        </div>
      </div>
    </div>

    <ComunidadDialogoReporte v-model:open="reporteAbierto" :url="reporteUrl" />
  </PanelPagina>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import type { GruposDto, PublicacionFila } from '~~/server/services/comunidad'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Comunidad' })

const api = useApi()
const { puede } = usePermisos()
const POR_PAGINA = 15

const { data: grupos } = await useAsyncData('comunidad-grupos', () => api<GruposDto>('/api/comunidad/grupos'))
const general = computed(() => grupos.value?.grupos.find(g => g.tipo === 'GENERAL' && g.activo))
const puedeModerar = computed(() => puede('comunidad.moderar') || puede('grupo.administrar') || grupos.value?.grupos.some(g => g.acceso.moderar))
const opcionesGrupo = computed(() => (grupos.value?.grupos ?? []).filter(g => g.activo).map(g => ({ label: g.nombre, value: g.slug })))

const busqueda = ref('')
const q = refDebounced(busqueda, 350)
const numeroPagina = ref(1)
watch(q, () => (numeroPagina.value = 1))
const { data: pagina, status, refresh } = await useAsyncData(
  'comunidad-actividad',
  () => api<Pagina<PublicacionFila>>('/api/comunidad/publicaciones', { query: { q: q.value || undefined, pagina: numeroPagina.value, porPagina: POR_PAGINA } }),
  { watch: [q, numeroPagina] },
)

const reporteAbierto = ref(false)
const reporteUrl = ref('')
function reportar(id: string) {
  reporteUrl.value = `/api/comunidad/publicaciones/${id}/reportes`
  reporteAbierto.value = true
}
</script>
