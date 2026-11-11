<template>
  <div>
    <SitioEncabezado
      antetitulo="Organización"
      titulo="Expresidentes"
      descripcion="Quienes han presidido la Federación, en orden cronológico, con su reseña profesional y los logros de su gestión."
    />

    <UContainer class="py-16">
      <ol class="relative mx-auto max-w-3xl">
        <span aria-hidden="true" class="absolute bottom-2 left-[1.15rem] top-2 w-px bg-gradient-to-b from-marca-300 via-marca-500 to-marca-800 dark:from-marca-700 dark:to-marca-300" />

        <li v-for="(e, i) in EXPRESIDENTES" :key="e.nombre" v-revelar="(i % 3) * 80" class="relative pb-12 pl-14">
          <span aria-hidden="true" class="absolute left-2 top-2 flex size-[1.15rem] items-center justify-center rounded-full bg-default ring-4 ring-marca-500/25">
            <span class="size-2 rounded-full bg-marca-600 dark:bg-marca-300" />
          </span>
          <article class="rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default sm:p-7">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.14em] text-marca-700 tabular-nums dark:text-marca-300">
              {{ e.periodo }}
            </p>
            <div class="mt-3 flex items-center gap-4">
              <FotoPerfil :nombre="e.nombre.replace(/^Dra?\. /, '')" tamano="3xl" class="size-16 shrink-0 text-xl" />
              <h2 class="font-display text-2xl font-semibold leading-tight text-highlighted">
                {{ e.nombre }}<span v-if="e.finado" class="text-muted" title="Finado"> †</span>
              </h2>
            </div>
            <p v-if="e.resena" class="mt-4 text-[15px] leading-relaxed text-muted">
              {{ e.resena }}
            </p>
            <div v-if="e.logros?.length" class="mt-5">
              <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
                Logros de su gestión
              </p>
              <ul class="mt-2 space-y-1.5">
                <li v-for="l in e.logros" :key="l" class="flex gap-2 text-sm text-muted">
                  <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-marca-600 dark:text-marca-300" />{{ l }}
                </li>
              </ul>
            </div>
          </article>
        </li>

        <!-- Presidencia actual -->
        <li v-revelar class="relative pl-14">
          <span aria-hidden="true" class="absolute left-1 top-2 flex size-6 items-center justify-center rounded-full bg-acento-500 text-white ring-4 ring-acento-500/25">
            <UIcon name="i-lucide-star" class="size-3" />
          </span>
          <div class="rounded-2xl bg-muted p-6">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.14em] text-acento-600">
              {{ PRESIDENCIA_ACTUAL.periodo }} · Presidencia actual
            </p>
            <p class="mt-1 font-display text-2xl font-semibold text-highlighted">
              {{ PRESIDENCIA_ACTUAL.nombre }}
            </p>
            <UButton to="/organizacion#bienvenida" label="Mensaje de bienvenida" trailing-icon="i-lucide-arrow-right" color="neutral" variant="link" class="mt-2 px-0" />
          </div>
        </li>
      </ol>

      <p class="mx-auto mt-14 max-w-3xl rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
        Estamos reconstruyendo la historia completa de la Federación. Si cuenta con datos, fotografías o documentos de presidencias anteriores,
        <NuxtLink to="/contacto" class="text-primary hover:underline">compártalos con nosotros</NuxtLink>.
      </p>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { EXPRESIDENTES, PRESIDENCIA_ACTUAL } from '#shared/organizacion'

useSeoMeta({ title: 'Expresidentes', description: 'Expresidentes de la Federación de Asociaciones y Colegios Médicos del Estado de Chiapas.' })
</script>
