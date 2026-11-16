<!-- Créditos: quién diseñó y desarrolló la plataforma web. Enlazada desde el pie de página.
     Datos en shared/desarrollo.ts. -->
<template>
  <div>
    <SitioEncabezado antetitulo="Créditos" titulo="Desarrollo de la plataforma" descripcion="Quién diseñó y construyó el portal y la plataforma digital de la Federación." />

    <UContainer class="space-y-16 py-14">
      <!-- Presentación: foto a la izquierda y el texto alrededor -->
      <article class="flow-root">
        <SitioRetratoInstitucional
          v-revelar.izquierda
          :src="d.retrato"
          :recorte="d.recorte"
          :alt="`Fotografía de ${d.nombre}`"
          class="mb-10 sm:float-left sm:mb-6 sm:mr-12 sm:w-64 lg:w-72"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-marca-700 dark:text-marca-300">
            {{ d.titulo }}
          </p>
          <p class="mt-0.5 text-sm text-muted">
            {{ d.idiomas }}
          </p>
        </SitioRetratoInstitucional>

        <p v-revelar class="rotulo">
          {{ d.rol }}
        </p>
        <h2 class="mt-3 font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
          {{ d.nombre }}
        </h2>
        <p
          v-for="(p, i) in d.presentacion"
          :key="i"
          class="mt-5 leading-relaxed text-pretty"
          :class="i === 0 ? 'font-display text-xl font-medium text-highlighted sm:text-2xl sm:leading-snug' : 'text-[17px] text-toned'"
        >
          {{ p }}
        </p>
        <div class="mt-6 flex flex-wrap gap-1.5">
          <span v-for="h in d.habilidades" :key="h" class="rounded-full bg-marca-50 px-3 py-1 text-[13px] font-medium text-marca-800 ring-1 ring-marca-100 dark:bg-marca-950 dark:text-marca-200 dark:ring-marca-800">
            {{ h }}
          </span>
        </div>
      </article>

      <!-- Lo que se construyó -->
      <section class="space-y-6">
        <div v-revelar>
          <p class="rotulo">
            Para la Federación
          </p>
          <h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">
            Lo que se construyó
          </h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(a, n) in d.aportes"
            :key="a.titulo"
            v-revelar="(n % 3) * 80"
            class="elevar group rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default"
          >
            <span class="flex size-11 items-center justify-center rounded-xl bg-marca-100 text-marca-700 transition-colors duration-300 group-hover:bg-acento-500 group-hover:text-white dark:bg-marca-900 dark:text-marca-200">
              <UIcon :name="a.icono" class="icono-salto size-5" />
            </span>
            <p class="mt-4 font-display text-lg font-semibold text-highlighted">
              {{ a.titulo }}
            </p>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              {{ a.texto }}
            </p>
          </div>
        </div>
      </section>

      <div class="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
        <!-- Experiencia -->
        <section class="space-y-6">
          <h2 v-revelar class="font-display text-2xl font-bold tracking-tight text-highlighted">
            Experiencia
          </h2>
          <ol class="relative space-y-8 border-s-2 border-marca-200 ps-6 dark:border-marca-800">
            <li v-for="(e, n) in d.experiencia" :key="e.cargo" v-revelar="Math.min(n, 3) * 60" class="relative">
              <span class="absolute -start-[1.95rem] top-1.5 size-3.5 rounded-full bg-default ring-4 ring-marca-500/30" aria-hidden="true">
                <span class="absolute inset-[3px] rounded-full bg-marca-600 dark:bg-marca-300" />
              </span>
              <p class="text-xs font-semibold uppercase tracking-wide text-acento-600 dark:text-acento-400">
                {{ e.periodo }}
              </p>
              <p class="mt-1 font-display text-lg font-semibold leading-snug text-highlighted">
                {{ e.cargo }}
              </p>
              <p class="text-sm font-medium text-toned">
                {{ e.lugar }}
              </p>
              <p class="mt-1.5 text-[15px] leading-relaxed text-muted">
                {{ e.texto }}
              </p>
            </li>
          </ol>
        </section>

        <!-- Formación -->
        <section class="space-y-6">
          <h2 v-revelar class="font-display text-2xl font-bold tracking-tight text-highlighted">
            Formación y certificaciones
          </h2>
          <ul class="divide-y divide-default overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default">
            <li v-for="f in d.formacion" :key="f.titulo" class="flex gap-3 px-5 py-4">
              <UIcon name="i-lucide-graduation-cap" class="mt-0.5 size-5 shrink-0 text-marca-600 dark:text-marca-300" />
              <div class="min-w-0">
                <p class="font-medium leading-snug text-highlighted">
                  {{ f.titulo }}
                </p>
                <p class="text-sm text-muted">
                  {{ f.lugar }} · {{ f.periodo }}
                </p>
              </div>
            </li>
          </ul>
          <p class="text-sm text-muted">
            ¿Encontró un error en el sitio o tiene una sugerencia?
            <NuxtLink to="/contacto" class="font-medium text-primary hover:underline">Escríbanos</NuxtLink>.
          </p>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { DESARROLLADOR as d } from '#shared/desarrollo'

const descripcion = `${d.nombre}, ${d.titulo.toLowerCase()}: ${d.rol.toLowerCase()} de la FEACOMECH.`
useSeoMeta({ title: 'Desarrollo de la plataforma', description: descripcion })
useCompartir({ titulo: `Desarrollo de la plataforma · ${d.nombre}`, descripcion, imagen: d.retrato })
</script>
