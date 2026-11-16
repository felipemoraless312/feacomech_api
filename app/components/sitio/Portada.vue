<!-- Portada del inicio (paleta clara: lavanda con aurora y acentos cobre): título con entrada palabra por palabra, halo que sigue al cursor,
     fotografía completa (4:3, sin recortes) con inclinación 3D y cuenta regresiva flotante.
     Todos los efectos se apagan con "reducir movimiento" y en pantallas táctiles. -->
<template>
  <section
    ref="seccion"
    class="portada relative isolate overflow-hidden bg-gradient-to-b from-marca-50 via-[#fcfbfe] to-white text-marca-950 dark:from-marca-950 dark:via-marca-950 dark:to-gris-950 dark:text-white"
    @pointermove="mover"
    @pointerleave="soltar"
  >
    <!-- Fondo: red girando, halo que sigue al cursor y retícula fina -->
    <div class="aurora [--aurora-1:var(--color-marca-200)] [--aurora-2:var(--color-acento-200)] [--aurora-opacidad:0.6]" />
    <MarcaRed class="girar-lento pointer-events-none absolute -left-56 -top-56 -z-10 size-[46rem] text-marca-300/30 dark:text-white/[0.07]" />
    <MarcaRed class="girar-lento pointer-events-none absolute -bottom-72 right-[-14rem] -z-10 size-[40rem] text-acento-300/25 [animation-direction:reverse]" />
    <div class="halo pointer-events-none absolute inset-0 -z-10" />
    <div class="reticula pointer-events-none absolute inset-0 -z-10 opacity-[0.09]" />

    <UContainer class="grid items-center gap-6 pb-10 pt-5 sm:gap-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
      <!-- Texto -->
      <div>
        <div class="entrada hidden items-center gap-4 sm:flex">
          <img src="/img/marca/escudo-160.png" alt="Escudo de la Federación" class="flotar h-12 w-auto drop-shadow-[0_12px_20px_rgb(64_40_88/0.25)] sm:h-20" width="138" height="160">
          <div class="border-l border-marca-200 pl-4 dark:border-white/25">
            <p class="font-display text-sm font-bold uppercase tracking-[0.24em] text-acento-600 dark:text-acento-300">{{ siglas }}</p>
            <p class="text-sm text-muted">{{ ciudad }}</p>
          </div>
        </div>

        <h1 class="font-display text-marca-900 dark:text-white sm:mt-8 text-[1.65rem] font-bold uppercase leading-[1.08] tracking-[0.02em] sm:text-5xl sm:leading-[1.04] sm:tracking-[0.03em] xl:text-[3.4rem]" :aria-label="nombre">
          <span
            v-for="(p, i) in palabras"
            :key="i"
            class="palabra mr-[0.28em] inline-block"
            :style="{ '--retraso': `${80 + i * 45}ms` }"
            aria-hidden="true"
          ><span :class="{ 'texto-degradado': destacada(p) }">{{ p }}</span></span>
        </h1>

        <p v-if="lema" class="entrada mt-4 max-w-xl border-l-2 border-acento-500 pl-3 text-[15px] text-gris-700 dark:text-white/85 sm:mt-6 sm:pl-4 sm:text-lg" :style="{ '--retraso': `${150 + palabras.length * 45}ms` }">
          {{ lema }}
        </p>

        <div class="entrada mt-6 grid gap-2.5 sm:mt-9 sm:flex sm:flex-wrap sm:gap-3" :style="{ '--retraso': `${220 + palabras.length * 45}ms` }">
          <UButton to="/admision" label="Afíliese a la Federación" icon="i-lucide-user-plus" size="xl" class="boton-brillo justify-center rounded-full bg-gradient-to-r from-acento-500 to-acento-400 px-6 text-white shadow-[0_10px_28px_-10px_rgb(217_106_34/0.75)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:from-acento-600 hover:to-acento-500 hover:shadow-[0_14px_32px_-10px_rgb(217_106_34/0.8)]" />
          <UButton to="/organizacion" label="Conózcanos" icon="i-lucide-landmark" size="xl" class="justify-center rounded-full bg-white px-6 text-marca-700 shadow-tarjeta ring-1 ring-marca-200 transition-transform hover:-translate-y-0.5 hover:bg-marca-50 dark:bg-white/10 dark:text-white dark:ring-white/30" />
        </div>

        <dl v-if="cifras.length" class="entrada mt-12 hidden max-w-lg grid-cols-3 gap-6 border-t sm:grid border-marca-200/70 pt-6 dark:border-white/15" :style="{ '--retraso': `${290 + palabras.length * 45}ms` }">
          <div v-for="c in cifras" :key="c.etiqueta">
            <dt class="sr-only">{{ c.etiqueta }}</dt>
            <dd class="font-display text-3xl font-bold text-marca-700 dark:text-white"><SitioContador :valor="c.valor" /></dd>
            <p class="mt-1 text-xs leading-snug text-muted">{{ c.etiqueta }}</p>
          </div>
        </dl>
      </div>

      <!-- Fotografía con inclinación 3D -->
      <div class="entrada relative mt-2 [perspective:1400px] sm:mt-0" style="--retraso: 260ms">
        <div class="inclinacion relative">
          <!-- Marco cobre desplazado: se mueve en sentido contrario a la foto -->
          <div class="marco absolute inset-0 hidden translate-x-4 translate-y-4 rounded-lg sm:block border-2 border-acento-500 sm:translate-x-6 sm:translate-y-6" aria-hidden="true" />
          <figure class="relative overflow-hidden rounded-lg shadow-[0_30px_70px_-24px_rgb(64_40_88/0.5)] ring-4 ring-white dark:ring-white/15">
            <img
              src="/img/portada/general.jpg"
              alt="Integrantes de la Federación reunidos en las Jornadas Médicas FEACOMECH 2025"
              class="respirar aspect-[1955/1066] w-full object-cover"
              width="1955"
              height="1066"
              fetchpriority="high"
            >
            <!-- Reflejo que recorre la foto al inclinarla -->
            <div class="reflejo pointer-events-none absolute inset-0" aria-hidden="true" />
            <figcaption class="sr-only">
              Jornadas Médicas FEACOMECH 2025
            </figcaption>
          </figure>
        </div>

        <!-- Cuenta regresiva flotante -->
        <!-- Tarjeta con la identidad del cartel oficial: degradado azul → cobre y ondas blancas -->
        <NuxtLink
          v-if="jornadasVigentes"
          to="/jornadas-2026"
          class="cartel group relative z-10 mx-auto -mt-3 block w-[94%] max-w-sm overflow-hidden rounded-lg text-white shadow-[0_24px_60px_-16px_rgb(43_58_143/0.55)] ring-1 ring-white/40 transition-transform duration-500 hover:-translate-y-1 sm:-mt-5 sm:ml-[-1.5rem] sm:mr-0 sm:w-[22rem] lg:ml-[-2.5rem]"
        >
          <!-- Ondas del cartel -->
          <svg class="ondas pointer-events-none absolute -right-6 -top-4 h-24 w-64 text-white/25" viewBox="0 0 260 90" fill="none" aria-hidden="true">
            <path v-for="k in 6" :key="k" :d="`M0 ${10 + k * 11} C 60 ${-6 + k * 11}, 110 ${26 + k * 11}, 170 ${8 + k * 11} S 240 ${k * 11}, 260 ${6 + k * 11}`" stroke="currentColor" stroke-width="1.2" />
          </svg>

          <div class="relative px-5 pb-4 pt-5">
            <p class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
              <span class="relative flex size-2"><span class="absolute inline-flex size-full animate-ping rounded-full bg-acento-300 opacity-75 motion-reduce:hidden" /><span class="relative inline-flex size-2 rounded-full bg-acento-300" /></span>
              {{ JORNADAS_2026.edicion }} edición · Polyforum Chiapas
            </p>
            <p class="mt-3 font-display text-[1.35rem] font-bold uppercase leading-[1.02] tracking-[0.14em]">
              Jornadas<br>Académicas<br>FEACOMECH
            </p>
            <p class="font-display text-lg font-bold uppercase italic leading-tight tracking-[0.06em] text-acento-200">
              &amp; Simposio de Dermatología
            </p>
            <div class="mt-2 flex items-baseline gap-3">
              <span class="font-display text-3xl font-black tracking-[0.35em]">2026</span>
              <span class="text-xs font-semibold text-white/80">26, 27 y 28 de noviembre</span>
            </div>
            <div class="my-3 h-[3px] w-full bg-gradient-to-r from-acento-400 via-acento-300/60 to-marca-400" />

            <!-- Cuenta regresiva -->
            <div class="grid grid-cols-4 divide-x divide-white/20 text-center" aria-label="Tiempo para el inicio de las Jornadas">
              <div v-for="u in cuenta" :key="u.t" class="px-1">
                <p :key="u.v" class="digito font-display text-[1.7rem] font-bold leading-none tabular-nums">{{ u.v }}</p>
                <p class="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">{{ u.t }}</p>
              </div>
            </div>
          </div>

          <span class="relative flex items-center justify-between bg-white/95 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-marca-900">
            Programa e inscripción
            <UIcon name="i-lucide-arrow-right" class="size-5 text-acento-600 transition-transform group-hover:translate-x-1" />
          </span>
        </NuxtLink>
      </div>
    </UContainer>

    <div class="h-14 sm:h-24" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { JORNADAS_2026 } from '#shared/jornadas2026'

const props = defineProps<{
  nombre: string
  siglas: string
  ciudad: string
  lema?: string | null
  cifras: { valor: string, etiqueta: string }[]
}>()

const palabras = computed(() => props.nombre.split(/\s+/))
// "Colegios Médicos" en cobre: el corazón del nombre.
const destacada = (p: string) => /^(colegios|médicos)$/i.test(p)

const jornadasVigentes = new Date() < new Date(JORNADAS_2026.fin)

// Cuenta regresiva (mismo valor al hidratar; corre en el navegador).
const ahora = useState('inicio-ahora', () => Date.now())
let reloj: ReturnType<typeof setInterval> | undefined
onMounted(() => { reloj = setInterval(() => (ahora.value = Date.now()), 1000) })
onBeforeUnmount(() => clearInterval(reloj))
const dos = (n: number) => String(n).padStart(2, '0')
const cuenta = computed(() => {
  const s = Math.max(0, Math.floor((new Date(JORNADAS_2026.inicio).getTime() - ahora.value) / 1000))
  return [
    { v: String(Math.floor(s / 86400)), t: 'días' },
    { v: dos(Math.floor((s % 86400) / 3600)), t: 'horas' },
    { v: dos(Math.floor((s % 3600) / 60)), t: 'min' },
    { v: dos(s % 60), t: 'seg' },
  ]
})

// Halo e inclinación: variables CSS actualizadas una vez por cuadro.
const seccion = ref<HTMLElement>()
let cuadro = 0
function mover(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !seccion.value) return
  const el = seccion.value
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  cancelAnimationFrame(cuadro)
  cuadro = requestAnimationFrame(() => {
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    el.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`)
  })
}
function soltar() {
  const el = seccion.value
  if (!el) return
  cancelAnimationFrame(cuadro)
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}
onBeforeUnmount(() => cancelAnimationFrame(cuadro))
</script>

<style scoped>
.portada {
  --mx: 70%;
  --my: 40%;
  --rx: 0deg;
  --ry: 0deg;
}

/* Halo de luz que acompaña al cursor */
.halo {
  background:
    radial-gradient(600px circle at var(--mx) var(--my), rgb(236 164 109 / 0.18), transparent 60%),
    radial-gradient(900px circle at 85% 20%, rgb(192 169 218 / 0.35), transparent 65%);
  transition: background 0.2s;
}

/* Retícula técnica muy tenue */
.reticula {
  background-image:
    linear-gradient(to right, rgb(102 71 139) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(102 71 139) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%);
}

/* Título palabra por palabra */
/* Sólo opacidad y transform: sin filter: blur, que en teléfonos es costoso sobre texto grande */
.palabra {
  animation: palabra 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: var(--retraso, 0ms);
}
@keyframes palabra {
  from { opacity: 0; transform: translateY(0.5em) rotate(2deg); }
  to { opacity: 1; transform: none; }
}

/* Inclinación 3D de la foto */
.inclinacion {
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.marco {
  transform: translate3d(calc(var(--ry) * -1.2), calc(var(--rx) * 1.2), -40px);
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.reflejo {
  background: linear-gradient(115deg, transparent 30%, rgb(255 255 255 / 0.18) 45%, transparent 60%);
  background-size: 250% 100%;
  background-position: calc(50% + var(--ry) * 12) 0;
  transition: background-position 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  mix-blend-mode: soft-light;
}

/* Tarjeta del evento: el degradado azul → cobre del cartel oficial, con un leve movimiento */
.cartel {
  background: linear-gradient(135deg, #2b3a8f 0%, #4a4a8c 38%, #8a5a6e 68%, #d96a22 100%);
  background-size: 160% 160%;
  animation: cartel 12s ease-in-out infinite alternate;
}
@keyframes cartel {
  from { background-position: 0% 0%; }
  to { background-position: 100% 100%; }
}
.ondas {
  animation: ondas 9s ease-in-out infinite alternate;
}
@keyframes ondas {
  from { transform: translateX(0); }
  to { transform: translateX(-18px); }
}

/* Respiración muy leve: nadie sale del cuadro */
.respirar {
  animation: respirar 18s ease-in-out infinite alternate;
}
@keyframes respirar {
  from { transform: scale(1); }
  to { transform: scale(1.035); }
}

/* Cambio de dígito de la cuenta regresiva */
/* Cada dígito nuevo entra deslizándose (se monta de nuevo al cambiar su clave). */
.digito { animation: digito 0.35s cubic-bezier(0.2, 0.7, 0.2, 1); }
@keyframes digito {
  from { transform: translateY(-35%); opacity: 0.2; }
  to { transform: none; opacity: 1; }
}

/* En pantallas táctiles, fuera lo decorativo continuo (el degradado animado del cartel repinta
   cada cuadro). La cuenta regresiva y la entrada del título se conservan. */
@media (hover: none) {
  .respirar, .cartel, .ondas { animation: none; }
}

@media (prefers-reduced-motion: reduce) {
  .palabra, .respirar, .digito, .cartel, .ondas { animation: none; }
  .inclinacion, .marco { transform: none; }
}
</style>
