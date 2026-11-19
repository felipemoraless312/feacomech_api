<!-- Inicio del portal: portada, mensaje de la presidencia, instituciones aliadas, trámites
     frecuentes, noticias y próximos eventos, colegios agremiados y beneficios. La trayectoria
     vive en /organizacion#trayectoria y el historial de actividades en /noticias?tipo=ACTIVIDAD. -->
<template>
  <div>
    <SitioPortada
      :nombre="institucion?.nombre ?? 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas'"
      :siglas="institucion?.siglas ?? 'FEACOMECH'"
      :ciudad="institucion?.ciudad ?? 'Tuxtla Gutiérrez, Chiapas'"
      :lema="institucion?.lema || 'Por la dignificación y unión profesional'"
      :cifras="cifras.slice(0, 3)"
    />

    <!-- Bienvenida de la presidenta -->
    <section class="relative isolate overflow-hidden bg-marca-50 py-16 sm:py-20 dark:bg-marca-950/50">
      <MarcaRed class="pointer-events-none absolute -right-32 -top-32 -z-10 size-[32rem] text-marca-300/40 dark:text-marca-800/40" />
      <UContainer class="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        <div v-revelar.izquierda class="mx-auto flex flex-col items-center text-center lg:mx-0">
          <div class="relative">
            <div class="girar-lento absolute -inset-3 rounded-full border-2 border-dashed border-acento-400/70" aria-hidden="true" />
            <img :src="BIENVENIDA.foto" :alt="BIENVENIDA.autora" width="176" height="176" loading="lazy" class="relative size-44 rounded-full bg-marca-100 object-cover ring-8 ring-white dark:ring-marca-950">
          </div>
          <p class="mt-6 font-display text-xl font-bold text-highlighted">
            {{ BIENVENIDA.autora }}
          </p>
          <p class="text-sm text-muted">
            Presidenta · Bienio 2026–2028
          </p>
        </div>
        <div v-revelar="100">
          <p class="rotulo">
            Mensaje de bienvenida
          </p>
          <blockquote class="mt-4 font-display text-2xl font-medium leading-snug text-marca-900 text-balance sm:text-3xl dark:text-white">
            «{{ BIENVENIDA.parrafos[1] }}»
          </blockquote>
          <div class="mt-7 flex flex-wrap gap-3">
            <UButton to="/organizacion#bienvenida" label="Leer el mensaje completo" trailing-icon="i-lucide-arrow-right" />
            <UButton to="/organizacion#mesa-directiva" label="Conozca a la mesa directiva" color="neutral" variant="outline" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Vinculación institucional: dependencias de gobierno con las que hay convenio o colaboración -->
    <section v-if="inicio?.vinculos.length" class="relative isolate overflow-hidden py-16 sm:py-20">
      <MarcaRed class="girar-lento pointer-events-none absolute -left-40 top-1/2 -z-10 size-[30rem] -translate-y-1/2 text-marca-200/40 dark:text-white/5" />
      <UContainer class="space-y-10">
        <div class="mx-auto max-w-2xl space-y-3 text-center">
          <p v-revelar class="text-sm font-semibold uppercase tracking-[0.16em] text-acento-600 dark:text-acento-400">
            Vinculación institucional
          </p>
          <h2 v-revelar="60" class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Instituciones aliadas
          </h2>
          <p v-revelar="120" class="text-[17px] leading-relaxed text-muted">
            Trabajamos con las instituciones públicas de Chiapas en capacitación, promoción de la salud
            y el fortalecimiento del ejercicio profesional.
          </p>
        </div>
        <div class="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2" :class="{ 'lg:grid-cols-3': inicio.vinculos.length > 2 }">
          <SitioTarjetaInstitucion
            v-for="(v, n) in inicio.vinculos"
            :key="v.nombre"
            v-revelar.escala="n * 120"
            :vinculo="v"
            :indice="n"
            compacto
          />
        </div>
        <div class="flex justify-center">
          <UButton to="/vinculacion" label="Conocer la vinculación institucional" trailing-icon="i-lucide-arrow-right" color="neutral" variant="outline" size="lg" class="rounded-full" />
        </div>
      </UContainer>
    </section>

    <!-- ¿Qué desea hacer? — trámites frecuentes -->
    <section class="relative isolate overflow-hidden bg-muted py-16 sm:py-20">
      <UContainer class="space-y-10">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p v-revelar class="rotulo">
              Trámites frecuentes
            </p>
            <h2 v-revelar="60" class="mt-2 font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
              ¿Qué desea hacer?
            </h2>
          </div>
          <UButton v-revelar="120" to="/contacto" label="¿Otra consulta? Escríbanos" trailing-icon="i-lucide-message-circle" color="neutral" variant="ghost" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="(t, n) in tramites"
            :key="t.to"
            v-revelar="n * 110"
            :to="t.to"
            class="tramite group relative isolate flex flex-col sm:min-h-52 overflow-hidden rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default"
            :style="{ '--retraso-pulso': `${n * 0.6}s` }"
          >
            <!-- Relleno de color que sube al pasar el cursor -->
            <span class="tramite-relleno absolute inset-0 -z-10 bg-gradient-to-br from-marca-700 via-marca-600 to-acento-500" aria-hidden="true" />
            <span class="pointer-events-none absolute right-5 top-4 font-display text-5xl font-bold leading-none tabular-nums text-marca-100 transition-colors duration-500 group-hover:text-white/20 sm:right-6 sm:top-5 sm:text-6xl dark:text-marca-900" aria-hidden="true">{{ String(n + 1).padStart(2, '0') }}</span>
            <span class="tramite-icono relative flex size-12 items-center justify-center rounded-xl bg-marca-100 text-marca-700 transition-colors duration-500 group-hover:bg-white/15 group-hover:text-white dark:bg-marca-900 dark:text-marca-200">
              <UIcon :name="t.icono" class="icono-salto size-6" />
            </span>
            <span class="relative flex flex-1 flex-col pt-5 sm:pt-8">
              <span class="block font-display text-lg font-semibold leading-tight text-highlighted transition-colors duration-500 group-hover:text-white">
                {{ t.titulo }}
              </span>
              <span class="mt-1.5 block text-sm leading-snug text-muted transition-colors duration-500 group-hover:text-white/80">{{ t.texto }}</span>
              <span class="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary transition-colors duration-500 group-hover:text-white">
                {{ t.accion }}
                <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </span>
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- Noticias y eventos -->
    <section class="py-16 sm:py-20">
      <UContainer class="grid gap-12 lg:grid-cols-[1.55fr_1fr]">
        <!-- Noticias -->
        <div class="min-w-0 space-y-6">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="rotulo">
                Noticias y eventos
              </p>
              <h2 class="mt-2 font-display text-3xl font-bold tracking-tight text-highlighted">
                Lo más reciente
              </h2>
            </div>
            <UButton to="/noticias" label="Todas" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
          </div>

          <template v-if="inicio?.noticias.length">
            <!-- Destacada -->
            <NuxtLink :to="`/noticias/${destacada!.slug}`" class="elevar group grid overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default sm:grid-cols-[1.1fr_1fr]">
              <div class="aspect-[16/10] overflow-hidden bg-gradient-to-br from-marca-100 via-marca-50 to-acento-50 sm:aspect-auto dark:from-marca-900 dark:to-marca-950">
                <img v-if="destacada!.portadaId" :src="`/api/archivos/${destacada!.portadaId}`" alt="" class="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]">
                <div v-else class="relative flex size-full min-h-48 items-center justify-center">
                  <MarcaRed class="girar-lento absolute size-72 text-marca-300/40" />
                  <img src="/img/marca/escudo-160.png" alt="" class="relative h-20 w-auto transition-transform duration-500 group-hover:scale-110">
                </div>
              </div>
              <div class="flex flex-col p-6">
                <p class="text-xs font-semibold uppercase tracking-wide text-acento-600">
                  {{ NOMBRE_NOTICIA[destacada!.tipo] }} · {{ formatoFecha(destacada!.publicadaEn) }}
                </p>
                <p class="mt-2 font-display text-2xl font-bold leading-snug text-highlighted group-hover:text-primary">
                  {{ destacada!.titulo }}
                </p>
                <p v-if="destacada!.resumen" class="mt-3 line-clamp-4 text-[15px] leading-relaxed text-muted">
                  {{ destacada!.resumen }}
                </p>
                <span class="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-primary">Leer nota <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </NuxtLink>
            <!-- Resto, en lista -->
            <ul class="divide-y divide-default border-y border-default">
              <li v-for="n in inicio.noticias.slice(1)" :key="n.slug">
                <NuxtLink :to="`/noticias/${n.slug}`" class="group flex items-center gap-4 py-4">
                  <!-- Miniatura: la portada de la noticia o, si no tiene, el escudo -->
                  <span class="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-marca-100 via-marca-50 to-acento-50 ring-1 ring-default sm:w-28 dark:from-marca-900 dark:to-marca-950">
                    <img v-if="n.portadaId" :src="`/api/archivos/${n.portadaId}`" alt="" loading="lazy" class="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105">
                    <img v-else src="/img/marca/escudo-160.png" alt="" loading="lazy" class="absolute inset-0 m-auto h-3/5 w-auto opacity-80">
                  </span>
                  <span class="min-w-0">
                    <span class="block text-xs font-semibold uppercase tracking-wide text-dimmed">{{ formatoFecha(n.publicadaEn) }}</span>
                    <span class="mt-0.5 line-clamp-2 block font-semibold leading-snug text-highlighted group-hover:text-primary">{{ n.titulo }}</span>
                    <span v-if="n.resumen" class="mt-1 line-clamp-1 block text-sm text-muted">{{ n.resumen }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </template>
          <div v-else class="rounded-xl border border-dashed border-default p-8 text-center text-muted">
            Muy pronto publicaremos aquí los comunicados de la Federación.
          </div>
        </div>

        <!-- Agenda -->
        <aside class="space-y-6">
          <div class="flex items-end justify-between gap-4">
            <h2 class="font-display text-2xl font-bold tracking-tight text-highlighted">
              Próximos eventos
            </h2>
            <UButton to="/eventos" label="Calendario" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" size="sm" />
          </div>
          <ul v-if="agenda.length" class="space-y-3">
            <li v-for="a in agenda" :key="a.titulo">
              <component
                :is="a.to ? NuxtLink : 'div'"
                :to="a.to"
                :target="a.externo ? '_blank' : undefined"
                class="elevar group flex gap-4 rounded-xl p-3 ring-1"
                :class="a.destacado ? 'bg-gradient-to-br from-marca-600 to-marca-500 text-white ring-marca-500' : 'bg-default ring-default hover:bg-marca-50/60'"
              >
                <span class="w-16 shrink-0 overflow-hidden rounded-lg text-center ring-1" :class="a.destacado ? 'ring-white/20' : 'ring-default'">
                  <span class="block py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" :class="a.destacado ? 'bg-acento-500' : 'bg-marca-500'">{{ a.mes }}</span>
                  <span class="block py-1.5 font-display text-2xl font-bold leading-none" :class="a.destacado ? 'text-white' : 'text-highlighted'">{{ a.dia }}</span>
                </span>
                <span class="min-w-0 self-center">
                  <span class="block font-semibold leading-snug" :class="a.destacado ? 'text-white' : 'text-highlighted group-hover:text-primary'">{{ a.titulo }}</span>
                  <span v-if="a.lugar" class="mt-0.5 flex items-center gap-1 text-[13px]" :class="a.destacado ? 'text-white/75' : 'text-muted'">
                    <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />{{ a.lugar }}
                  </span>
                </span>
              </component>
            </li>
          </ul>
          <p v-else class="rounded-xl border border-dashed border-default p-6 text-center text-sm text-muted">
            No hay eventos programados por ahora.
          </p>
          <NuxtLink to="/constancias" class="flex items-center gap-3 rounded-xl bg-acento-50 p-4 text-sm text-acento-900 ring-1 ring-acento-200 hover:bg-acento-100 dark:bg-acento-950 dark:text-acento-100 dark:ring-acento-900">
            <UIcon name="i-lucide-award" class="size-6 shrink-0 text-acento-600" />
            <span><strong class="font-semibold">¿Asistió a un evento?</strong> Descargue su constancia con su nombre o correo.</span>
          </NuxtLink>
        </aside>
      </UContainer>
    </section>

    <!-- Colegios agremiados -->
    <section class="relative isolate overflow-hidden bg-gradient-to-br from-marca-700 via-marca-600 to-marca-500 text-white">
      <div class="aurora [--aurora-1:var(--color-marca-400)] [--aurora-2:var(--color-acento-400)] [--aurora-opacidad:0.45]" />
      <MarcaRed class="girar-lento pointer-events-none absolute -right-40 -top-40 -z-10 size-[36rem] text-white/[0.09]" />
      <UContainer class="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div v-revelar>
          <p class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-acento-300">
            Colegios agremiados
          </p>
          <h2 class="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Una red de colegios y asociaciones de la salud en todo Chiapas
          </h2>
          <p class="mt-4 max-w-lg text-white/85">
            Consulte cada colegio, su mesa directiva y sus datos de contacto, sitio web y redes sociales.
          </p>
          <form class="mt-7 flex max-w-md gap-2" @submit.prevent="navigateTo({ path: '/directorio', query: busqueda ? { q: busqueda } : {} })">
            <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar colegio o especialidad" class="flex-1" :ui="{ base: 'bg-white text-gris-900 placeholder:text-gris-500' }" />
            <UButton type="submit" label="Buscar" class="bg-acento-500 text-white shadow-lg hover:bg-acento-600" />
          </form>
        </div>
        <dl class="grid grid-cols-3 gap-3">
          <div v-for="(c, i) in cifrasColegios" :key="c.etiqueta" v-revelar.escala="i * 90" class="rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/15 sm:p-7">
            <dd class="font-display text-4xl font-bold text-white sm:text-5xl">
              <SitioContador :valor="c.valor" />
            </dd>
            <dt class="mt-2 text-xs leading-snug text-white/80 sm:text-sm">
              {{ c.etiqueta }}
            </dt>
          </div>
        </dl>
      </UContainer>
      <!-- Carrusel de logotipos de los colegios (se detiene al pasar el cursor; con movimiento
           reducido queda fijo y se desplaza a mano) -->
      <div class="carrusel-logos overflow-x-auto border-t border-white/15 bg-marca-900/25 py-6 motion-safe:overflow-hidden" aria-label="Logotipos de los colegios agremiados">
        <ul class="franja flex w-max" style="--duracion: 90s">
          <template v-for="copia in 2" :key="copia">
            <li v-for="c in LOGOS_COLEGIOS" :key="`${copia}-${c.slug}`" class="pr-5" :aria-hidden="copia === 2 ? 'true' : undefined">
              <NuxtLink
                :to="`/directorio/${c.slug}`"
                :tabindex="copia === 2 ? -1 : undefined"
                :title="c.nombre"
                class="block size-28 overflow-hidden rounded-2xl bg-white p-2 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:scale-105 sm:size-32"
              >
                <img :src="c.logo" :alt="copia === 2 ? '' : `Logotipo del ${c.nombre}`" class="size-full object-contain" loading="lazy" width="128" height="128">
              </NuxtLink>
            </li>
          </template>
        </ul>
      </div>
    </section>

    <!-- Beneficios -->
    <UContainer class="py-16 sm:py-20">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div v-revelar>
          <p class="rotulo">
            Beneficios
          </p>
          <h2 class="mt-2 font-display text-3xl font-bold tracking-tight text-highlighted">
            Lo que la Federación hace por usted
          </h2>
        </div>
        <UButton to="/admision" label="Cómo afiliarse" trailing-icon="i-lucide-arrow-right" class="rounded-full bg-acento-500 px-4 text-white shadow-[0_8px_20px_-8px_rgb(217_106_34/0.7)] hover:bg-acento-600" />
      </div>
      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(b, i) in BENEFICIOS" :key="b.titulo" v-revelar="i * 80" class="elevar group relative overflow-hidden rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
          <div class="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-marca-500 to-acento-400 transition-transform duration-500 group-hover:scale-x-100" />
          <span class="flex size-12 items-center justify-center rounded-xl bg-acento-50 text-acento-600 transition-colors duration-300 group-hover:bg-acento-500 group-hover:text-white dark:bg-acento-950">
            <UIcon :name="b.icono" class="icono-salto size-6" />
          </span>
          <h3 class="mt-4 font-display text-lg font-bold text-highlighted">
            {{ b.titulo }}
          </h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">
            {{ b.texto }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- Censo médico (sólo cifras agregadas, y sólo con datos suficientes) -->
    <section v-if="mostrarCenso" class="bg-muted py-16 sm:py-20">
      <UContainer class="space-y-10">
        <div v-revelar class="max-w-2xl space-y-3">
          <p class="rotulo">
            Censo médico estatal
          </p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ censo!.totales.registrados.toLocaleString('es-MX') }} profesionales registrados
          </h2>
          <p class="text-muted">
            En {{ censo!.totales.municipios }} municipios y {{ censo!.totales.especialidades }} especialidades. Cifras agregadas de la plataforma;
            los grupos pequeños se suman en «Otros» para proteger la privacidad.
          </p>
        </div>
        <div class="grid gap-6 lg:grid-cols-2">
          <div v-revelar.izquierda class="rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
            <GraficaBarras :barras="censo!.porRegion" titulo="Por región" />
          </div>
          <div v-revelar.derecha="80" class="rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
            <GraficaBarras :barras="censo!.porEspecialidad" titulo="Por especialidad" />
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { LOGOS_COLEGIOS } from '#shared/colegios'
import { JORNADAS_2026 } from '#shared/jornadas2026'
import { BENEFICIOS, BIENVENIDA } from '#shared/organizacion'
import type { InstitucionVinculada } from '~/components/sitio/TarjetaInstitucion.vue'
import type { DatosPortada } from '#shared/parametros'
import { NOMBRE_NOTICIA } from '#shared/schemas/portal'
import { formatoFecha } from '#shared/texto'
import type { NoticiaPublica } from '~~/server/services/noticias'
import type { EventoPublico } from '~~/server/services/eventos'

useSeoMeta({ title: 'Inicio', description: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' })
useCompartir({ titulo: 'FEACOMECH · Federación de Asociaciones y Colegios Médicos del Estado de Chiapas', descripcion: 'Por la dignificación y unión profesional. Colegios agremiados, noticias, eventos académicos y constancias.' })

const { data: institucion } = await useInstitucion()

interface Inicio {
  cifras: { colegios: number, asociaciones: number, afiliados: number }
  portada: DatosPortada
  noticias: NoticiaPublica[]
  eventos: EventoPublico[]
  vinculos: InstitucionVinculada[]
}
interface CensoPublico {
  totales: { registrados: number, afiliados: number, organizacionesAfiliadas: number, municipios: number, especialidades: number }
  porEspecialidad: { etiqueta: string, valor: number }[]
  porRegion: { etiqueta: string, valor: number }[]
}
const { data: inicio } = await useFetch<Inicio>('/api/publico/inicio')
// El censo se carga en el navegador, después de lo principal.
const { data: censo } = useFetch<CensoPublico>('/api/publico/censo', { lazy: true, server: false })

// Se resuelve aquí: llamado dentro de la plantilla, Vue no lo encuentra al renderizar en el servidor.
const NuxtLink = resolveComponent('NuxtLink')
const portada = computed(() => inicio.value?.portada)
const destacada = computed(() => inicio.value?.noticias[0])
const busqueda = ref('')

const tramites = [
  { to: '/admision#colegio', icono: 'i-lucide-landmark', titulo: 'Afiliar mi colegio', texto: 'Requisitos y pasos para incorporarse.', accion: 'Ver requisitos' },
  { to: '/admision#individual', icono: 'i-lucide-stethoscope', titulo: 'Afiliarme como profesional', texto: 'A través de un colegio agremiado.', accion: 'Cómo afiliarme' },
  { to: '/directorio', icono: 'i-lucide-search', titulo: 'Encontrar un colegio', texto: 'Directorio, mesas directivas y contacto.', accion: 'Ir al directorio' },
  { to: '/constancias', icono: 'i-lucide-award', titulo: 'Descargar mi constancia', texto: 'De las Jornadas y demás eventos.', accion: 'Buscar constancia' },
]


// Cifras de la portada (con su fuente); si no hay, las de la plataforma.
const cifras = computed(() => {
  if (portada.value?.cifras.length) return portada.value.cifras
  const c = inicio.value?.cifras
  if (!c || c.colegios + c.asociaciones === 0) return []
  return [
    { valor: String(c.colegios), etiqueta: 'Colegios afiliados', nota: '' },
    { valor: String(c.asociaciones), etiqueta: 'Asociaciones afiliadas', nota: '' },
    { valor: String(c.afiliados), etiqueta: 'Profesionales afiliados', nota: '' },
  ]
})
// En la banda de colegios siempre hay tres cifras; sin datos se usa la del cartel de las Jornadas.
const cifrasColegios = computed(() => cifras.value.length
  ? cifras.value.slice(0, 3)
  : [
      { valor: String(JORNADAS_2026.colegios.length), etiqueta: 'Colegios participantes en las Jornadas' },
      { valor: '28', etiqueta: 'Colegios agrupados en 2021' },
      { valor: '7', etiqueta: 'Ediciones de las Jornadas' },
    ])

// Agenda unificada: las Jornadas (mientras estén vigentes), fechas capturadas y eventos publicados.
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
interface ItemAgenda { clave: string, dia: string, mes: string, titulo: string, lugar?: string, to?: string, externo?: boolean, destacado?: boolean }
const agenda = computed<ItemAgenda[]>(() => {
  const hoy = new Date().toISOString().slice(0, 10)
  const items: ItemAgenda[] = []
  if (new Date() < new Date('2026-11-28T16:00:00-06:00'))
    items.push({ clave: '2026-11-26', dia: '26', mes: 'nov', titulo: 'VII Jornadas Académicas FEACOMECH y Simposio de Dermatología', lugar: 'Polyforum Chiapas', to: '/jornadas-2026', destacado: true })
  for (const a of portada.value?.agenda ?? []) {
    if ((a.fin || a.fecha) < hoy) continue
    items.push({ clave: a.fecha, dia: String(Number(a.fecha.slice(8, 10))), mes: MESES[Number(a.fecha.slice(5, 7)) - 1]!, titulo: a.titulo, lugar: a.lugar || undefined, to: a.url || undefined, externo: !!a.url })
  }
  for (const e of inicio.value?.eventos ?? []) {
    // Las Jornadas ya van arriba, destacadas y con su micrositio.
    if (e.slug === JORNADAS_2026.slug && items.some(i => i.destacado)) continue
    const d = new Date(e.inicio)
    items.push({ clave: d.toISOString().slice(0, 10), dia: String(d.getDate()), mes: MESES[d.getMonth()]!, titulo: e.titulo, lugar: e.sede ?? undefined, to: `/eventos/${e.slug}` })
  }
  // Un mismo evento puede estar capturado en la agenda de la portada y como evento publicado:
  // se deja el primero (el destacado o la fecha capturada) por día y título.
  const vistos = new Set<string>()
  const unicos = items.filter((i) => {
    const llave = `${i.clave}|${i.titulo.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().slice(0, 24)}`
    if (vistos.has(llave)) return false
    vistos.add(llave)
    return true
  })
  return unicos.sort((a, b) => a.clave.localeCompare(b.clave)).slice(0, 4)
})

// Con muy pocos registros la gráfica pública no dice nada y podría identificar personas.
const mostrarCenso = computed(() => (censo.value?.totales.registrados ?? 0) >= 20)
</script>

<style scoped>
/* «¿Qué desea hacer?»: el color sube desde abajo al pasar el cursor y la tarjeta se eleva. */
.tramite {
  transition: transform 0.4s var(--curva-salida), box-shadow 0.4s var(--curva-salida);
}
.tramite-relleno {
  transform: translateY(101%);
  transition: transform 0.55s var(--curva-salida);
}
@media (hover: hover) {
  .tramite:hover {
    transform: translateY(-6px);
    box-shadow: var(--sombra-flotante);
  }
  .tramite:hover .tramite-relleno {
    transform: translateY(0);
  }
}
.tramite:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
/* Pulso suave y alternado de los iconos: invita a tocar también en el celular. */
.tramite-icono::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 0 rgb(217 106 34 / 0.45);
  animation: fea-tramite-pulso 4s ease-out var(--retraso-pulso, 0s) infinite;
}
@keyframes fea-tramite-pulso {
  0% { box-shadow: 0 0 0 0 rgb(217 106 34 / 0.45); }
  45%, 100% { box-shadow: 0 0 0 14px rgb(217 106 34 / 0); }
}
.tramite:hover .tramite-icono::after {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  .tramite, .tramite-relleno { transition: none; }
  .tramite:hover { transform: none; }
  .tramite-icono::after { animation: none; }
}
</style>
