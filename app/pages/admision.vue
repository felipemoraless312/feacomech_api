<template>
  <div>
    <SitioEncabezado antetitulo="Admisión" titulo="Únase a la FEACOMECH" descripcion="La Federación recibe a colegios y asociaciones de la salud, y a profesionales a través de ellos.">
      <div class="flex flex-wrap gap-2">
        <UButton to="#colegio" label="Soy un colegio" icon="i-lucide-landmark" size="lg" class="bg-white text-marca-900 hover:bg-marca-50" />
        <UButton to="#individual" label="Soy profesional de la salud" icon="i-lucide-stethoscope" size="lg" class="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" />
      </div>
    </SitioEncabezado>

    <UContainer class="space-y-20 py-16">
      <section v-for="(s, k) in bloques" :id="k" :key="k" class="scroll-mt-24 space-y-8">
        <div v-revelar class="max-w-3xl space-y-3">
          <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted text-balance">
            {{ s.titulo }}
          </h2>
          <p class="text-lg text-muted">
            {{ s.intro }}
          </p>
        </div>
        <ol class="grid gap-4 sm:grid-cols-2" :class="s.pasos.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
          <li v-for="(p, i) in s.pasos" :key="p.titulo" v-revelar="i * 80" class="rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
            <span class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-marca-500 to-marca-800 font-display text-lg font-semibold text-white">
              {{ i + 1 }}
            </span>
            <p class="mt-4 font-display text-lg font-semibold text-highlighted">
              {{ p.titulo }}
            </p>
            <p class="mt-1.5 text-[15px] leading-relaxed text-muted">
              {{ p.texto }}
            </p>
          </li>
        </ol>
        <p v-if="'nota' in s" class="text-sm text-muted">
          {{ s.nota }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton v-if="k === 'colegio'" to="/contacto" label="Solicitar información de afiliación" icon="i-lucide-mail" />
          <template v-else>
            <UButton to="/directorio" label="Ver colegios agremiados" icon="i-lucide-landmark" />
            <UButton to="/contacto" label="Contáctenos" color="neutral" variant="soft" />
          </template>
        </div>
      </section>

      <section v-revelar class="relative isolate overflow-hidden rounded-2xl bg-muted p-8 sm:p-10">
        <h2 class="font-display text-2xl font-semibold text-highlighted">
          ¿Qué obtiene al formar parte?
        </h2>
        <p class="mt-2 max-w-2xl text-muted">
          Asesoría legal, apoyo para sus eventos, cursos y certificaciones, y acceso a todas las promociones y convenios de la Federación.
        </p>
        <UButton to="/beneficios" label="Conozca los beneficios" trailing-icon="i-lucide-arrow-right" class="mt-5" />
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ADMISION } from '#shared/organizacion'

useSeoMeta({ title: 'Admisión', description: 'Cómo incorporar un colegio a la FEACOMECH o afiliarse de manera individual como profesional de la salud.' })

const bloques = ADMISION
</script>
