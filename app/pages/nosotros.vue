<template>
  <div>
    <SitioEncabezado antetitulo="Nosotros" :titulo="institucion?.nombre ?? 'La Federación'" :descripcion="institucion?.lema || undefined" />

    <UContainer class="grid gap-14 py-16 lg:grid-cols-[14rem_1fr]">
      <!-- Índice -->
      <nav class="hidden lg:block" aria-label="Contenido">
        <ul class="sticky top-24 space-y-2 text-sm">
          <li v-for="s in secciones" :key="s.id">
            <a :href="`#${s.id}`" class="text-muted hover:text-highlighted">{{ s.titulo }}</a>
          </li>
        </ul>
      </nav>

      <div class="min-w-0 space-y-16">
        <figure v-revelar class="space-y-3">
          <img
            src="/img/jornadas-2025-1280.webp"
            srcset="/img/jornadas-2025-768.webp 768w, /img/jornadas-2025-1280.webp 1280w, /img/jornadas-2025-1920.webp 1920w"
            sizes="(min-width: 1024px) 60vw, 100vw"
            alt="Integrantes de la Federación reunidos en las Jornadas Médicas FEACOMECH 2025"
            class="aspect-[16/9] w-full rounded-3xl object-cover shadow-tarjeta"
            loading="lazy"
          >
          <figcaption class="text-sm text-muted">
            Jornadas Médicas FEACOMECH 2025
          </figcaption>
        </figure>

        <EstadoVacio
          v-if="!secciones.length"
          icono="i-lucide-landmark"
          titulo="Contenido en preparación"
          descripcion="La historia, misión, visión y estructura de la Federación se publicarán una vez validadas."
        />

        <section v-for="s in textos" :id="s.id" :key="s.id" v-revelar class="scroll-mt-24 space-y-4">
          <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
            {{ s.titulo }}
          </h2>
          <SitioTexto :texto="s.texto" />
        </section>

        <section v-if="mesa?.organos.length" id="estructura" v-revelar class="scroll-mt-24 space-y-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
              Estructura organizacional
            </h2>
            <span v-if="mesa.periodo" class="text-sm text-muted">Periodo {{ mesa.periodo.nombre }}</span>
          </div>
          <div v-for="o in mesa.organos" :key="o.nombre" class="space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-dimmed">
              {{ o.nombre }}
            </h3>
            <EstructuraOrganigrama :nodos="o.organigrama" />
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton to="/directorio/mesa-directiva" label="Mesa directiva" color="neutral" variant="soft" />
            <UButton to="/directorio/consejo-consultivo" label="Consejo consultivo" color="neutral" variant="soft" />
          </div>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { EstructuraPublicaDto } from '~~/server/services/estructura'

useSeoMeta({ title: 'Nosotros', description: 'Historia, misión, visión, objetivos y estructura de la Federación.' })

const { data: institucion } = await useInstitucion()
// Organigrama completo de órganos activos (sólo nombramientos publicados y vigentes).
const { data: mesa } = await useFetch<EstructuraPublicaDto>('/api/publico/estructura')

const textos = computed(() => [
  { id: 'presentacion', titulo: 'Presentación', texto: institucion.value?.presentacion },
  { id: 'historia', titulo: 'Historia y trayectoria', texto: institucion.value?.historia },
  { id: 'mision', titulo: 'Misión', texto: institucion.value?.mision },
  { id: 'vision', titulo: 'Visión', texto: institucion.value?.vision },
  { id: 'objetivos', titulo: 'Objetivos', texto: institucion.value?.objetivos },
].filter((s): s is { id: string, titulo: string, texto: string } => !!s.texto))

const secciones = computed(() => [
  ...textos.value,
  ...(mesa.value?.organos.length ? [{ id: 'estructura', titulo: 'Estructura organizacional' }] : []),
])
</script>
