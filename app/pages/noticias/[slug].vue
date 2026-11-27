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
      <p v-if="n.resumen" class="justificado text-xl leading-relaxed text-highlighted">
        {{ n.resumen }}
      </p>
      <SitioTexto :texto="n.contenido" />

      <!-- Galería de fotos -->
      <section v-if="n.fotos?.length" class="space-y-4">
        <h2 class="flex items-center gap-2 font-display text-xl font-semibold text-highlighted">
          <UIcon name="i-lucide-images" class="size-5 text-primary" /> Galería
          <span class="text-sm font-normal text-muted">· {{ n.fotos.length }} {{ n.fotos.length === 1 ? 'foto' : 'fotos' }}</span>
        </h2>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            v-for="(f, i) in n.fotos"
            :key="f.id"
            type="button"
            class="group relative block overflow-hidden rounded-xl bg-muted"
            :class="n.fotos.length > 2 && i === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-auto' : 'aspect-square'"
            :aria-label="f.pie ?? `Ver foto ${i + 1}`"
            @click="visor = i"
          >
            <img :src="`/api/archivos/${f.archivoId}`" :alt="f.pie ?? `Foto ${i + 1} de ${n.titulo}`" loading="lazy" class="size-full object-cover transition duration-500 group-hover:scale-105">
            <span v-if="f.pie" class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">{{ f.pie }}</span>
          </button>
        </div>
      </section>
      <div class="border-t border-default pt-6">
        <UButton to="/noticias" label="Más noticias" icon="i-lucide-arrow-left" color="neutral" variant="ghost" />
      </div>
    </UContainer>

    <!-- Visor de la galería -->
    <Teleport to="body">
      <div v-if="visor !== null && n.fotos?.[visor]" class="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label="Galería" @click.self="visor = null">
        <div class="flex items-center justify-between p-3 sm:p-4">
          <p class="text-sm text-white/60">{{ visor + 1 }} de {{ n.fotos.length }}</p>
          <button type="button" class="rounded-full p-2 hover:bg-white/10" aria-label="Cerrar" @click="visor = null"><UIcon name="i-lucide-x" class="size-6" /></button>
        </div>
        <div class="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" @click.self="visor = null">
          <img :key="n.fotos[visor]!.id" :src="`/api/archivos/${n.fotos[visor]!.archivoId}`" :alt="n.fotos[visor]!.pie ?? ''" class="max-h-full max-w-full rounded-md object-contain">
          <button v-if="visor > 0" type="button" class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Anterior" @click="visor--"><UIcon name="i-lucide-chevron-left" class="size-6" /></button>
          <button v-if="visor < n.fotos.length - 1" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Siguiente" @click="visor++"><UIcon name="i-lucide-chevron-right" class="size-6" /></button>
        </div>
        <p v-if="n.fotos[visor]!.pie" class="p-4 text-center text-sm text-white/85 sm:px-8">{{ n.fotos[visor]!.pie }}</p>
      </div>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import { NOMBRE_NOTICIA } from '#shared/schemas/portal'
import { formatoFecha } from '#shared/texto'
import type { NoticiaPublica } from '~~/server/services/noticias'

const route = useRoute()
const { data: n, error } = await useFetch<NoticiaPublica & { contenido: string, fotos: { id: string, archivoId: string, pie: string | null }[] }>(`/api/publico/noticias/${route.params.slug}`)
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

// Visor de la galería: flechas del teclado y Esc
const visor = ref<number | null>(null)
function teclas(e: KeyboardEvent) {
  const total = n.value?.fotos?.length ?? 0
  if (visor.value === null) return
  if (e.key === 'Escape') visor.value = null
  else if (e.key === 'ArrowRight' && visor.value < total - 1) visor.value++
  else if (e.key === 'ArrowLeft' && visor.value > 0) visor.value--
}
watch(visor, (v) => { document.documentElement.style.overflow = v === null ? '' : 'hidden' })
onMounted(() => window.addEventListener('keydown', teclas))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', teclas)
  document.documentElement.style.overflow = ''
})
</script>
