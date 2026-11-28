<!-- Mosaico con las fotografías más recientes del Muro de las Jornadas (sólo publicaciones
     aprobadas). Se usa en el inicio del portal y en el micrositio; se actualiza cada minuto.
     Sin fotografías todavía, muestra una invitación sobria a participar. -->
<template>
  <section class="border-y border-default bg-muted/60 py-12 sm:py-16">
    <UContainer class="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
      <div>
        <p class="rotulo">Muro de las Jornadas</p>
        <h2 class="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-highlighted sm:text-4xl">
          {{ fotos.length ? 'Las Jornadas en imágenes' : 'Comparta sus fotografías de las Jornadas' }}
        </h2>
        <p class="justificado mt-4 leading-relaxed text-muted">
          {{ fotos.length
            ? `Fotografías compartidas por los asistentes en el ${J.sede.nombre}. Cada publicación es revisada por la Federación antes de mostrarse.`
            : 'Los asistentes pueden publicar sus fotografías del evento. Las publicaciones aprobadas se muestran aquí y pueden difundirse en las redes sociales de la Federación.' }}
        </p>
        <dl v-if="totales.fotos" class="mt-6 flex gap-8">
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-[0.16em] text-dimmed">Fotografías</dt>
            <dd class="font-display text-2xl font-bold tabular-nums text-marca-900 dark:text-white">{{ nf(totales.fotos) }}</dd>
          </div>
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-[0.16em] text-dimmed">Publicaciones</dt>
            <dd class="font-display text-2xl font-bold tabular-nums text-marca-900 dark:text-white">{{ nf(totales.publicaciones) }}</dd>
          </div>
        </dl>
        <div class="mt-7 flex flex-wrap gap-3">
          <UButton to="/jornadas-2026/muro" :label="fotos.length ? 'Ver el muro' : 'Ir al muro'" trailing-icon="i-lucide-arrow-right" />
          <UButton to="/jornadas-2026/muro#publicar" icon="i-lucide-image-plus" label="Publicar fotografías" color="neutral" variant="outline" />
        </div>
      </div>

      <!-- Mosaico -->
      <div v-if="fotos.length" class="grid auto-rows-[7.5rem] grid-cols-3 gap-2 sm:auto-rows-[9rem] sm:grid-cols-4">
        <NuxtLink
          v-for="(f, i) in fotos"
          :key="f.id"
          to="/jornadas-2026/muro"
          class="group relative overflow-hidden rounded-md bg-default ring-1 ring-default"
          :class="[i === 0 ? 'col-span-2 row-span-2' : '', i > 5 ? 'hidden sm:block' : '']"
          :aria-label="f.autor ? `Fotografía de ${f.autor}` : 'Fotografía del muro'"
        >
          <img :src="`/api/publico/jornadas/muro/foto/${f.id}/mini`" alt="" loading="lazy" class="size-full object-cover transition-opacity group-hover:opacity-90">
          <span v-if="f.autor" class="absolute inset-x-0 bottom-0 truncate bg-marca-950/70 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">Foto: {{ f.autor }}</span>
        </NuxtLink>
      </div>

      <!-- Sin fotografías aprobadas todavía -->
      <NuxtLink v-else to="/jornadas-2026/muro" class="flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-accented bg-default text-center transition-colors hover:border-marca-400">
        <UIcon name="i-lucide-images" class="size-10 text-marca-400" />
        <span class="font-display text-lg font-semibold text-highlighted">Aún no hay fotografías publicadas</span>
        <span class="text-sm text-muted">Sea de los primeros en compartir un momento del evento</span>
      </NuxtLink>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import type { PublicacionDto } from '#shared/muro-jornadas'

const MAX_FOTOS = 9
const nf = (n: number) => n.toLocaleString('es-MX')

type Pagina = { publicaciones: PublicacionDto[], total: number, totalFotos: number }
const { data, refresh } = useFetch<Pagina>('/api/publico/jornadas/muro', { key: 'muro-mosaico', lazy: true })

// Primero las destacadas, luego lo más reciente; una foto por publicación para variar el mosaico,
// y si sobran lugares se completan con las demás fotos.
const fotos = computed(() => {
  const pubs = [...(data.value?.publicaciones ?? [])].sort((a, b) => Number(b.destacada) - Number(a.destacada))
  const elegir = (p: PublicacionDto, f: PublicacionDto['fotos'][number]) => ({ id: f.id, autor: p.autor })
  const primeras = pubs.filter(p => p.fotos.length).map(p => elegir(p, p.fotos[0]!))
  const resto = pubs.flatMap(p => p.fotos.slice(1).map(f => elegir(p, f)))
  return [...primeras, ...resto].slice(0, MAX_FOTOS)
})
const totales = computed(() => ({ fotos: data.value?.totalFotos ?? 0, publicaciones: data.value?.total ?? 0 }))

useIntervalFn(() => { if (document.visibilityState === 'visible') refresh() }, 60_000)
</script>
