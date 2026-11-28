<!-- Modo pantalla del muro: presentación a pantalla completa para proyectar en la sede.
     Pasa las fotos aprobadas (las más recientes primero) y muestra el QR para publicar. -->
<template>
  <div class="relative h-svh w-screen cursor-none overflow-hidden bg-marca-950 text-white" @click="pantallaCompleta">
    <!-- Foto actual con efecto de acercamiento lento -->
    <TransitionGroup name="fundido">
      <div v-for="d in diapositivaActual" :key="d.clave" class="absolute inset-0">
        <img :src="grande(d.foto.id)" alt="" class="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl">
        <img :src="grande(d.foto.id)" :alt="d.pub.mensaje ?? ''" class="acercar absolute inset-0 m-auto max-h-full max-w-full object-contain">
      </div>
    </TransitionGroup>
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-marca-950/90 via-transparent to-marca-950/50" />

    <!-- Encabezado -->
    <header class="absolute inset-x-0 top-0 flex items-center gap-[1.5vh] p-[3vh]">
      <span class="rounded-[1.2vh] bg-white p-[0.6vh] shadow-lg"><img src="/img/marca/escudo-160.png" alt="" class="h-[7vh] w-auto"></span>
      <div>
        <p class="font-display text-[1.8vh] font-semibold uppercase tracking-[0.25em] text-marca-200">{{ J.edicion }} Jornadas Académicas FEACOMECH</p>
        <p class="font-display text-[4vh] font-bold leading-none">Muro de las Jornadas</p>
        <div class="mt-[1vh] h-[0.35vh] w-[6vh] bg-acento-500" />
      </div>
      <p class="ml-auto text-right text-[1.8vh] leading-snug text-white/75">{{ J.fechas }}<br>{{ J.sede.nombre }}</p>
    </header>

    <!-- Pie: crédito y mensaje -->
    <div v-if="actual" class="absolute bottom-0 left-0 max-w-[calc(100vw-34vh)] p-[3.5vh]">
      <Transition name="sube" mode="out-in">
        <div :key="actual.clave">
          <p v-if="actual.pub.mensaje" class="line-clamp-3 font-display text-[3.6vh] font-semibold leading-tight drop-shadow-lg">“{{ actual.pub.mensaje }}”</p>
          <p class="mt-[1vh] text-[2.2vh] text-white/80">
            {{ actual.pub.autor ? `Foto: ${actual.pub.autor}` : 'Asistente de las Jornadas' }}
            <span v-if="actual.pub.meGusta" class="ml-[1.5vh] inline-flex items-center gap-[0.5vh] text-white/65"><UIcon name="i-lucide-heart" class="size-[2vh]" /> {{ actual.pub.meGusta }}</span>
          </p>
        </div>
      </Transition>
    </div>

    <!-- QR para publicar: columna de ancho fijo, todo centrado -->
    <aside class="absolute bottom-[3.5vh] right-[3.5vh] flex w-[26vh] flex-col items-center rounded-[1vh] bg-white px-[2vh] pb-[2vh] pt-[2.2vh] text-center text-marca-950 shadow-2xl">
      <p class="font-display text-[1.5vh] font-semibold uppercase tracking-[0.2em] text-acento-700">Muro de las Jornadas</p>
      <p class="mt-[0.6vh] font-display text-[2.5vh] font-bold leading-tight text-marca-900">Comparta sus fotografías</p>
      <div class="qr mt-[1.6vh] aspect-square w-full" v-html="qr" />
      <p class="mt-[1.4vh] text-[1.5vh] leading-snug text-marca-900/70">Escanee el código con su teléfono</p>
      <p class="mt-[0.8vh] w-full border-t border-marca-100 pt-[0.8vh] font-display text-[1.7vh] font-semibold text-marca-700">{{ HASHTAG_JORNADAS }}</p>
    </aside>

    <!-- Sin fotos todavía -->
    <div v-if="!diapositivas.length" class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <p class="font-display text-[6vh] font-bold">Muro de las Jornadas</p>
      <p class="mt-[1vh] text-[2.6vh] text-white/75">Escanee el código para compartir sus fotografías del evento</p>
    </div>

    <!-- Barra de avance -->
    <div v-if="diapositivas.length > 1" class="absolute inset-x-0 bottom-0 h-[0.5vh] bg-white/10">
      <div :key="indice" class="avance h-full bg-marca-300" :style="{ animationDuration: `${DURACION_MS}ms` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { HASHTAG_JORNADAS, type FotoMuroDto, type PublicacionDto } from '#shared/muro-jornadas'

definePageMeta({ layout: false })
useSeoMeta({ title: `Muro en pantalla · ${J.edicion} Jornadas FEACOMECH`, robots: 'noindex' })

const DURACION_MS = 8000
const grande = (id: string) => `/api/publico/jornadas/muro/foto/${id}/grande`

type Pagina = { publicaciones: PublicacionDto[] }
interface Diapositiva { clave: string, pub: PublicacionDto, foto: FotoMuroDto }

const publicaciones = ref<PublicacionDto[]>([])
const indice = ref(0)
const qr = ref('')

const diapositivas = computed<Diapositiva[]>(() =>
  publicaciones.value.flatMap(pub => pub.fotos.map(foto => ({ clave: foto.id, pub, foto }))))
const actual = computed(() => diapositivas.value[indice.value % Math.max(diapositivas.value.length, 1)])
const diapositivaActual = computed(() => (actual.value ? [actual.value] : []))

async function cargar() {
  const r = await $fetch<Pagina>('/api/publico/jornadas/muro').catch(() => null)
  if (!r) return
  const antes = new Set(publicaciones.value.map(p => p.id))
  const frescas = r.publicaciones.filter(p => !antes.has(p.id) && p.fotos.length)
  publicaciones.value = r.publicaciones.filter(p => p.fotos.length)
  // Lo recién aprobado se muestra enseguida
  const primera = frescas[0]?.fotos[0]
  if (primera && antes.size) {
    const i = diapositivas.value.findIndex(d => d.foto.id === primera.id)
    if (i >= 0) indice.value = i
  }
}

let giro: ReturnType<typeof setInterval> | undefined
let sondeo: ReturnType<typeof setInterval> | undefined
onMounted(async () => {
  qr.value = await QRCode.toString(`${location.origin}/jornadas-2026/muro`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1e1230', light: '#ffffff' } })
  await cargar()
  giro = setInterval(() => {
    indice.value = (indice.value + 1) % Math.max(diapositivas.value.length, 1)
  }, DURACION_MS)
  sondeo = setInterval(cargar, 30_000)
})
onBeforeUnmount(() => {
  clearInterval(giro)
  clearInterval(sondeo)
})

function pantallaCompleta() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
}
</script>

<style scoped>
.acercar { animation: acercar 9s ease-out both; }
@keyframes acercar { from { transform: scale(1); } to { transform: scale(1.06); } }
.fundido-enter-active, .fundido-leave-active { transition: opacity 1.2s ease; }
.fundido-enter-from, .fundido-leave-to { opacity: 0; }
.sube-enter-active, .sube-leave-active { transition: all 0.6s ease; }
.sube-enter-from { opacity: 0; transform: translateY(8px); }
.sube-leave-to { opacity: 0; transform: translateY(-10px); }
.avance { animation: avance linear both; transform-origin: left; }
@keyframes avance { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.qr :deep(svg) { width: 100%; height: 100%; }
@media (prefers-reduced-motion: reduce) {
  .acercar, .avance { animation: none; }
}
</style>
