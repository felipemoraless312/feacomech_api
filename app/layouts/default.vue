<!-- Portal público. Separado de la plataforma privada (layout "plataforma"). -->
<template>
  <div>
    <!-- Barra de servicio: aviso vigente a la izquierda; trámites frecuentes a la derecha -->
    <div class="bg-marca-950 text-white">
      <UContainer class="flex h-9 items-center justify-between gap-4 text-[12.5px]">
        <NuxtLink v-if="avisoJornadas" to="/jornadas-2026" class="group flex min-w-0 items-center gap-2 hover:text-acento-200">
          <span class="shrink-0 rounded-sm bg-acento-500 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-white">26–28 nov</span>
          <span class="truncate"><strong class="font-semibold">VII Jornadas Académicas 2026</strong><span class="hidden md:inline"> · Inscripciones abiertas</span></span>
          <UIcon name="i-lucide-arrow-right" class="hidden size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:block" />
        </NuxtLink>
        <p v-else class="truncate font-display font-semibold uppercase tracking-[0.18em] text-white/70">
          Por la dignificación y unión profesional
        </p>
        <nav class="flex shrink-0 items-center gap-1 sm:gap-4" aria-label="Accesos">
          <NuxtLink to="/constancias" class="flex items-center gap-1.5 rounded px-1.5 py-1 text-white/80 hover:text-white">
            <UIcon name="i-lucide-award" class="size-4" /><span class="hidden sm:inline">Constancias</span>
          </NuxtLink>
          <NuxtLink to="/contacto" class="hidden items-center gap-1.5 text-white/80 hover:text-white md:flex">
            <UIcon name="i-lucide-mail" class="size-4" />Contacto
          </NuxtLink>
          <NuxtLink to="/plataforma" class="flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 font-semibold hover:bg-white/20">
            <UIcon name="i-lucide-lock" class="size-3.5" />Plataforma
          </NuxtLink>
        </nav>
      </UContainer>
    </div>

    <UHeader to="/" :ui="{ root: 'bg-default/95 backdrop-blur border-b-0 shadow-[0_1px_0_var(--ui-border)]', left: 'lg:flex-none xl:flex-1', center: 'lg:hidden xl:flex', right: 'lg:flex-none xl:flex-1', toggle: 'lg:inline-flex xl:hidden', content: 'lg:flex xl:hidden', overlay: 'lg:block xl:hidden' }">
      <template #left>
        <NuxtLink to="/" aria-label="FEACOMECH, inicio" class="flex items-center gap-3">
          <img src="/img/escudo-160.png" alt="" class="h-12 w-auto" width="138" height="160">
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
        :ui="{ link: 'text-[14px] font-semibold text-default data-[state=open]:text-primary', childList: 'min-w-72', childLinkLabel: 'font-semibold' }"
      />

      <template #right>
        <UButton to="/admision" label="Afíliese" icon="i-lucide-user-plus" class="hidden bg-acento-500 text-white hover:bg-acento-600 sm:inline-flex" />
      </template>

      <template #body>
        <UNavigationMenu :items="enlaces" orientation="vertical" color="neutral" class="-mx-2.5" />
        <div class="mt-6 grid gap-3">
          <UButton to="/admision" icon="i-lucide-user-plus" label="Afíliese a la Federación" block class="bg-acento-500 text-white hover:bg-acento-600" />
          <UButton to="/constancias" icon="i-lucide-award" label="Descargar mi constancia" block color="neutral" variant="outline" />
          <UButton to="/plataforma" icon="i-lucide-lock" label="Acceso a la plataforma" block />
        </div>
      </template>
    </UHeader>
    <div class="filete-marca" />

    <UMain>
      <slot />
    </UMain>

    <footer class="relative isolate overflow-hidden bg-marca-950 text-white/80 [--ui-text-muted:rgb(255_255_255/0.72)] [--ui-text-highlighted:#fff] [--ui-text-dimmed:rgb(255_255_255/0.5)] [--ui-border:rgb(255_255_255/0.12)]">
      <div class="filete-marca" />
      <img src="/img/escudo-512.png" alt="" aria-hidden="true" class="pointer-events-none absolute -right-24 top-10 -z-10 w-[26rem] opacity-[0.05] grayscale">

      <!-- Llamado a la afiliación -->
      <UContainer class="flex flex-col gap-6 border-b border-default py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="font-display text-sm font-semibold uppercase tracking-[0.22em] text-acento-300">
            Por la dignificación y unión profesional
          </p>
          <p class="mt-2 max-w-xl font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
            Sume a su colegio a la red médica de Chiapas.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton to="/admision" label="Proceso de admisión" size="lg" class="bg-acento-500 text-white hover:bg-acento-600" />
          <UButton to="/beneficios" label="Beneficios" size="lg" class="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" />
        </div>
      </UContainer>

      <UContainer class="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="rounded-xl bg-white p-1.5"><img src="/img/escudo-160.png" alt="" class="h-14 w-auto" width="138" height="160"></span>
            <span class="font-display text-2xl font-bold tracking-[0.06em] text-white">FEACOMECH</span>
          </div>
          <p class="max-w-xs text-sm leading-relaxed text-muted">
            {{ institucion?.nombre ?? 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' }}
          </p>
          <a v-if="institucion?.facebook" :href="institucion.facebook" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">
            <UIcon name="i-lucide-facebook" class="size-4" /> Síganos en Facebook
          </a>
        </div>
        <nav v-for="g in gruposPie" :key="g.titulo" class="space-y-3 text-sm" :aria-label="g.titulo">
          <p class="font-display text-xs font-semibold uppercase tracking-[0.18em] text-acento-300">
            {{ g.titulo }}
          </p>
          <NuxtLink v-for="e in g.enlaces" :key="e.to" :to="e.to" class="block text-muted hover:text-white">
            {{ e.label }}
          </NuxtLink>
        </nav>
      </UContainer>

      <UContainer class="flex flex-wrap items-center justify-between gap-3 border-t border-default py-5 text-xs text-dimmed">
        <span>© {{ new Date().getFullYear() }} {{ institucion?.siglas ?? 'FEACOMECH' }}<template v-if="contacto"> · {{ contacto }}</template></span>
        <NuxtLink to="/aviso-de-privacidad" class="hover:text-muted">
          Aviso de privacidad
        </NuxtLink>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { data: institucion } = await useInstitucion()

const contacto = computed(() => [
  institucion.value?.direccion,
  institucion.value?.ciudad,
  institucion.value?.telefono && `Tel. ${institucion.value.telefono}`,
  institucion.value?.email,
].filter(Boolean).join(' · '))

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
  { label: 'Colaboradores', to: '/vinculacion' },
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
    { label: 'Colaboradores', to: '/vinculacion' },
  ] },
  { titulo: 'Servicios', enlaces: [
    { label: 'Noticias y eventos', to: '/noticias' },
    { label: 'Descargar constancias', to: '/constancias' },
    { label: 'Documentos', to: '/documentos' },
    { label: 'Plataforma para afiliados', to: '/plataforma' },
    { label: 'Contacto', to: '/contacto' },
  ] },
]
</script>
