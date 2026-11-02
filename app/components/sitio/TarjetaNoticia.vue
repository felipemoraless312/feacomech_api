<template>
  <NuxtLink :to="`/noticias/${noticia.slug}`" class="group flex flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante">
    <div class="aspect-[16/9] overflow-hidden bg-marca-50 dark:bg-marca-950">
      <img v-if="noticia.portadaId" :src="`/api/archivos/${noticia.portadaId}`" alt="" class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy">
      <div v-else class="flex size-full items-center justify-center">
        <MarcaRed class="size-40 text-marca-200 dark:text-marca-800" />
      </div>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <p class="text-xs font-medium uppercase tracking-wide text-marca-700 dark:text-marca-300">
        {{ NOMBRE_NOTICIA[noticia.tipo] }}<template v-if="noticia.organizacion">
          · {{ noticia.organizacion.nombre }}
        </template>
      </p>
      <p class="mt-2 font-display text-lg font-semibold leading-snug text-highlighted group-hover:text-primary">
        {{ noticia.titulo }}
      </p>
      <p v-if="noticia.resumen" class="mt-2 line-clamp-3 text-sm text-muted">
        {{ noticia.resumen }}
      </p>
      <p class="mt-auto pt-4 text-xs text-dimmed">
        {{ formatoFecha(noticia.publicadaEn) }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { NOMBRE_NOTICIA } from '#shared/schemas/portal'
import { formatoFecha } from '#shared/texto'
import type { NoticiaPublica } from '~~/server/services/noticias'

defineProps<{ noticia: Pick<NoticiaPublica, 'slug' | 'tipo' | 'titulo' | 'resumen' | 'publicadaEn' | 'portadaId' | 'organizacion'> }>()
</script>
