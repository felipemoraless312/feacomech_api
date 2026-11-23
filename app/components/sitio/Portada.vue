<!-- Portada del inicio: composición de «fotografía oficial». Arriba, el nombre de la Federación
     centrado (en un renglón en pantallas anchas) con su lema; debajo, el grupo de la Federación
     de pie en un escenario: arco lavanda con el escudo al fondo, como el muro de una sesión
     solemne, y piso con sombra; a los lados, dos estandartes en los que desfilan los logotipos de
     todos los colegios agremiados. A sus pies, una ficha con las cifras y las acciones principales. Las
     Jornadas se anuncian con una insignia sobre el título mientras están vigentes.
     Todos los efectos se apagan con "reducir movimiento" y en pantallas táctiles. -->
<template>
  <section
    ref="seccion"
    class="portada relative isolate overflow-hidden bg-gradient-to-b from-marca-50 via-[#fbf9fd] to-white text-marca-950 dark:from-marca-950 dark:via-marca-950 dark:to-gris-950 dark:text-white"
    @pointermove="mover"
    @pointerleave="soltar"
  >
    <!-- Fondo: aurora, red girando y halo que sigue al cursor -->
    <div class="aurora [--aurora-1:var(--color-marca-200)] [--aurora-2:var(--color-acento-200)] [--aurora-opacidad:0.5]" />
    <MarcaRed class="girar-lento pointer-events-none absolute -left-64 -top-64 -z-10 size-[46rem] text-marca-300/25 dark:text-white/[0.06]" />
    <MarcaRed class="girar-lento pointer-events-none absolute -right-64 top-24 -z-10 size-[40rem] text-acento-300/20 [animation-direction:reverse]" />
    <div class="halo pointer-events-none absolute inset-0 -z-10" />

    <!-- Encabezado centrado -->
    <UContainer class="relative pt-6 text-center sm:pt-10 lg:pt-12">
      <!-- Insignia de las Jornadas (sólo mientras están vigentes) -->
      <NuxtLink
        v-if="jornadasVigentes"
        to="/jornadas-2026"
        class="entrada group mx-auto inline-flex max-w-full items-center gap-2.5 rounded-full bg-white/80 py-1.5 pl-1.5 pr-4 text-left text-[13px] shadow-tarjeta ring-1 ring-marca-200/80 backdrop-blur transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante dark:bg-white/10 dark:ring-white/15"
      >
        <span class="cartel shrink-0 rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          {{ enCurso ? 'En curso' : faltan }}
        </span>
        <span class="truncate font-medium text-marca-900 dark:text-white">
          {{ JORNADAS_2026.edicion }} Jornadas Académicas · 26–28 nov
        </span>
        <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-acento-600 transition-transform group-hover:translate-x-0.5" />
      </NuxtLink>

      <div class="entrada mt-5 flex items-center justify-center gap-3 sm:mt-7" style="--retraso: 60ms">
        <span class="h-px w-8 bg-gradient-to-r from-transparent to-acento-500 sm:w-14" aria-hidden="true" />
        <p class="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-acento-600 sm:text-xs sm:tracking-[0.3em] dark:text-acento-300">
          {{ siglas }} · {{ ciudad }}
        </p>
        <span class="h-px w-8 bg-gradient-to-l from-transparent to-acento-500 sm:w-14" aria-hidden="true" />
      </div>

      <h1
        class="mx-auto mt-3 max-w-[22ch] font-display text-[1.4rem] font-bold uppercase leading-[1.1] tracking-[0.02em] text-marca-900 text-balance sm:mt-4 sm:max-w-4xl sm:text-[2.1rem] sm:leading-[1.08] lg:max-w-5xl lg:text-[2.5rem] xl:max-w-none xl:whitespace-nowrap xl:text-[clamp(1.45rem,2.05vw,2.1rem)] xl:tracking-[0.015em] dark:text-white"
        :aria-label="nombre"
      >
        <span
          v-for="(p, i) in palabras"
          :key="i"
          class="palabra mr-[0.26em] inline-block last:mr-0"
          :style="{ '--retraso': `${100 + i * 45}ms` }"
          aria-hidden="true"
        ><span :class="{ 'texto-degradado': destacada(p) }">{{ p }}</span></span>
      </h1>

      <p v-if="lema" class="entrada mx-auto mt-3 max-w-xl font-display text-[15px] italic text-gris-700 sm:mt-4 sm:text-lg dark:text-white/80" :style="{ '--retraso': `${160 + palabras.length * 45}ms` }">
        «{{ lema }}»
      </p>

    </UContainer>

    <!-- Escenario: la Federación reunida, rodeada por sus colegios -->
    <div class="relative">
      <!-- Estandartes a los lados del escenario (pantallas anchas), como en una ceremonia oficial:
           cuelgan de una barra, con el escudo arriba y punta en cola de golondrina; dentro desfilan
           los logotipos de todos los colegios agremiados (sube uno, baja el otro). Cada logotipo
           lleva a la ficha de su colegio; el desfile se detiene al pasar el cursor. -->
      <div
        v-for="e in estandartes"
        :key="e.clave"
        class="pointer-events-none absolute inset-y-0 hidden w-[calc(50%-32rem)] justify-center pt-[1%] xl:flex"
        :class="e.clave === 'izq' ? 'left-0' : 'right-0'"
      >
        <nav class="estandarte pointer-events-auto relative flex h-[94%] w-24 flex-col 2xl:w-32" :class="e.clave === 'der' ? '[animation-delay:-3s]' : ''" :aria-label="`Colegios agremiados (${e.colegios.length})`">
          <!-- Barra de la que cuelga -->
          <span class="absolute -inset-x-2 -top-1.5 h-2 2xl:-inset-x-3 rounded-full bg-gradient-to-r from-acento-700 via-acento-300 to-acento-700 shadow-sm" aria-hidden="true">
            <span class="absolute -left-1 top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-acento-500 ring-2 ring-acento-200" />
            <span class="absolute -right-1 top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-acento-500 ring-2 ring-acento-200" />
          </span>
          <!-- Paño -->
          <div class="pano relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-marca-800 via-marca-700 to-marca-600 pb-10 pt-4 text-white shadow-[0_24px_48px_-20px_rgb(43_24_64/0.6)]">
            <img src="/img/marca/escudo-160.png" alt="" aria-hidden="true" class="h-11 w-auto drop-shadow-[0_4px_8px_rgb(0_0_0/0.3)]" width="138" height="160">
            <p class="mt-2 px-2 text-center font-display text-[9px] font-bold uppercase leading-tight tracking-[0.18em] text-acento-200">
              Colegios<br>agremiados
            </p>
            <span class="mt-2 h-px w-10 bg-gradient-to-r from-transparent via-acento-300 to-transparent" aria-hidden="true" />
            <!-- Desfile -->
            <div class="desfile relative mt-2 w-full flex-1 overflow-hidden">
              <ul class="franja-vertical flex flex-col items-center gap-3 py-2" :class="e.clave === 'der' ? 'hacia-abajo' : ''">
                <template v-for="copia in 2" :key="copia">
                  <li v-for="c in e.colegios" :key="`${copia}-${c.slug}`" :aria-hidden="copia === 2 ? 'true' : undefined">
                    <NuxtLink
                      :to="`/directorio/${c.slug}`"
                      :tabindex="copia === 2 ? -1 : undefined"
                      :title="c.nombre"
                      class="flex size-14 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-[0_6px_14px_-6px_rgb(0_0_0/0.45)] ring-2 ring-acento-300/60 transition-transform duration-300 hover:scale-110 2xl:size-[4.5rem]"
                    >
                      <img v-if="c.logo" :src="c.logo" :alt="copia === 2 ? '' : `Logotipo del ${c.nombre}`" class="size-full object-contain" loading="lazy" width="80" height="80">
                      <span v-else class="px-0.5 text-center font-display text-[9px] font-bold uppercase leading-tight tracking-wide text-marca-700">{{ c.clave }}</span>
                    </NuxtLink>
                  </li>
                </template>
              </ul>
            </div>
            <!-- Ribete cobre -->
            <span class="pointer-events-none absolute inset-x-1.5 inset-y-0 border-x border-acento-300/50" aria-hidden="true" />
          </div>
        </nav>
      </div>

    <figure class="escenario entrada relative mx-auto mt-6 max-w-5xl sm:mt-8 sm:px-6 lg:px-8" :style="{ '--retraso': `${300 + palabras.length * 45}ms` }">
      <div class="relative isolate pt-[12%]">
        <!-- Muro: arco lavanda con el escudo al centro, sobre las cabezas -->
        <div class="arco pointer-events-none absolute inset-x-[3%] bottom-[14%] top-0 -z-20" aria-hidden="true" />
        <img
          src="/img/marca/escudo-512.png"
          alt=""
          aria-hidden="true"
          class="escudo pointer-events-none absolute left-1/2 top-[1.5%] -z-10 w-[7.5%] select-none drop-shadow-[0_8px_16px_rgb(64_40_88/0.22)]"
          width="512"
          height="594"
        >
        <!-- Piso: elipse luminosa y sombra de contacto bajo los pies -->
        <div class="piso pointer-events-none absolute inset-x-0 -bottom-[5%] -z-10 h-[22%]" aria-hidden="true" />
        <div class="pointer-events-none absolute inset-x-[12%] bottom-[1%] -z-10 h-[5%] rounded-[50%] bg-marca-950/25 blur-lg dark:bg-black/60" aria-hidden="true" />

        <div class="grupo">
          <img
            src="/img/portada/colegio-2026.webp"
            alt="Integrantes de la mesa directiva, el consejo consultivo y presidentes de colegios de la FEACOMECH, 2026"
            class="relative mx-auto w-[94%]"
            width="1119"
            height="397"
            fetchpriority="high"
          >
        </div>
      </div>
      <figcaption class="sr-only">
        La Federación reunida: mesa directiva, consejo consultivo y presidencias de los colegios agremiados, bienio 2026–2028.
      </figcaption>
    </figure>
    </div>

    <!-- Ficha a los pies del grupo: cifras y acciones principales -->
    <UContainer class="relative mt-2 pb-8 sm:pb-14">
      <div
        class="entrada mx-auto grid max-w-5xl items-center overflow-hidden rounded-2xl bg-white/90 shadow-flotante ring-1 ring-marca-100 backdrop-blur lg:grid-cols-[1fr_auto] dark:bg-marca-900/80 dark:ring-white/10"
        :style="{ '--retraso': `${380 + palabras.length * 45}ms` }"
      >
        <dl v-if="cifras.length" class="grid grid-cols-3 divide-x divide-marca-100 dark:divide-white/10">
          <div v-for="c in cifras" :key="c.etiqueta" class="px-2 py-3 text-center sm:px-5 sm:py-5">
            <dt class="sr-only">{{ c.etiqueta }}</dt>
            <dd class="font-display text-xl font-bold text-marca-700 tabular-nums sm:text-3xl dark:text-white"><SitioContador :valor="c.valor" /></dd>
            <p class="mx-auto mt-0.5 max-w-[16ch] text-[10px] leading-tight text-muted text-balance sm:mt-1 sm:text-xs">{{ c.etiqueta }}</p>
          </div>
        </dl>
        <div class="grid grid-cols-2 gap-2 border-t border-marca-100 p-3 sm:flex sm:justify-center sm:gap-3 sm:p-4 lg:border-l lg:border-t-0 lg:px-6 dark:border-white/10">
          <UButton to="/admision" icon="i-lucide-user-plus" size="lg" class="boton-brillo justify-center rounded-full bg-gradient-to-r from-acento-500 to-acento-400 px-4 text-white sm:px-7 shadow-[0_10px_28px_-10px_rgb(217_106_34/0.75)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:from-acento-600 hover:to-acento-500 hover:shadow-[0_14px_32px_-10px_rgb(217_106_34/0.8)]">
            <span class="sm:hidden">Afíliese</span><span class="hidden sm:inline">Afíliese a la Federación</span>
          </UButton>
          <UButton to="/organizacion" icon="i-lucide-users-round" size="lg" class="justify-center rounded-full bg-white px-4 text-marca-700 sm:px-7 shadow-tarjeta ring-1 ring-marca-200 transition-transform hover:-translate-y-0.5 hover:bg-marca-50 dark:bg-white/10 dark:text-white dark:ring-white/30">
            Mesa directiva
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { COLEGIOS_AFILIADOS } from '#shared/colegios'
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

// Estandartes: todos los colegios agremiados repartidos en dos (los que aún no tienen logotipo
// aparecen con su nombre). Cada lista se duplica en la plantilla para que el desfile sea continuo.
const TODOS = COLEGIOS_AFILIADOS.map(c => ({ slug: c.slug, nombre: c.nombre, clave: c.clave, logo: c.logo ? `/img/colegios/${c.slug}.webp` : null }))
const mitad = Math.ceil(TODOS.length / 2)
const estandartes = [
  { clave: 'izq', colegios: TODOS.slice(0, mitad) },
  { clave: 'der', colegios: TODOS.slice(mitad) },
]

// Días que faltan para las Jornadas (mismo valor al hidratar; se actualiza en el navegador).
const ahora = useState('inicio-ahora', () => Date.now())
let reloj: ReturnType<typeof setInterval> | undefined
onMounted(() => { reloj = setInterval(() => (ahora.value = Date.now()), 60_000) })
onBeforeUnmount(() => clearInterval(reloj))
const enCurso = computed(() => ahora.value >= new Date(JORNADAS_2026.inicio).getTime())
const faltan = computed(() => {
  const dias = Math.ceil((new Date(JORNADAS_2026.inicio).getTime() - ahora.value) / 86_400_000)
  return dias <= 1 ? 'Mañana' : `Faltan ${dias} días`
})

// Halo y paralaje: variables CSS actualizadas una vez por cuadro.
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
    el.style.setProperty('--px', `${((0.5 - x) * 10).toFixed(1)}px`)
  })
}
function soltar() {
  const el = seccion.value
  if (!el) return
  cancelAnimationFrame(cuadro)
  el.style.setProperty('--px', '0px')
}
onBeforeUnmount(() => cancelAnimationFrame(cuadro))
</script>

<style scoped>
.portada {
  --mx: 50%;
  --my: 40%;
  --px: 0px;
}

/* Halo de luz que acompaña al cursor */
.halo {
  background:
    radial-gradient(600px circle at var(--mx) var(--my), rgb(236 164 109 / 0.16), transparent 60%),
    radial-gradient(1000px circle at 50% 70%, rgb(192 169 218 / 0.28), transparent 65%);
  transition: background 0.2s;
}

/* Título palabra por palabra (sólo opacidad y transform) */
.palabra {
  animation: palabra 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: var(--retraso, 0ms);
}
@keyframes palabra {
  from { opacity: 0; transform: translateY(0.5em) rotate(2deg); }
  to { opacity: 1; transform: none; }
}

/* Muro en arco detrás del grupo: degradado lavanda que se desvanece hacia los lados y abajo */
.arco {
  border-radius: 50% 50% 0 0 / 38% 38% 0 0;
  background:
    radial-gradient(ellipse 60% 70% at 50% 35%, rgb(255 255 255 / 0.9), transparent 70%),
    linear-gradient(to bottom, var(--color-marca-100), color-mix(in oklab, var(--color-marca-100) 45%, transparent) 70%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.9), inset 0 0 0 1px color-mix(in oklab, var(--color-marca-200) 70%, transparent);
  mask-image: linear-gradient(to bottom, black 55%, transparent);
}
.dark .arco {
  background: linear-gradient(to bottom, color-mix(in oklab, var(--color-marca-800) 70%, transparent), transparent 85%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
}

/* Piso: elipse clara que recibe al grupo */
.piso {
  border-radius: 50%;
  background: radial-gradient(ellipse at 50% 40%, color-mix(in oklab, var(--color-marca-200) 55%, transparent), transparent 70%);
}
.dark .piso { background: radial-gradient(ellipse at 50% 40%, rgb(255 255 255 / 0.06), transparent 70%); }

/* El escudo del muro y el grupo se desplazan levemente en sentidos opuestos (profundidad) */
.escudo {
  transform: translate(calc(-50% - var(--px) * 0.6), 0);
  transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.grupo {
  transform: translate3d(var(--px), 0, 0);
  transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}

/* Estandarte: punta en cola de golondrina y leve vaivén desde la barra */
.pano {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 2.25rem), 0 100%);
}
.estandarte {
  transform-origin: 50% 0;
  animation: vaiven 7s ease-in-out infinite alternate;
}
@keyframes vaiven {
  from { transform: rotate(-0.8deg); }
  to { transform: rotate(0.8deg); }
}
.desfile {
  mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
}
.franja-vertical {
  animation: desfile 46s linear infinite;
}
.franja-vertical.hacia-abajo {
  animation-direction: reverse;
}
.estandarte:hover .franja-vertical,
.estandarte:focus-within .franja-vertical {
  animation-play-state: paused;
}
@keyframes desfile {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

/* Insignia de las Jornadas: el degradado azul → cobre del cartel oficial */
.cartel {
  background: linear-gradient(135deg, #2b3a8f 0%, #4a4a8c 38%, #8a5a6e 68%, #d96a22 100%);
  background-size: 160% 160%;
  animation: cartel 12s ease-in-out infinite alternate;
}
@keyframes cartel {
  from { background-position: 0% 0%; }
  to { background-position: 100% 100%; }
}

@media (hover: none) {
  .cartel { animation: none; }
}

@media (prefers-reduced-motion: reduce) {
  .palabra, .cartel, .estandarte { animation: none; }
  .franja-vertical { animation: none; }
  .desfile { overflow-y: auto; }
  .grupo { transform: none; }
  .escudo { transform: translate(-50%, 0); }
}
</style>
