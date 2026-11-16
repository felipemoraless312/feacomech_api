<!-- Una cara de la credencial digital (proporción de tarjeta CR80: 85.6 × 54 mm).
     Frente: escudo, foto, nombre, especialidad y colegio. Reverso: QR de verificación y folio. -->
<template>
  <div class="cara relative isolate flex size-full flex-col overflow-hidden rounded-2xl text-marca-950 ring-1 ring-marca-200/70" :class="cara === 'frente' ? 'cara-frente' : 'cara-reverso'">
    <MarcaRed class="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 text-marca-300/35" />
    <img src="/img/escudo-512.png" alt="" aria-hidden="true" class="pointer-events-none absolute -bottom-10 -left-8 -z-10 w-40 rotate-[-10deg] opacity-[0.06]">

    <!-- Encabezado común -->
    <div class="flex items-center gap-2.5 px-[5.5%] pt-[4.5%]">
      <img src="/img/escudo-160.png" alt="" class="h-[2.4em] w-auto" width="138" height="160">
      <div class="min-w-0 leading-none">
        <p class="font-display text-[1.05em] font-bold tracking-[0.08em] text-marca-800">FEACOMECH</p>
        <p class="mt-[0.3em] truncate text-[0.52em] font-semibold uppercase tracking-[0.12em] text-gris-600">Federación de Colegios Médicos de Chiapas</p>
      </div>
      <span
        class="ms-auto shrink-0 rounded-full px-[0.7em] py-[0.25em] text-[0.55em] font-bold uppercase tracking-[0.12em]"
        :class="c.vigente ? 'bg-success/12 text-success ring-1 ring-success/30' : 'bg-warning/12 text-warning ring-1 ring-warning/30'"
      >{{ c.vigente ? 'Vigente' : 'No vigente' }}</span>
    </div>

    <!-- Frente -->
    <div v-if="cara === 'frente'" class="flex flex-1 items-center gap-[5%] px-[5.5%] pb-[4%] pt-[3%]">
      <div class="relative shrink-0">
        <div class="absolute -inset-[0.2em] rounded-[0.9em] bg-gradient-to-br from-marca-400 to-acento-400" aria-hidden="true" />
        <img v-if="c.fotoId" :src="`/api/archivos/${c.fotoId}`" :alt="c.nombre" class="relative aspect-[4/5] w-[5.6em] rounded-[0.75em] bg-marca-100 object-cover">
        <span v-else class="relative flex aspect-[4/5] w-[5.6em] items-center justify-center rounded-[0.75em] bg-marca-100 font-display text-[1.6em] font-bold text-marca-600">{{ iniciales }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[0.55em] font-semibold uppercase tracking-[0.16em] text-acento-600">Médico afiliado</p>
        <p class="mt-[0.15em] font-display text-[1.25em] font-bold leading-[1.1] text-marca-900">{{ c.nombre }}</p>
        <p v-if="c.especialidad" class="mt-[0.3em] text-[0.72em] font-medium leading-snug text-gris-700">
          {{ c.especialidad }}<template v-if="c.subespecialidad"> · {{ c.subespecialidad }}</template>
        </p>
        <p v-if="c.membresias[0]" class="mt-[0.45em] line-clamp-2 text-[0.62em] leading-snug text-gris-600">
          {{ c.membresias[0].organizacion }}
        </p>
        <dl class="mt-[0.6em] flex gap-[1.2em] text-[0.55em]">
          <div v-if="c.cedulaProfesional">
            <dt class="font-semibold uppercase tracking-[0.12em] text-gris-500">Cédula</dt>
            <dd class="font-mono text-[1.15em] font-semibold text-marca-900">{{ c.cedulaProfesional }}</dd>
          </div>
          <div v-if="c.membresias[0]?.numeroSocio">
            <dt class="font-semibold uppercase tracking-[0.12em] text-gris-500">Socio</dt>
            <dd class="font-mono text-[1.15em] font-semibold text-marca-900">{{ c.membresias[0].numeroSocio }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Reverso -->
    <div v-else class="flex flex-1 items-center gap-[5%] px-[5.5%] pb-[4%] pt-[3%]">
      <div class="shrink-0 rounded-[0.8em] bg-white p-[0.55em] shadow-[0_6px_18px_-8px_rgb(64_40_88/0.35)] ring-1 ring-marca-100">
        <!-- SVG generado en el servidor a partir del código de verificación -->
        <div class="qr size-[6.4em]" v-html="c.qr" />
      </div>
      <div class="min-w-0 flex-1 space-y-[0.55em]">
        <p class="text-[0.62em] leading-snug text-gris-700">
          Escanee el código para comprobar en línea la vigencia de esta credencial.
        </p>
        <div class="text-[0.55em]">
          <p class="font-semibold uppercase tracking-[0.12em] text-gris-500">Folio</p>
          <p class="font-mono text-[1.25em] font-bold text-marca-900">{{ c.folio }}</p>
        </div>
        <div v-if="c.membresias.length > 1" class="text-[0.55em]">
          <p class="font-semibold uppercase tracking-[0.12em] text-gris-500">También afiliado a</p>
          <p class="line-clamp-2 text-[1.05em] text-gris-700">{{ c.membresias.slice(1).map(m => m.siglas || m.organizacion).join(' · ') }}</p>
        </div>
      </div>
    </div>

    <!-- Filete inferior -->
    <div class="h-[0.3em] bg-gradient-to-r from-marca-600 via-marca-400 to-acento-400" />
  </div>
</template>

<script setup lang="ts">
import type { MiCredencialDto } from '~~/server/services/credencial'

const props = defineProps<{ c: MiCredencialDto & { qr: string }, cara: 'frente' | 'reverso' }>()
const iniciales = computed(() => props.c.nombre.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase())
</script>

<style scoped>
.cara-frente {
  background: linear-gradient(135deg, #ffffff 0%, var(--color-marca-50) 55%, var(--color-acento-50) 100%);
}
.cara-reverso {
  background: linear-gradient(225deg, #ffffff 0%, var(--color-marca-50) 60%, var(--color-marca-100) 100%);
}
.qr :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
