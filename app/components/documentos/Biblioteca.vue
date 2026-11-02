<!-- Biblioteca de la plataforma: búsqueda, filtros, vista previa y gestión. Con `organizacionId`
     muestra sólo los documentos de esa organización (pestaña de la ficha de organización). -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar documentos" class="w-full min-w-48 flex-1 sm:max-w-xs" />
      <USelect v-model="categoria" :items="opcionesCategoria" value-key="value" class="w-52" />
      <UCheckbox v-if="pagina?.puedeSubir" v-model="noVigentes" label="Incluir no vigentes" />
      <UButton v-if="pagina?.puedeSubir" icon="i-lucide-upload" label="Subir documento" class="ml-auto" @click="abrir()" />
    </div>

    <EstadoVacio v-if="status !== 'pending' && !pagina?.datos.length" icono="i-lucide-library" titulo="No hay documentos en esta vista" :descripcion="pagina?.puedeSubir ? 'Suba estatutos, actas, convocatorias y demás documentos institucionales.' : undefined" />
    <DocumentosLista v-else-if="pagina" :documentos="pagina.datos" mostrar-nivel @editar="abrir" />

    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <UModal v-model:open="abierto" :title="editando ? 'Editar documento' : 'Subir documento'" :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <DocumentosFormulario :key="editando?.id ?? 'nuevo'" :documento="editando" :categorias="categorias" :organizacion-id="organizacionId" @cerrar="abierto = false" @guardado="alGuardar" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import type { DocumentoFila } from '~~/server/services/documentos'

const props = defineProps<{ organizacionId?: string }>()
const api = useApi()
const toast = useToast()
const POR_PAGINA = 25

const { data: categorias } = await useAsyncData('categorias-documento', () => api<{ id: string, nombre: string }[]>('/api/documentos/categorias'), { default: () => [] })
const TODAS = '__todas__'
const opcionesCategoria = computed(() => [{ label: 'Todas las categorías', value: TODAS }, ...categorias.value.map(c => ({ label: c.nombre, value: c.id }))])

const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const categoria = ref(TODAS)
const noVigentes = ref(false)
const numeroPagina = ref(1)
watch([q, categoria, noVigentes], () => (numeroPagina.value = 1))

const { data: pagina, status, refresh } = await useAsyncData(
  `documentos-${props.organizacionId ?? 'todos'}`,
  () => api<Pagina<DocumentoFila> & { puedeSubir: boolean }>('/api/documentos', {
    query: {
      q: q.value || undefined,
      categoriaId: categoria.value === TODAS ? undefined : categoria.value,
      organizacionId: props.organizacionId,
      incluirNoVigentes: noVigentes.value ? 'true' : undefined,
      pagina: numeroPagina.value,
      porPagina: POR_PAGINA,
    },
  }),
  { watch: [q, categoria, noVigentes, numeroPagina] },
)

const abierto = ref(false)
const editando = ref<DocumentoFila>()
function abrir(d?: DocumentoFila) {
  editando.value = d
  abierto.value = true
}
function alGuardar() {
  abierto.value = false
  toast.add({ title: 'Biblioteca actualizada', color: 'success', icon: 'i-lucide-check' })
  refresh()
}
</script>
