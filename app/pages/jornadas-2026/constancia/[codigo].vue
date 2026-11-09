<!-- Constancia de participación en las VII Jornadas Académicas FEACOMECH 2026.
     Carta horizontal con la identidad del cartel oficial. Se imprime o guarda como PDF;
     el QR lleva a esta misma página, que confirma su autenticidad. -->
<template>
  <div v-if="c">
    <!-- Sello de verificación (sólo en pantalla) -->
    <div class="mx-auto mb-5 max-w-[11in] px-4 print:hidden">
      <div v-if="c.revocadaEn" class="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-900 ring-1 ring-red-200">
        <UIcon name="i-lucide-shield-x" class="size-5 shrink-0" />
        <p><strong>Constancia revocada.</strong> {{ c.motivoRevocacion ?? 'Este documento ya no es válido.' }}</p>
      </div>
      <div v-else class="flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
        <UIcon name="i-lucide-shield-check" class="size-5 shrink-0 text-emerald-600" />
        <p class="flex-1"><strong>Documento auténtico</strong> emitido por la FEACOMECH · Folio {{ c.folio }}</p>
        <UButton icon="i-lucide-download" label="Descargar PDF" size="sm" @click="descargar" />
      </div>
    </div>

    <!-- Escala para que la hoja quepa en pantallas pequeñas -->
    <div ref="contenedor" class="mx-auto overflow-hidden print:overflow-visible" :style="{ height: `${altoEscalado}px`, maxWidth: '11in' }">
      <article class="hoja relative origin-top-left overflow-hidden bg-white text-[#1d1d2b] shadow-flotante print:shadow-none" :style="{ transform: `scale(${escala})` }">
        <!-- Banda lateral con la identidad del cartel -->
        <aside class="banda absolute inset-y-0 left-0 flex w-[2.9in] flex-col justify-between overflow-hidden px-8 py-10 text-white">
          <svg class="pointer-events-none absolute -bottom-6 left-0 h-56 w-full text-white/25" viewBox="0 0 280 220" fill="none" aria-hidden="true">
            <path v-for="k in 9" :key="k" :d="`M-10 ${60 + k * 16} C 60 ${30 + k * 16}, 130 ${100 + k * 16}, 200 ${55 + k * 16} S 280 ${40 + k * 16}, 300 ${60 + k * 16}`" stroke="currentColor" stroke-width="1.3" />
          </svg>
          <div class="relative">
            <img src="/img/escudo-512.png" alt="" class="h-28 w-auto drop-shadow-lg">
            <p class="mt-5 text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-white/85">
              Federación de Asociaciones y Colegios Médicos de Chiapas
            </p>
          </div>
          <div class="relative">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">{{ J.edicion }} edición</p>
            <p class="mt-2 font-display text-[1.55rem] font-bold uppercase leading-[1.02] tracking-[0.16em]">Jornadas<br>Académicas<br>FEACOMECH</p>
            <p class="mt-1 font-display text-lg font-bold uppercase italic leading-tight tracking-[0.06em] text-[#fcd5b5]">&amp; Simposio de<br>Dermatología</p>
            <p class="mt-3 font-display text-4xl font-black tracking-[0.32em]">2026</p>
            <div class="mt-3 h-[3px] w-24 bg-[#f4c9a5]" />
            <p class="mt-3 text-[11px] leading-snug text-white/85">{{ J.bienio }}</p>
          </div>
        </aside>

        <!-- Cuerpo -->
        <div class="absolute inset-y-0 left-[2.9in] right-0 flex flex-col px-14 pb-9 pt-12">
          <div class="absolute inset-4 left-4 rounded-sm border border-[#1f2a6b]/15" aria-hidden="true" />

          <header class="relative text-center">
            <p class="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#4a4a68]">
              La Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, A.C.
            </p>
            <p class="mt-1 text-xs italic text-[#6e6e80]">Por la dignificación y unión profesional</p>
          </header>

          <main class="relative flex flex-1 flex-col items-center justify-center text-center">
            <p class="text-[13px] font-semibold uppercase tracking-[0.4em] text-[#6e6e80]">Otorga el presente</p>
            <p class="mt-1 font-display text-[3.6rem] font-black uppercase leading-none tracking-[0.12em] text-[#1f2a6b]">{{ texto.documento }}</p>
            <div class="mt-3 flex items-center gap-3" aria-hidden="true">
              <span class="h-px w-16 bg-[#d96a22]" /><span class="size-1.5 rotate-45 bg-[#d96a22]" /><span class="h-px w-16 bg-[#d96a22]" />
            </div>
            <p class="mt-4 text-sm text-[#6e6e80]">a</p>
            <p class="mt-1 max-w-[6.5in] font-display text-[2.35rem] font-bold leading-tight text-[#121530]">{{ c.nombre }}</p>
            <p class="mt-5 max-w-[6.6in] text-[15px] leading-relaxed text-[#2c2c3e]">
              {{ texto.frase(c.detalle) }}
              <strong class="text-[#1f2a6b]">{{ J.edicion }} Jornadas Académicas FEACOMECH y Simposio de Dermatología 2026</strong>,
              celebradas los días {{ J.fechas.replace(' de 2026', '') }} de 2026 en el {{ J.sede.nombre }}, Tuxtla Gutiérrez, Chiapas.
            </p>
            <p class="mt-3 text-sm font-semibold text-[#bd5418]">
              Con valor curricular{{ c.horas ? ` · ${c.horas} horas` : '' }}
            </p>
          </main>

          <footer class="relative grid grid-cols-[1fr_1fr_auto] items-end gap-8">
            <div v-for="f in FIRMAS_JORNADAS" :key="f.nombre" class="text-center">
              <div class="mx-auto mb-2 h-px w-52 bg-[#1d1d2b]/60" />
              <p class="text-[13px] font-semibold">{{ f.nombre }}</p>
              <p class="text-[11px] uppercase tracking-[0.14em] text-[#6e6e80]">{{ f.cargo }}</p>
            </div>
            <div class="flex items-end gap-3">
              <div class="text-right text-[10px] leading-snug text-[#6e6e80]">
                <p>Folio <strong class="text-[#1d1d2b]">{{ c.folio }}</strong></p>
                <p>Verifique en</p>
                <p class="max-w-36 break-all font-medium text-[#1f2a6b]">{{ c.url.replace(/^https?:\/\//, '') }}</p>
              </div>
              <!-- SVG generado en el servidor por la librería qrcode (sólo trazos). -->
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="size-[0.95in] shrink-0" v-html="c.qr" />
            </div>
          </footer>
        </div>

        <div v-if="c.revocadaEn" class="absolute inset-0 flex items-center justify-center">
          <p class="-rotate-12 rounded-lg border-4 border-red-600 bg-white/70 px-8 py-3 text-5xl font-bold uppercase text-red-600">Revocada</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { FIRMAS_JORNADAS, PARTICIPACION, type TipoParticipacion } from '#shared/constancias-jornadas'

definePageMeta({ layout: 'impresion' })

interface Constancia {
  codigo: string, folio: string, tipo: TipoParticipacion, nombre: string, detalle: string | null, horas: number | null
  emitidaEn: string, revocadaEn: string | null, motivoRevocacion: string | null, url: string, qr: string
}
const route = useRoute()
const { data: c, error } = await useFetch<Constancia>(`/api/publico/jornadas/constancia/${route.params.codigo}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Constancia no encontrada', fatal: true })

const texto = computed(() => PARTICIPACION[c.value!.tipo])
useSeoMeta({ title: () => `${texto.value.documento} · ${c.value?.nombre ?? ''}`, robots: 'noindex' })

// La hoja mide 11in (1056 px); en pantallas angostas se reduce para verse completa.
const contenedor = ref<HTMLElement>()
const escala = ref(1)
const altoEscalado = computed(() => 816 * escala.value)
function ajustar() {
  const ancho = contenedor.value?.parentElement?.clientWidth ?? 1056
  escala.value = Math.min(1, (ancho - 16) / 1056)
}
onMounted(() => {
  ajustar()
  window.addEventListener('resize', ajustar)
})
onBeforeUnmount(() => window.removeEventListener('resize', ajustar))

// "Descargar PDF": el diálogo de impresión del navegador con la hoja ya en tamaño carta.
function descargar() {
  window.print()
}
</script>

<style scoped>
.hoja { width: 11in; height: 8.5in; }
.banda {
  background: linear-gradient(170deg, #2b3a8f 0%, #4a4a8c 40%, #8a5a6e 70%, #d96a22 100%);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@media print {
  @page { size: letter landscape; margin: 0; }
  .hoja { transform: none !important; box-shadow: none; }
}
</style>
