<template>
  <div>
    <SitioEncabezado antetitulo="Transparencia" titulo="Documentos institucionales" descripcion="Estatutos, reglamentos, convocatorias y demás documentos públicos de la Federación." />
    <UContainer class="space-y-6 py-12">
      <div v-if="datos?.total || categoria !== TODAS" class="flex flex-wrap gap-3">
        <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar documentos" class="w-full sm:max-w-xs" />
        <USelect v-model="categoria" :items="opciones" value-key="value" class="w-full sm:w-56" />
      </div>
      <EstadoVacio v-if="!datos?.datos.length" icono="i-lucide-library" titulo="Aún no hay documentos públicos" descripcion="Los afiliados consultan documentos adicionales en la plataforma." />
      <DocumentosLista v-else :documentos="datos.datos" />
      <div v-if="(datos?.total ?? 0) > POR_PAGINA" class="flex justify-center">
        <UPagination v-model:page="numeroPagina" :total="datos?.total ?? 0" :items-per-page="POR_PAGINA" />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { DocumentoLista } from '~/types/documentos'

useSeoMeta({ title: 'Documentos', description: 'Documentos públicos de la Federación: estatutos, reglamentos y convocatorias.' })

const POR_PAGINA = 25
const TODAS = '__todas__'
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const categoria = ref(TODAS)
const numeroPagina = ref(1)
watch([q, categoria], () => (numeroPagina.value = 1))

const { data: datos } = await useFetch<{ total: number, datos: DocumentoLista[], categorias: { id: string, nombre: string }[] }>('/api/publico/documentos', {
  query: computed(() => ({ q: q.value || undefined, categoriaId: categoria.value === TODAS ? undefined : categoria.value, pagina: numeroPagina.value, porPagina: POR_PAGINA })),
})
const opciones = computed(() => [{ label: 'Todas las categorías', value: TODAS }, ...(datos.value?.categorias ?? []).map(c => ({ label: c.nombre, value: c.id }))])
</script>
