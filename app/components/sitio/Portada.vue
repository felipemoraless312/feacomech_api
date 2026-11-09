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
      <div class="order-2 lg:order-1">
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
          <UButton to="/directorio" label="Colegios y asociaciones" icon="i-lucide-landmark" size="xl" class="boton-brillo justify-center bg-white text-marca-900 hover:bg-marca-50" />
          <UButton to="/plataforma" label="Plataforma para afiliados" icon="i-lucide-lock" size="xl" class="justify-center bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
        </div>

        <!-- Cifras animadas -->
        <dl v-if="cifras.length" class="entrada mt-12 hidden max-w-lg grid-cols-3 gap-6 border-t sm:grid border-white/15 pt-6" :style="{ '--retraso': `${400 + palabras.length * 70}ms` }">
          <div v-for="c in cifras" :key="c.etiqueta">
            <dt class="sr-only">{{ c.etiqueta }}</dt>
            <dd class="font-display text-3xl font-bold text-white"><SitioContador :valor="c.valor" /></dd>
            <p class="mt-1 text-xs leading-snug text-white/60">{{ c.etiqueta }}</p>
          </div>
        </dl>
      </div>

      <!-- Fotografía con inclinación 3D -->
      <div class="entrada relative order-1 [perspective:1400px] lg:order-2" style="--retraso: 120ms">
        <div class="inclinacion relative">
          <!-- Marco cobre desplazado: se mueve en sentido contrario a la foto -->
          <div class="marco absolute inset-0 hidden translate-x-4 translate-y-4 rounded-lg sm:block border-2 border-acento-500 sm:translate-x-6 sm:translate-y-6" aria-hidden="true" />
          <figure class="relative overflow-hidden rounded-lg shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/15">
            <img
              src="/img/jornadas-2025-1280.webp"
              srcset="/img/jornadas-2025-768.webp 768w, /img/jornadas-2025-1280.webp 1280w, /img/jornadas-2025-1920.webp 1920w"
              sizes="(min-width: 1024px) 46vw, 100vw"
              alt="Integrantes de la Federación reunidos en las Jornadas Médicas FEACOMECH 2025"
              class="respirar aspect-[4/3] w-full object-cover"
              width="1280"
              height="960"
              fetchpriority="high"
            >
            <!-- Reflejo que recorre la foto al inclinarla -->
            <div class="reflejo pointer-events-none absolute inset-0" aria-hidden="true" />
            <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-marca-950/85 to-transparent px-5 pb-4 pt-12 text-sm font-medium text-white/90">
              Jornadas Médicas FEACOMECH 2025
            </figcaption>
          </figure>
        </div>

        <!-- Cuenta regresiva flotante -->
        <NuxtLink
          v-if="jornadasVigentes"
          to="/jornadas-2026"
          class="flotar group relative z-10 mx-auto -mt-8 block w-[92%] max-w-sm overflow-hidden rounded-lg bg-white text-marca-950 shadow-flotante ring-1 ring-black/5 sm:absolute sm:-bottom-14 sm:-left-10 sm:mt-0 sm:w-80"
        >
          <div class="flex items-center justify-between bg-acento-500 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            <span class="flex items-center gap-2">
              <span class="relative flex size-2"><span class="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75 motion-reduce:hidden" /><span class="relative inline-flex size-2 rounded-full bg-white" /></span>
              Próximo evento
            </span>
            <span>26 – 28 nov</span>
          </div>
          <div class="p-4">
            <p class="font-display text-base font-bold uppercase leading-tight tracking-[0.04em]">VII Jornadas Académicas FEACOMECH</p>
            <p class="font-display text-xs font-semibold uppercase italic tracking-[0.06em] text-acento-600">&amp; Simposio de Dermatología</p>
            <div class="mt-3 grid grid-cols-4 gap-1.5 text-center">
              <div v-for="u in cuenta" :key="u.t" class="rounded-md bg-marca-50 py-1.5">
                <p :key="u.v" class="digito font-display text-xl font-bold tabular-nums text-marca-800">{{ u.v }}</p>
                <p class="text-[9px] font-medium uppercase tracking-wide text-marca-900/60">{{ u.t }}</p>
              </div>
            </div>
            <p class="mt-3 flex items-center justify-between text-sm font-semibold text-marca-800">
              Programa e inscripción
              <UIcon name="i-lucide-arrow-right" class="size-5 transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </NuxtLink>
      </div>
    </UContainer>

    <div class="hidden justify-center pb-6 pt-10 sm:flex sm:pt-16">
      <UIcon name="i-lucide-chevrons-down" class="rebote size-6 text-white/40" aria-hidden="true" />
    </div>
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
  .palabra, .respirar, .digito, .boton-brillo::after { animation: none; }
  .inclinacion, .marco { transform: none; }
}
</style>
