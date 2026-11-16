<template>
  <article v-if="n">
    <header class="relative isolate overflow-hidden bg-gradient-to-b from-marca-50 to-default dark:from-marca-950/40">
      <UContainer class="max-w-3xl py-12 sm:py-16">
        <NuxtLink to="/noticias" class="inline-flex items-center gap-1 text-sm text-muted hover:text-highlighted">
          <UIcon name="i-lucide-arrow-left" class="size-4" /> Noticias
        </NuxtLink>
        <p class="entrada mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-marca-700 dark:text-marca-300">
          {{ NOMBRE_NOTICIA[n.tipo] }}
        </p>
        <h1 class="entrada mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-highlighted text-balance sm:text-5xl" style="--retraso: 80ms">
          {{ n.titulo }}
        </h1>
        <p class="entrada mt-4 text-sm text-muted" style="--retraso: 140ms">
          {{ formatoFecha(n.publicadaEn) }}
          <template v-if="n.organizacion">
            ·
            <NuxtLink v-if="n.organizacion.slug" :to="`/directorio/${n.organizacion.slug}`" class="hover:text-primary">{{ n.organizacion.nombre }}</NuxtLink>
            <template v-else>
              {{ n.organizacion.nombre }}
            </template>
          </template>
        </p>
      </UContainer>
    </header>

    <UContainer class="max-w-3xl space-y-8 pb-20">
      <!-- Proporción original (banners horizontales y carteles verticales se ven completos); clic = tamaño real -->
      <a v-if="n.portadaId" :href="`/api/archivos/${n.portadaId}`" target="_blank" rel="noopener" class="entrada block" title="Ver imagen en tamaño completo">
        <img :src="`/api/archivos/${n.portadaId}`" :alt="n.titulo" class="mx-auto h-auto max-h-[85vh] w-auto max-w-full rounded-xl shadow-tarjeta">
      </a>
      <p v-if="n.resumen" class="text-xl leading-relaxed text-highlighted">
        {{ n.resumen }}
      </p>
      <SitioTexto :texto="n.contenido" />
      <div class="border-t border-default pt-6">
        <UButton to="/noticias" label="Más noticias" icon="i-lucide-arrow-left" color="neutral" variant="ghost" />
      </div>
    </UContainer>
  </article>
</template>

<script setup lang="ts">
import { NOMBRE_NOTICIA } from '#shared/schemas/portal'
import { formatoFecha } from '#shared/texto'
import type { NoticiaPublica } from '~~/server/services/noticias'

const route = useRoute()
const { data: n, error } = await useFetch<NoticiaPublica & { contenido: string }>(`/api/publico/noticias/${route.params.slug}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Noticia no encontrada', fatal: true })

useSeoMeta({
  title: () => n.value?.titulo ?? 'Noticia',
  description: () => n.value?.resumen ?? n.value?.contenido.slice(0, 160),
})
useCompartir({
  tipo: 'article',
  titulo: () => n.value?.titulo,
  descripcion: () => n.value?.resumen ?? n.value?.contenido.slice(0, 200),
  imagen: () => n.value?.portadaId ? `/api/archivos/${n.value.portadaId}` : null,
})
</script>
