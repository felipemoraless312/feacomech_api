<template>
  <div>
    <SitioEncabezado antetitulo="Noticias" titulo="Comunicados y noticias" descripcion="Comunicados oficiales, noticias institucionales, actividades y publicaciones de la Federación y sus organizaciones.">
      <nav class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Tipos de noticia">
        <NuxtLink
          v-for="t in tipos"
          :key="t.value"
          :to="{ query: t.value ? { tipo: t.value } : {} }"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="(tipo ?? '') === t.value
            ? 'bg-acento-500 text-white shadow-[0_6px_16px_-6px_rgb(217_106_34/0.6)]'
            : 'bg-white/85 text-marca-800 ring-1 ring-marca-200 hover:bg-white hover:text-marca-950 hover:ring-marca-300 dark:bg-white/10 dark:text-white/85 dark:ring-white/15 dark:hover:bg-white/20 dark:hover:text-white'"
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </SitioEncabezado>

    <UContainer class="space-y-10 py-14">
      <EstadoVacio v-if="!pagina?.datos.length" icono="i-lucide-newspaper" titulo="Aún no hay publicaciones en esta sección" />
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SitioTarjetaNoticia v-for="n in pagina.datos" :key="n.slug" v-revelar :noticia="n" />
      </div>
      <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="flex justify-center">
        <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { NOMBRE_NOTICIA, TIPOS_NOTICIA } from '#shared/schemas/portal'
import type { NoticiaPublica } from '~~/server/services/noticias'

useSeoMeta({ title: 'Noticias', description: 'Comunicados, noticias y actividades de la Federación.' })

const route = useRoute()
const POR_PAGINA = 12
const tipo = computed(() => (typeof route.query.tipo === 'string' && (TIPOS_NOTICIA as readonly string[]).includes(route.query.tipo) ? route.query.tipo : undefined))
const numeroPagina = ref(1)
watch(tipo, () => (numeroPagina.value = 1))
const tipos = [{ label: 'Todas', value: '' }, ...TIPOS_NOTICIA.map(t => ({ label: NOMBRE_NOTICIA[t], value: t }))]

const { data: pagina } = await useFetch<{ total: number, datos: NoticiaPublica[] }>('/api/publico/noticias', {
  query: computed(() => ({ tipo: tipo.value, pagina: numeroPagina.value, porPagina: POR_PAGINA })),
})
</script>
