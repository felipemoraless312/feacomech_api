<!-- Portada del inicio: título con entrada palabra por palabra, halo que sigue al cursor,
     fotografía completa (4:3, sin recortes) con inclinación 3D y cuenta regresiva flotante.
     Todos los efectos se apagan con "reducir movimiento" y en pantallas táctiles. -->
<template>
  <section
    ref="seccion"
    class="portada relative isolate overflow-hidden bg-marca-950 text-white"
    @pointermove="mover"
    @pointerleave="soltar"
  >
    <!-- Fondo: red girando, halo que sigue al cursor y retícula fina -->
    <MarcaRed class="girar-lento pointer-events-none absolute -left-56 -top-56 -z-10 size-[46rem] text-white/[0.07]" />
    <MarcaRed class="girar-lento pointer-events-none absolute -bottom-72 right-[-14rem] -z-10 size-[40rem] text-acento-400/[0.08] [animation-direction:reverse]" />
    <div class="halo pointer-events-none absolute inset-0 -z-10" />
    <div class="reticula pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />

    <UContainer class="grid items-center gap-6 pb-10 pt-5 sm:gap-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
      <!-- Texto -->
      <div>
        <div class="entrada hidden items-center gap-4 sm:flex">
          <img src="/img/escudo-160.png" alt="Escudo de la Federación" class="h-12 w-auto drop-shadow-xl sm:h-20" width="138" height="160">
          <div class="border-l border-white/25 pl-4">
            <p class="font-display text-sm font-bold uppercase tracking-[0.24em] text-acento-300">{{ siglas }}</p>
            <p class="text-sm text-white/70">{{ ciudad }}</p>
          </div>
        </div>

        <h1 class="font-display sm:mt-8 text-[1.65rem] font-bold uppercase leading-[1.08] tracking-[0.02em] sm:text-5xl sm:leading-[1.04] sm:tracking-[0.03em] xl:text-[3.4rem]" :aria-label="nombre">
          <span
            v-for="(p, i) in palabras"
            :key="i"
            class="palabra mr-[0.28em] inline-block"
            :class="{ 'text-acento-300': destacada(p) }"
            :style="{ '--retraso': `${120 + i * 70}ms` }"
            aria-hidden="true"
          >{{ p }}</span>
        </h1>

        <p v-if="lema" class="entrada mt-4 max-w-xl border-l-2 border-acento-500 pl-3 text-[15px] text-white/85 sm:mt-6 sm:pl-4 sm:text-lg" :style="{ '--retraso': `${200 + palabras.length * 70}ms` }">
          {{ lema }}
        </p>

        <div class="entrada mt-6 grid gap-2.5 sm:mt-9 sm:flex sm:flex-wrap sm:gap-3" :style="{ '--retraso': `${300 + palabras.length * 70}ms` }">
          <UButton to="/admision" label="Afíliese a la Federación" icon="i-lucide-user-plus" size="xl" class="boton-brillo justify-center bg-acento-500 text-white hover:bg-acento-600" />
          <UButton to="/organizacion" label="Conózcanos" icon="i-lucide-landmark" size="xl" class="justify-center bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
        </div>

        <dl v-if="cifras.length" class="entrada mt-12 hidden max-w-lg grid-cols-3 gap-6 border-t sm:grid border-white/15 pt-6" :style="{ '--retraso': `${400 + palabras.length * 70}ms` }">
          <div v-for="c in cifras" :key="c.etiqueta">
            <dt class="sr-only">{{ c.etiqueta }}</dt>
            <dd class="font-display text-3xl font-bold text-white"><SitioContador :valor="c.valor" /></dd>
            <p class="mt-1 text-xs leading-snug text-white/60">{{ c.etiqueta }}</p>
          </div>
        </dl>
      </div>

      <!-- Fotografía con inclinación 3D -->
      <div class="entrada relative mt-2 [perspective:1400px] sm:mt-0" style="--retraso: 260ms">
        <div class="inclinacion relative">
          <!-- Marco cobre desplazado: se mueve en sentido contrario a la foto -->
          <div class="marco absolute inset-0 hidden translate-x-4 translate-y-4 rounded-lg sm:block border-2 border-acento-500 sm:translate-x-6 sm:translate-y-6" aria-hidden="true" />
          <figure class="relative overflow-hidden rounded-lg shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/15">
            <img
              src="/images/general.jpg"
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
          class="cartel group relative z-10 mx-auto -mt-3 block w-[94%] max-w-sm overflow-hidden rounded-lg text-white shadow-[0_24px_60px_-12px_rgb(0_0_0/0.65)] ring-1 ring-white/20 sm:-mt-5 sm:ml-[-1.5rem] sm:mr-0 sm:w-[22rem] lg:ml-[-2.5rem]"
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
    radial-gradient(600px circle at var(--mx) var(--my), rgb(217 106 34 / 0.16), transparent 60%),
    radial-gradient(900px circle at 85% 20%, rgb(72 88 173 / 0.35), transparent 65%);
  transition: background 0.2s;
}

/* Retícula técnica muy tenue */
.reticula {
  background-image:
    linear-gradient(to right, white 1px, transparent 1px),
    linear-gradient(to bottom, white 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%);
}

/* Título palabra por palabra */
.palabra {
  animation: palabra 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: var(--retraso, 0ms);
}
@keyframes palabra {
  from { opacity: 0; transform: translateY(0.6em) rotate(2deg); filter: blur(8px); }
  to { opacity: 1; transform: none; filter: none; }
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

/* Brillo que cruza el botón principal */
.boton-brillo {
  position: relative;
  overflow: hidden;
}
.boton-brillo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgb(255 255 255 / 0.7) 50%, transparent 65%);
  transform: translateX(-120%);
  animation: brillo 5s ease-in-out 2s infinite;
}
@keyframes brillo {
  0%, 70% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}

/* Cambio de dígito de la cuenta regresiva */
/* Cada dígito nuevo entra deslizándose (se monta de nuevo al cambiar su clave). */
.digito { animation: digito 0.35s cubic-bezier(0.2, 0.7, 0.2, 1); }
@keyframes digito {
  from { transform: translateY(-35%); opacity: 0.2; }
  to { transform: none; opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .palabra, .respirar, .digito, .cartel, .ondas, .boton-brillo::after { animation: none; }
  .inclinacion, .marco { transform: none; }
}
</style>
