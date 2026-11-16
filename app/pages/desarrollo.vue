<!-- Créditos: quién desarrolló la plataforma web, en un resumen breve. Enlazada desde el pie de
     página y desde /contacto. Datos en shared/desarrollo.ts. -->
<template>
  <div>
    <SitioEncabezado antetitulo="Créditos" titulo="Desarrollo de la plataforma" />

    <UContainer class="py-14">
      <article class="mx-auto flex max-w-4xl flex-col items-center gap-10 sm:flex-row sm:items-start">
        <SitioRetratoInstitucional
          v-revelar.izquierda
          :src="d.retrato"
          :recorte="d.recorte"
          :alt="`Fotografía de ${d.nombre}`"
          class="shrink-0 sm:w-60"
        />

        <div v-revelar="80" class="min-w-0 sm:pt-4">
          <p class="rotulo">
            Diseño y desarrollo web
          </p>
          <h2 class="mt-3 font-display text-3xl font-bold tracking-tight text-highlighted">
            {{ d.nombre }}
          </h2>
          <p class="mt-1 font-medium text-toned">
            {{ d.cargo }}
          </p>
          <p class="mt-5 text-[17px] leading-relaxed text-muted text-pretty">
            {{ d.resumen }}
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <UButton :to="d.nota.enlace" target="_blank" :label="d.nota.texto" trailing-icon="i-lucide-arrow-up-right" color="neutral" variant="outline" />
            <UButton to="/contacto" label="Contacto" icon="i-lucide-mail" color="neutral" variant="ghost" />
          </div>
        </div>
      </article>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { DESARROLLADOR as d } from '#shared/desarrollo'

useSeoMeta({ title: 'Desarrollo de la plataforma', description: d.resumen.slice(0, 200) })
useCompartir({ titulo: `Desarrollo de la plataforma · ${d.nombre}`, descripcion: d.resumen.slice(0, 200), imagen: d.retrato })
</script>
