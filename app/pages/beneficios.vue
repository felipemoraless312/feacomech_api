<template>
  <div>
    <SitioEncabezado antetitulo="Beneficios" titulo="Ventajas de pertenecer a la Federación" descripcion="Los colegios agremiados y sus integrantes cuentan con el respaldo de toda la comunidad médica de Chiapas." />

    <UContainer class="space-y-16 py-16">
      <div class="grid gap-5 sm:grid-cols-2">
        <article
          v-for="(b, i) in BENEFICIOS"
          :key="b.titulo"
          v-revelar="(i % 2) * 80"
          class="group relative overflow-hidden rounded-2xl bg-default p-8 shadow-tarjeta ring-1 ring-default transition-[box-shadow] duration-300 hover:shadow-flotante"
        >
          <span class="absolute right-6 top-5 font-display text-5xl font-semibold text-marca-500/10 transition-colors group-hover:text-marca-500/20">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-marca-500 to-marca-800 text-white shadow-tarjeta">
            <UIcon :name="b.icono" class="size-6" />
          </span>
          <h2 class="mt-5 font-display text-xl font-semibold text-highlighted">
            {{ b.titulo }}
          </h2>
          <p class="mt-2 text-[15px] leading-relaxed text-muted">
            {{ b.texto }}
          </p>
        </article>
      </div>

      <section v-revelar class="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-marca-700 to-marca-950 px-8 py-12 text-white sm:px-12">
        <MarcaRed class="pointer-events-none absolute -bottom-32 -right-24 -z-10 size-96 text-white/10" />
        <h2 class="max-w-xl font-display text-3xl font-semibold leading-tight">
          ¿Desea sumarse?
        </h2>
        <p class="mt-3 max-w-xl text-white/80">
          Conozca los requisitos para incorporar su colegio o afiliarse como profesional de la salud.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <UButton to="/admision" label="Proceso de admisión" size="lg" class="bg-white text-marca-900 hover:bg-marca-50" />
          <UButton to="/vinculacion" label="Convenios y colaboradores" size="lg" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { BENEFICIOS } from '#shared/organizacion'

useSeoMeta({ title: 'Beneficios', description: 'Asesoría legal, apoyo en eventos, cursos, certificaciones, promociones y convenios para los agremiados de la FEACOMECH.' })
</script>
