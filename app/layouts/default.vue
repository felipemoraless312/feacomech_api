<!-- Portal público. Separado de la plataforma privada (layout "plataforma"). -->
<template>
  <div :class="{ 'con-intro': conIntro }">
    <SitioIntro v-if="intro" @fin="intro = false" />

    <!-- Barra de servicio: aviso vigente a la izquierda; trámites frecuentes a la derecha -->
    <div class="border-b border-marca-100 bg-gradient-to-r from-marca-100 via-marca-50 to-acento-50 text-marca-900 dark:border-marca-900 dark:from-marca-950 dark:via-marca-950 dark:to-marca-900 dark:text-marca-100">
      <UContainer class="flex h-9 items-center justify-between gap-4 text-[12.5px]">
        <NuxtLink v-if="avisoJornadas" to="/jornadas-2026" class="group flex min-w-0 items-center gap-2 transition-colors hover:text-acento-700 dark:hover:text-acento-300">
          <span class="boton-brillo shrink-0 rounded-sm bg-acento-500 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-white">26–28 nov</span>
          <span class="truncate"><strong class="font-semibold">VII Jornadas Académicas 2026</strong><span class="hidden md:inline"> · Inscripciones abiertas</span></span>
          <UIcon name="i-lucide-arrow-right" class="hidden size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:block" />
        </NuxtLink>
        <p v-else class="truncate font-display font-semibold uppercase tracking-[0.18em] text-marca-700/80 dark:text-marca-200/80">
          Por la dignificación y unión profesional
        </p>
        <nav class="flex shrink-0 items-center gap-1 sm:gap-4" aria-label="Accesos">
          <NuxtLink to="/constancias" class="flex items-center gap-1.5 rounded px-1.5 py-1 text-marca-800/80 transition-colors hover:text-marca-950 dark:text-marca-100/80 dark:hover:text-white">
            <UIcon name="i-lucide-award" class="size-4" /><span class="hidden sm:inline">Constancias</span>
          </NuxtLink>
          <NuxtLink to="/contacto" class="hidden items-center gap-1.5 text-marca-800/80 transition-colors hover:text-marca-950 md:flex dark:text-marca-100/80 dark:hover:text-white">
            <UIcon name="i-lucide-mail" class="size-4" />Contacto
          </NuxtLink>
          <NuxtLink v-if="enlacePlataforma" to="/plataforma" class="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 font-semibold text-marca-800 shadow-sm ring-1 ring-marca-200 transition-all hover:bg-white hover:shadow-md dark:bg-white/10 dark:text-white dark:ring-white/15">
            <UIcon name="i-lucide-lock" class="size-3.5" />Plataforma
          </NuxtLink>
        </nav>
      </UContainer>
    </div>

    <UHeader to="/" :ui="{ root: desplazado ? 'bg-default/80 backdrop-blur-xl backdrop-saturate-150 border-b-0 transition-shadow duration-300 shadow-[0_8px_30px_-12px_rgb(64_40_88/0.2),0_1px_0_var(--ui-border)]' : 'bg-default/80 backdrop-blur-xl backdrop-saturate-150 border-b-0 transition-shadow duration-300 shadow-[0_1px_0_var(--ui-border)]', left: 'lg:flex-none xl:flex-1', center: 'lg:hidden xl:flex', right: 'lg:flex-none xl:flex-1', toggle: 'lg:inline-flex xl:hidden', content: 'lg:flex xl:hidden', overlay: 'lg:block xl:hidden' }">
      <template #left>
        <NuxtLink to="/" aria-label="FEACOMECH, inicio" class="flex items-center gap-3">
          <img src="/img/marca/escudo-160.png" alt="" class="h-12 w-auto transition-transform duration-500 hover:-rotate-3 hover:scale-105" width="138" height="160">
          <span class="flex flex-col leading-none">
            <span class="font-display text-xl font-bold tracking-[0.06em] text-marca-800 dark:text-white">FEACOMECH</span>
            <span class="mt-1 hidden max-w-[15rem] text-[10.5px] font-medium uppercase leading-tight tracking-[0.08em] text-muted sm:block">Federación de Asociaciones y Colegios Médicos de Chiapas</span>
          </span>
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="enlacesBarra"
        variant="link"
        color="neutral"
        content-orientation="vertical"
        :ui="{
          link: 'text-[14px] font-semibold text-default data-[state=open]:text-primary',
          viewport: 'rounded-xl shadow-flotante ring-1 ring-default',
          content: 'w-[22rem] max-h-none overflow-visible',
          childList: 'p-2 gap-0.5',
          // El cuadro de color del icono es el ::after del enlace (el icono es una máscara CSS:
          // un fondo sobre él lo repinta del color del fondo).
          childLink: 'items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:before:bg-marca-50 data-active:before:bg-marca-50 dark:hover:before:bg-white/5 after:absolute after:start-3 after:top-1/2 after:-z-[1] after:size-9 after:-translate-y-1/2 after:rounded-lg after:bg-marca-100 after:transition-colors after:duration-200 hover:after:bg-acento-500 dark:after:bg-marca-900',
          childLinkIcon: 'mx-2 size-5 shrink-0 text-marca-700! transition-colors duration-200 group-hover:text-white! dark:text-marca-200!',
          childLinkLabel: 'overflow-visible whitespace-normal font-semibold text-highlighted',
          childLinkDescription: 'mt-0.5 text-[13px] leading-snug text-muted',
        }"
      />

      <template #right>
        <UButton to="/admision" label="Afíliese" icon="i-lucide-user-plus" class="boton-brillo hidden rounded-full bg-gradient-to-r from-acento-500 to-acento-400 px-4 text-white shadow-[0_6px_18px_-6px_rgb(217_106_34/0.6)] transition-[transform,box-shadow] hover:-translate-y-px hover:from-acento-600 hover:to-acento-500 hover:shadow-[0_10px_24px_-8px_rgb(217_106_34/0.7)] sm:inline-flex" />
      </template>

      <template #body>
        <UNavigationMenu :items="enlaces" orientation="vertical" color="neutral" class="-mx-2.5" />
        <div class="mt-6 grid gap-3">
          <UButton to="/admision" icon="i-lucide-user-plus" label="Afíliese a la Federación" block class="bg-acento-500 text-white hover:bg-acento-600" />
          <UButton to="/constancias" icon="i-lucide-award" label="Descargar mi constancia" block color="neutral" variant="outline" />
          <UButton v-if="enlacePlataforma" to="/plataforma" icon="i-lucide-lock" label="Acceso a la plataforma" block />
        </div>
      </template>
    </UHeader>
    <div class="filete-marca filete-resplandor relative z-10" />

    <UMain>
      <slot />
    </UMain>

    <footer class="relative isolate overflow-hidden bg-marca-50/80 dark:bg-marca-950/50">
      <div class="aurora [--aurora-opacidad:0.7]" />
      <div class="puntos pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <img src="/img/marca/escudo-512.png" alt="" aria-hidden="true" class="pointer-events-none absolute -right-24 bottom-0 -z-10 w-[26rem] opacity-[0.06]">

      <!-- Llamado a la afiliación -->
      <UContainer class="pt-14 sm:pt-16">
        <div v-revelar.escala class="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-marca-600 via-marca-500 to-acento-500 p-8 text-white shadow-flotante sm:p-10">
          <MarcaRed class="girar-lento pointer-events-none absolute -right-28 -top-36 -z-10 size-[26rem] text-white/15" />
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="font-display text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
                Por la dignificación y unión profesional
              </p>
              <p class="mt-2 max-w-xl font-display text-2xl font-semibold leading-snug sm:text-3xl">
                Sume a su colegio a la red médica de Chiapas.
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <UButton to="/admision" label="Proceso de admisión" trailing-icon="i-lucide-arrow-right" size="lg" class="boton-brillo rounded-full bg-white px-5 text-marca-700 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white" />
              <UButton to="/beneficios" label="Beneficios" size="lg" class="rounded-full bg-white/15 px-5 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25" />
            </div>
          </div>
        </div>
      </UContainer>

      <UContainer class="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="rounded-xl bg-white p-1.5 shadow-tarjeta ring-1 ring-marca-100"><img src="/img/marca/escudo-160.png" alt="" class="h-14 w-auto" width="138" height="160"></span>
            <span class="font-display text-2xl font-bold tracking-[0.06em] text-marca-800 dark:text-white">FEACOMECH</span>
          </div>
          <p class="max-w-xs text-sm leading-relaxed text-muted">
            {{ institucion?.nombre ?? 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' }}
          </p>
          <a v-if="institucion?.facebook" :href="institucion.facebook" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-marca-700 shadow-sm ring-1 ring-marca-100 transition-all hover:-translate-y-0.5 hover:shadow-tarjeta dark:bg-white/10 dark:text-white dark:ring-white/10">
            <UIcon name="i-lucide-facebook" class="size-4" /> Síganos en Facebook
          </a>
        </div>
        <nav v-for="g in gruposPie" :key="g.titulo" class="space-y-3 text-sm" :aria-label="g.titulo">
          <p class="font-display text-xs font-semibold uppercase tracking-[0.18em] text-acento-600 dark:text-acento-300">
            {{ g.titulo }}
          </p>
          <NuxtLink v-for="e in g.enlaces" :key="e.to" :to="e.to" class="block w-fit text-muted transition-colors hover:text-marca-700 dark:hover:text-white">
            <span class="subrayado">{{ e.label }}</span>
          </NuxtLink>
        </nav>
      </UContainer>

      <UContainer class="flex flex-wrap items-center justify-between gap-3 border-t border-default py-5 text-xs text-dimmed">
        <span>© {{ new Date().getFullYear() }} {{ institucion?.siglas ?? 'FEACOMECH' }}<template v-if="contacto"> · {{ contacto }}</template></span>
        <span class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <NuxtLink to="/desarrollo" class="group inline-flex items-center gap-1 hover:text-muted">
            <UIcon name="i-lucide-code-xml" class="size-3.5 transition-colors group-hover:text-acento-500" />
            Desarrollo web: Ing. Luis Felipe Morales · Numma
          </NuxtLink>
          <NuxtLink to="/aviso-de-privacidad" class="hover:text-muted">
            Aviso de privacidad
          </NuxtLink>
        </span>
      </UContainer>
    </footer>

    <!-- Volver arriba -->
    <UButton
      icon="i-lucide-arrow-up"
      aria-label="Volver arriba"
      size="lg"
      class="volver-arriba fixed bottom-5 right-5 z-40 rounded-full bg-white text-marca-700 shadow-flotante ring-1 ring-marca-100 hover:bg-marca-50 dark:bg-marca-900 dark:text-white dark:ring-white/10"
      :data-visible="String(lejos)"
      :tabindex="lejos ? 0 : -1"
      @click="subir"
    />
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// La plataforma no se anuncia: el enlace sólo aparece a quien ya entró desde este navegador.
const enlacePlataforma = useEnlacePlataforma()

const { data: institucion } = await useInstitucion()

const contacto = computed(() => [
  institucion.value?.direccion,
  institucion.value?.ciudad,
  institucion.value?.telefono && `Tel. ${institucion.value.telefono}`,
  institucion.value?.email,
].filter(Boolean).join(' · '))

// Imagen y URL al compartir cualquier página del portal (cada página puede afinarlas).
useCompartir()

// Entrada animada: sólo cuando la visita comienza en el inicio. `conIntro` retrasa las
// animaciones de la portada para que ocurran al subir la cortina; se apaga al salir del inicio.
const route = useRoute()
const intro = useState('fea-intro', () => route.path === '/')
const conIntro = useState('fea-con-intro', () => route.path === '/')
watch(() => route.path, (ruta) => {
  if (ruta !== '/') conIntro.value = false
})

// Encabezado con sombra al desplazarse y botón «volver arriba» tras bajar una pantalla.
const desplazado = ref(false)
const lejos = ref(false)
function alDesplazar() {
  desplazado.value = window.scrollY > 8
  lejos.value = window.scrollY > window.innerHeight
}
function subir() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
onMounted(() => {
  alDesplazar()
  window.addEventListener('scroll', alDesplazar, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', alDesplazar))

// El aviso superior se muestra hasta que concluyen las Jornadas.
const avisoJornadas = new Date() < new Date('2026-11-28T16:00:00-06:00')

// Estructura del documento «Página web de la FEACOMECH».
const enlaces: NavigationMenuItem[] = [
  { label: 'Inicio', to: '/' },
  {
    label: 'Organización',
    to: '/organizacion',
    children: [
      { label: 'Bienvenida', description: 'Mensaje de la presidenta de la Federación.', icon: 'i-lucide-message-square-quote', to: '/organizacion#bienvenida' },
      { label: 'Objetivo, misión y visión', description: 'Para qué existe la Federación.', icon: 'i-lucide-target', to: '/organizacion#objetivo' },
      { label: 'Mesa directiva', description: 'Integrantes y reseña curricular.', icon: 'i-lucide-users-round', to: '/organizacion#mesa-directiva' },
      { label: 'Consejo consultivo', description: 'Expresidentes que acompañan a la mesa.', icon: 'i-lucide-scale', to: '/organizacion#consejo-consultivo' },
      { label: 'Expresidentes', description: 'Presidencias en orden cronológico.', icon: 'i-lucide-history', to: '/expresidentes' },
    ],
  },
  {
    label: 'Admisión',
    to: '/admision',
    children: [
      { label: 'Incorporar mi colegio', description: 'Requisitos y pasos para colegios y asociaciones.', icon: 'i-lucide-landmark', to: '/admision#colegio' },
      { label: 'Afiliación individual', description: 'Para profesionales de la salud.', icon: 'i-lucide-stethoscope', to: '/admision#individual' },
      { label: 'Beneficios', description: 'Asesoría legal, eventos, cursos y convenios.', icon: 'i-lucide-gift', to: '/beneficios' },
    ],
  },
  { label: 'Colegios agremiados', to: '/directorio' },
  { label: 'Vinculación', to: '/vinculacion' },
  {
    label: 'Noticias y eventos',
    to: '/noticias',
    children: [
      { label: 'Noticias', description: 'Comunicados y pronunciamientos.', icon: 'i-lucide-newspaper', to: '/noticias' },
      { label: 'Eventos', description: 'Calendario académico.', icon: 'i-lucide-calendar', to: '/eventos' },
      { label: 'Historial de actividades', description: 'Lo que hemos realizado.', icon: 'i-lucide-history', to: '/noticias?tipo=ACTIVIDAD' },
      { label: 'Jornadas 2026', description: '26 al 28 de noviembre, Polyforum Chiapas.', icon: 'i-lucide-star', to: '/jornadas-2026' },
    ],
  },
  { label: 'Contacto', to: '/contacto' },
]

// En la barra de escritorio el escudo ya lleva al inicio y «Contacto» está arriba.
const enlacesBarra = enlaces.filter(e => e.to !== '/' && e.to !== '/contacto')

const gruposPie = [
  { titulo: 'Organización', enlaces: [
    { label: 'Bienvenida', to: '/organizacion#bienvenida' },
    { label: 'Mesa directiva', to: '/organizacion#mesa-directiva' },
    { label: 'Consejo consultivo', to: '/organizacion#consejo-consultivo' },
    { label: 'Expresidentes', to: '/expresidentes' },
  ] },
  { titulo: 'Afiliación', enlaces: [
    { label: 'Admisión', to: '/admision' },
    { label: 'Beneficios', to: '/beneficios' },
    { label: 'Colegios agremiados', to: '/directorio' },
    { label: 'Vinculación institucional', to: '/vinculacion' },
  ] },
  { titulo: 'Servicios', enlaces: [
    { label: 'Noticias y eventos', to: '/noticias' },
    { label: 'Descargar constancias', to: '/constancias' },
    { label: 'Documentos', to: '/documentos' },
    { label: 'Contacto', to: '/contacto' },
  ] },
]
</script>
