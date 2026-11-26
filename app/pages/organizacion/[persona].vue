<!-- Página de un integrante de la mesa directiva, del consejo consultivo o de una presidencia de colegio: retrato y reseña
     curricular completa. Los datos están en shared/organizacion.ts (PERSONAS). -->
<template>
  <div v-if="p">
    <SitioEncabezado :antetitulo="p.organo" :titulo="p.nombre" :descripcion="`${p.cargo} · ${p.periodo}`" />

    <UContainer class="py-14">
      <!-- La foto flota a la izquierda y la reseña la rodea; en el celular va arriba, centrada. -->
      <article class="flow-root">
        <SitioRetratoInstitucional
          v-revelar.izquierda
          :src="p.retrato"
          :recorte="p.recorte"
          :alt="`Fotografía de ${p.nombre}`"
          class="mb-10 sm:float-left sm:mb-6 sm:mr-12 sm:w-64 lg:w-72"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-marca-700 dark:text-marca-300">
            {{ p.cargo }}
          </p>
          <p class="mt-0.5 text-sm text-muted">
            {{ p.organo }} · {{ p.periodo }}
          </p>
        </SitioRetratoInstitucional>

        <p v-revelar class="rotulo">
          Reseña curricular
        </p>
        <template v-if="parrafos.length">
          <p
            v-for="(parrafo, i) in parrafos"
            :key="i"
            class="justificado mt-5 leading-relaxed"
            :class="i === 0 ? 'font-display text-xl font-medium text-highlighted sm:text-2xl sm:leading-snug' : 'text-[17px] text-toned'"
          >
            {{ parrafo }}
          </p>
        </template>
        <p v-else class="mt-5 text-muted">
          Reseña curricular en preparación.
        </p>
      </article>

      <div class="mt-12 flex flex-wrap gap-3 border-t border-default pt-8">
        <UButton :to="regreso.to" icon="i-lucide-arrow-left" :label="regreso.label" color="neutral" variant="outline" />
        <UButton v-if="p.organo === 'Consejo consultivo'" to="/expresidentes" label="Galería de expresidentes" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
      </div>

      <!-- Otros integrantes del mismo órgano -->
      <section v-if="otros.length && p.organo !== 'Presidentes de colegios'" class="mt-10 space-y-4">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
          Otros integrantes de {{ p.organo.toLowerCase() }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <component
            :is="o.resena ? NuxtLink : 'div'"
            v-for="o in otros"
            :key="o.slug"
            :to="o.resena ? `/organizacion/${o.slug}` : undefined"
            class="group flex items-center gap-3 rounded-xl bg-default p-3 ring-1 ring-default"
            :class="{ 'transition-colors hover:bg-elevated/60 hover:ring-marca-200 dark:hover:ring-marca-800': o.resena }"
          >
            <FotoPerfil :src="o.foto" :nombre="o.nombre.split(' ').filter(x => !x.endsWith('.')).join(' ')" class="size-11 shrink-0" />
            <span class="min-w-0 flex-1">
              <span class="block text-xs text-muted">{{ o.cargo }}</span>
              <span class="block truncate font-medium text-highlighted">{{ o.nombre }}</span>
            </span>
            <UIcon v-if="o.resena" name="i-lucide-chevron-right" class="size-4 shrink-0 text-dimmed transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </component>
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { buscarPersona, PERSONAS, regresoPersona } from '#shared/organizacion'

const route = useRoute()
const p = buscarPersona(String(route.params.persona))
if (!p) throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.fullPath}`, fatal: true })

const parrafos = (p.resena ?? '').split(/\n\s*\n/).filter(Boolean)
const otros = PERSONAS.filter(o => o.organo === p.organo && o.slug !== p.slug)
const regreso = regresoPersona(p)

const cargoCompleto = p.organo === 'Presidentes de colegios' ? `${p.cargo}, colegio afiliado a la FEACOMECH` : `${p.cargo} de la FEACOMECH`
const descripcion = `${cargoCompleto} (${p.periodo}). ${parrafos[0] ?? ''}`.slice(0, 200)
useSeoMeta({ title: p.nombre, description: descripcion })
useCompartir({ titulo: `${p.nombre} · ${p.cargo}`, descripcion, imagen: p.retrato })
</script>
