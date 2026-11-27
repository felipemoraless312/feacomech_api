<!-- Mosaico con las fotos más recientes del Muro de las Jornadas (sólo publicaciones aprobadas).
     Se usa en el inicio del portal y en el micrositio; se actualiza solo cada minuto.
     Sin fotos todavía, muestra una invitación a participar. -->
<template>
  <section class="relative isolate overflow-hidden bg-marca-950 py-12 text-white sm:py-16">
    <div class="fondo pointer-events-none absolute inset-0 -z-10" />
    <UContainer class="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
      <div class="space-y-4">
        <p class="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-acento-300">
          <span class="relative flex size-2.5"><span class="absolute inline-flex size-full animate-ping rounded-full bg-acento-400 opacity-75" /><span class="relative inline-flex size-2.5 rounded-full bg-acento-400" /></span>
          Muro de las Jornadas
        </p>
        <h2 class="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {{ fotos.length ? 'Así se viven las Jornadas' : 'Comparte cómo vives las Jornadas' }}
        </h2>
        <p class="text-white/75">
          {{ fotos.length
            ? `Fotos compartidas por los asistentes en el ${J.sede.nombre}. Publica las tuyas, comenta y aparece en la pantalla de la sede.`
            : 'Publica tus fotos del evento, comenta las de tus colegas y aparece en la pantalla del Polyforum y en nuestras redes sociales.' }}
        </p>
        <div v-if="totales.fotos" class="flex gap-6 text-sm text-white/70">
          <span><b class="font-display text-2xl text-white">{{ nf(totales.fotos) }}</b> fotos</span>
          <span><b class="font-display text-2xl text-white">{{ nf(totales.publicaciones) }}</b> publicaciones</span>
        </div>
        <div class="flex flex-wrap gap-3 pt-1">
          <UButton to="/jornadas-2026/muro" icon="i-lucide-camera" label="Compartir mis fotos" size="lg" class="bg-acento-500 text-white hover:bg-acento-600" />
          <UButton v-if="fotos.length" to="/jornadas-2026/muro" icon="i-lucide-images" label="Ver todo el muro" size="lg" class="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" />
        </div>
      </div>

      <!-- Mosaico -->
      <div v-if="fotos.length" class="grid auto-rows-[7.5rem] grid-cols-3 gap-2 sm:auto-rows-[9rem] sm:grid-cols-4">
        <NuxtLink
          v-for="(f, i) in fotos"
          :key="f.id"
          to="/jornadas-2026/muro"
          class="pieza group relative overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
          :class="[i === 0 ? 'col-span-2 row-span-2' : '', i > 5 ? 'hidden sm:block' : '']"
          :style="{ '--d': `${i * 70}ms` }"
          :aria-label="f.autor ? `Foto de ${f.autor}` : 'Foto del muro'"
        >
          <img :src="`/api/publico/jornadas/muro/foto/${f.id}/mini`" alt="" loading="lazy" class="size-full object-cover transition duration-700 group-hover:scale-110">
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 text-xs opacity-0 transition group-hover:opacity-100">
            <span v-if="f.autor" class="block truncate font-medium">Foto: {{ f.autor }}</span>
            <span v-if="f.meGusta" class="inline-flex items-center gap-1"><UIcon name="i-lucide-heart" class="size-3 fill-current text-rose-400" /> {{ f.meGusta }}</span>
          </span>
        </NuxtLink>
      </div>

      <!-- Invitación (aún sin fotos aprobadas) -->
      <NuxtLink v-else to="/jornadas-2026/muro" class="group grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Ir al muro de las Jornadas">
        <span
          v-for="(ic, i) in ICONOS"
          :key="ic"
          class="pieza flex aspect-square items-center justify-center rounded-xl ring-1 ring-white/10 transition duration-500 group-hover:-translate-y-1"
          :class="[i % 3 === 0 ? 'bg-acento-500/25' : 'bg-white/[0.07]', i > 5 ? 'hidden sm:flex' : '']"
          :style="{ '--d': `${i * 70}ms`, transitionDelay: `${i * 30}ms` }"
        >
          <UIcon :name="ic" class="size-8 text-white/85" />
        </span>
      </NuxtLink>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import type { PublicacionDto } from '#shared/muro-jornadas'

const MAX_FOTOS = 9
const ICONOS = ['i-lucide-camera', 'i-lucide-heart', 'i-lucide-message-circle', 'i-lucide-images', 'i-lucide-stethoscope', 'i-lucide-sparkles', 'i-lucide-share-2', 'i-lucide-party-popper']
const nf = (n: number) => n.toLocaleString('es-MX')

type Pagina = { publicaciones: PublicacionDto[], total: number, totalFotos: number }
const { data, refresh } = useFetch<Pagina>('/api/publico/jornadas/muro', { key: 'muro-mosaico', lazy: true })

// Primero las destacadas, luego lo más reciente; una foto por publicación para variar el mosaico,
// y si sobran lugares se completan con las demás fotos.
const fotos = computed(() => {
  const pubs = [...(data.value?.publicaciones ?? [])].sort((a, b) => Number(b.destacada) - Number(a.destacada))
  const elegir = (p: PublicacionDto, f: PublicacionDto['fotos'][number]) => ({ id: f.id, autor: p.autor, meGusta: p.meGusta })
  const primeras = pubs.filter(p => p.fotos.length).map(p => elegir(p, p.fotos[0]!))
  const resto = pubs.flatMap(p => p.fotos.slice(1).map(f => elegir(p, f)))
  return [...primeras, ...resto].slice(0, MAX_FOTOS)
})
const totales = computed(() => ({ fotos: data.value?.totalFotos ?? 0, publicaciones: data.value?.total ?? 0 }))

useIntervalFn(() => { if (document.visibilityState === 'visible') refresh() }, 60_000)
</script>

<style scoped>
.fondo {
  background:
    radial-gradient(ellipse 45% 70% at 85% 50%, rgb(217 106 34 / 0.3), transparent 70%),
    radial-gradient(ellipse 60% 80% at 0% 0%, var(--color-marca-800), transparent 70%);
}
.pieza { animation: pieza 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: var(--d); }
@keyframes pieza { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .pieza { animation: none; } }
</style>
