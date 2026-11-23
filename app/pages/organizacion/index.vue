<!-- Organización: dedicada a la mesa directiva vigente. La presidencia aparece destacada con su
     retrato y un fragmento de su mensaje; el resto de la mesa, con retratos enmarcados que llevan
     a la página de cada integrante. La bienvenida, misión, historia y trayectoria están en
     /federacion; el consejo consultivo, en /expresidentes; las presidencias de colegio, en la
     ficha de cada colegio del directorio. -->
<template>
  <div>
    <SitioEncabezado antetitulo="Organización" titulo="Mesa directiva" :descripcion="bienio" />

    <!-- Presidencia -->
    <section class="relative isolate overflow-hidden py-16 sm:py-24">
      <MarcaRed class="girar-lento pointer-events-none absolute -left-40 top-1/2 -z-10 size-[34rem] -translate-y-1/2 text-marca-200/40 dark:text-white/5" />
      <UContainer class="grid items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
        <NuxtLink v-if="presidenta" :to="`/organizacion/${presidenta.slug}`" class="mx-auto block w-full max-w-72 sm:max-w-80 lg:w-96 lg:max-w-none" :aria-label="`Página de ${presidenta.nombre}`">
          <SitioRetratoInstitucional v-revelar.izquierda :src="presidenta.retrato" :recorte="presidenta.recorte" :alt="`Fotografía de ${presidenta.nombre}`" grande />
        </NuxtLink>

        <div v-if="presidenta" v-revelar="100" class="text-center lg:text-left">
          <p class="rotulo">
            Presidencia
          </p>
          <h2 class="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-marca-900 text-balance sm:text-5xl lg:text-6xl dark:text-white">
            {{ presidenta.nombre }}
          </h2>
          <p class="mt-4 text-lg font-medium text-acento-600 dark:text-acento-400">
            {{ presidenta.cargo }} de la FEACOMECH · {{ MESA_DIRECTIVA.periodo }}
          </p>

          <figure class="relative mx-auto mt-14 max-w-2xl lg:mx-0">
            <UIcon name="i-lucide-quote" class="absolute -top-9 left-4 size-9 text-marca-200 dark:text-marca-800" aria-hidden="true" />
            <blockquote class="relative border-l-4 border-acento-400 pl-6 text-left font-display text-xl font-medium leading-snug text-marca-900 text-pretty sm:text-2xl dark:text-white/90">
              {{ BIENVENIDA.parrafos[1] }}
            </blockquote>
          </figure>

          <div class="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <UButton to="/federacion#bienvenida" label="Leer su mensaje de bienvenida" trailing-icon="i-lucide-arrow-right" size="lg" class="rounded-full" />
            <UButton :to="`/organizacion/${presidenta.slug}`" label="Ver su perfil" color="neutral" variant="outline" size="lg" class="rounded-full" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Integrantes -->
    <section class="relative isolate overflow-hidden bg-gradient-to-b from-marca-50 to-default py-16 sm:py-24 dark:from-marca-950/60">
      <div class="puntos pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <p v-revelar class="rotulo justify-center">
            {{ MESA_DIRECTIVA.periodo }}
          </p>
          <h2 v-revelar="60" class="mt-3 font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Integrantes de la mesa directiva
          </h2>
          <p v-revelar="120" class="mt-4 text-[17px] leading-relaxed text-muted">
            Profesionales de la salud que, junto con la presidencia, conducen los trabajos de la Federación
            en representación de los colegios y asociaciones de Chiapas.
          </p>
        </div>

        <ul class="mt-14 flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14">
          <li
            v-for="(p, i) in integrantes"
            :key="p.slug"
            v-revelar="(i % 5) * 80"
            class="w-[calc(50%-0.5rem)] max-w-72 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.375rem)] xl:w-[calc(20%-1.6rem)]"
          >
            <NuxtLink :to="`/organizacion/${p.slug}`" class="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary">
              <SitioRetratoInstitucional :src="p.retrato" :recorte="p.recorte" :alt="`Fotografía de ${p.nombre}`">
                <div class="text-center">
                  <p class="flex min-h-[2.6em] items-end justify-center text-[10px] font-semibold sm:text-xs uppercase leading-tight tracking-[0.14em] text-acento-600 text-balance dark:text-acento-400">
                    {{ p.cargo }}
                  </p>
                  <p class="mt-1.5 font-display text-[15px] font-semibold sm:text-lg leading-snug text-highlighted text-balance transition-colors group-hover:text-marca-700 dark:group-hover:text-marca-200">
                    {{ p.nombre }}
                  </p>
                  <p class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
                    {{ p.resena ? 'Reseña curricular' : 'Ver perfil' }}
                    <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </SitioRetratoInstitucional>
            </NuxtLink>
          </li>
        </ul>
      </UContainer>
    </section>

    <!-- Para seguir conociendo a la Federación -->
    <section class="py-16 sm:py-20">
      <UContainer>
        <div class="grid gap-4 md:grid-cols-3">
          <NuxtLink
            v-for="(e, i) in enlaces"
            :key="e.to"
            v-revelar="i * 80"
            :to="e.to"
            class="elevar group flex items-start gap-4 rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default hover:ring-marca-200 dark:hover:ring-marca-800"
          >
            <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-700 dark:bg-marca-900 dark:text-marca-200">
              <UIcon :name="e.icono" class="size-5" />
            </span>
            <span class="min-w-0">
              <span class="flex items-center gap-1 font-display text-lg font-semibold text-highlighted">
                {{ e.titulo }}
                <UIcon name="i-lucide-arrow-right" class="size-4 text-dimmed transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </span>
              <span class="mt-1 block text-sm leading-relaxed text-muted">{{ e.texto }}</span>
            </span>
          </NuxtLink>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 } from '#shared/jornadas2026'
import { BIENVENIDA, MESA_DIRECTIVA, PERSONAS } from '#shared/organizacion'

useSeoMeta({ title: 'Mesa directiva', description: `Mesa directiva de la FEACOMECH, ${MESA_DIRECTIVA.periodo}: presidencia, vicepresidencia, secretarías y tesorería, con la reseña curricular de cada integrante.` })

const bienio = JORNADAS_2026.bienio.replace(/\s–\s/, '–')
const mesa = PERSONAS.filter(p => p.organo === 'Mesa directiva')
const presidenta = mesa[0]
const integrantes = mesa.slice(1)

const enlaces = [
  { to: '/federacion', icono: 'i-lucide-landmark', titulo: 'La Federación', texto: 'Mensaje de bienvenida, objetivo, misión, visión e historia.' },
  { to: '/expresidentes#consejo-consultivo', icono: 'i-lucide-scale', titulo: 'Consejo consultivo', texto: 'Expresidentes que acompañan a la mesa directiva.' },
  { to: '/directorio', icono: 'i-lucide-building-2', titulo: 'Colegios agremiados', texto: 'Cada colegio con su presidencia y su mesa directiva.' },
]
</script>
