<!-- Página de un integrante de la mesa directiva o del consejo consultivo: retrato y reseña
     curricular completa. Los datos están en shared/organizacion.ts (PERSONAS). -->
<template>
  <div v-if="p">
    <SitioEncabezado :antetitulo="p.organo" :titulo="p.nombre" :descripcion="`${p.cargo} · ${p.periodo}`" />

    <UContainer class="grid gap-10 py-14 lg:grid-cols-[20rem_1fr] lg:gap-16">
      <!-- Retrato -->
      <aside class="lg:sticky lg:top-24 lg:self-start">
        <div v-revelar.izquierda class="mx-auto max-w-80 overflow-hidden rounded-2xl bg-marca-50 shadow-flotante ring-1 ring-default dark:bg-marca-950">
          <img
            v-if="p.retrato"
            :src="p.retrato"
            :alt="`Fotografía de ${p.nombre}`"
            class="aspect-[4/5] w-full object-cover"
            width="560"
            height="700"
          >
          <div v-else class="flex aspect-[4/5] items-center justify-center font-display text-6xl font-bold text-marca-300">
            {{ iniciales }}
          </div>
          <div class="space-y-1 bg-default px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-marca-700 dark:text-marca-300">
              {{ p.cargo }}
            </p>
            <p class="text-sm text-muted">
              {{ p.organo }} · {{ p.periodo }}
            </p>
          </div>
        </div>
      </aside>

      <!-- Reseña -->
      <article class="min-w-0 space-y-10">
        <div class="space-y-5">
          <p v-revelar class="rotulo">
            Reseña curricular
          </p>
          <template v-if="parrafos.length">
            <p
              v-for="(parrafo, i) in parrafos"
              :key="i"
              v-revelar="Math.min(i, 3) * 60"
              class="max-w-prose leading-relaxed text-pretty"
              :class="i === 0 ? 'font-display text-xl font-medium text-highlighted sm:text-2xl sm:leading-snug' : 'text-[17px] text-toned'"
            >
              {{ parrafo }}
            </p>
          </template>
          <p v-else class="text-muted">
            Reseña curricular en preparación.
          </p>
        </div>

        <div class="flex flex-wrap gap-3 border-t border-default pt-8">
          <UButton :to="`/organizacion#${ancla}`" icon="i-lucide-arrow-left" :label="`Volver a ${p.organo.toLowerCase()}`" color="neutral" variant="outline" />
          <UButton v-if="p.organo === 'Consejo consultivo'" to="/expresidentes" label="Galería de expresidentes" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
        </div>

        <!-- Otros integrantes del mismo órgano -->
        <section v-if="otros.length" class="space-y-4">
          <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
            Otros integrantes de {{ p.organo.toLowerCase() }}
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
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
      </article>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { buscarPersona, PERSONAS } from '#shared/organizacion'

const route = useRoute()
const p = buscarPersona(String(route.params.persona))
if (!p) throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.fullPath}`, fatal: true })

const parrafos = (p.resena ?? '').split(/\n\s*\n/).filter(Boolean)
const otros = PERSONAS.filter(o => o.organo === p.organo && o.slug !== p.slug)
const ancla = p.organo === 'Mesa directiva' ? 'mesa-directiva' : 'consejo-consultivo'
const iniciales = p.nombre.split(' ').filter(x => !x.endsWith('.')).slice(0, 2).map(x => x[0]).join('')

const descripcion = `${p.cargo} de la FEACOMECH (${p.periodo}). ${parrafos[0] ?? ''}`.slice(0, 200)
useSeoMeta({ title: p.nombre, description: descripcion })
useCompartir({ titulo: `${p.nombre} · ${p.cargo}`, descripcion, imagen: p.retrato })
</script>
