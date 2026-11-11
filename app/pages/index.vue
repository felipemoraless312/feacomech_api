<!-- Inicio del portal. Ordenado por lo que viene a hacer la gente: trámites primero, luego lo
     que pasa en la Federación (noticias y agenda), quién la dirige y quiénes la integran. -->
<template>
  <div>
    <SitioPortada
      :nombre="institucion?.nombre ?? 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas'"
      :siglas="institucion?.siglas ?? 'FEACOMECH'"
      :ciudad="institucion?.ciudad ?? 'Tuxtla Gutiérrez, Chiapas'"
      :lema="institucion?.lema || 'Por la dignificación y unión profesional'"
      :cifras="cifras.slice(0, 3)"
    />

    <!-- ¿Qué desea hacer? — trámites frecuentes, montados sobre la portada -->
    <UContainer class="relative z-10 -mt-10 sm:-mt-14">
      <div class="overflow-hidden rounded-xl bg-default shadow-flotante ring-1 ring-default">
        <p class="border-b border-default px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-marca-700 dark:text-marca-300">
          ¿Qué desea hacer?
        </p>
        <div class="grid divide-y divide-default sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          <NuxtLink
            v-for="t in tramites"
            :key="t.to"
            :to="t.to"
            class="group flex items-start gap-4 p-5 transition-colors hover:bg-marca-50 sm:p-6 dark:hover:bg-marca-950/60"
          >
            <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-marca-800 text-white transition-colors group-hover:bg-acento-500">
              <UIcon :name="t.icono" class="size-5" />
            </span>
            <span class="min-w-0">
              <span class="flex items-center gap-1 font-display text-[17px] font-semibold leading-tight text-highlighted">
                {{ t.titulo }}
                <UIcon name="i-lucide-arrow-right" class="size-4 -translate-x-1 text-acento-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </span>
              <span class="mt-1 block text-sm leading-snug text-muted">{{ t.texto }}</span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </UContainer>

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
            <NuxtLink :to="`/noticias/${destacada!.slug}`" class="group grid overflow-hidden rounded-xl bg-default shadow-tarjeta ring-1 ring-default transition-shadow hover:shadow-flotante sm:grid-cols-[1.1fr_1fr]">
              <div class="aspect-[16/10] overflow-hidden bg-marca-800 sm:aspect-auto">
                <img v-if="destacada!.portadaId" :src="`/api/archivos/${destacada!.portadaId}`" alt="" class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]">
                <div v-else class="relative flex size-full min-h-48 items-center justify-center">
                  <MarcaRed class="absolute size-72 text-white/10" />
                  <img src="/img/escudo-160.png" alt="" class="relative h-20 w-auto opacity-90">
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
                <span class="mt-auto pt-4 text-sm font-semibold text-primary">Leer nota →</span>
              </div>
            </NuxtLink>
            <!-- Resto, en lista -->
            <ul class="divide-y divide-default border-y border-default">
              <li v-for="n in inicio.noticias.slice(1)" :key="n.slug">
                <NuxtLink :to="`/noticias/${n.slug}`" class="group flex gap-4 py-4">
                  <span class="w-20 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-dimmed">{{ formatoFecha(n.publicadaEn) }}</span>
                  <span class="min-w-0">
                    <span class="block font-semibold leading-snug text-highlighted group-hover:text-primary">{{ n.titulo }}</span>
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
                :is="a.to ? resolveComponent('NuxtLink') : 'div'"
                :to="a.to"
                :target="a.externo ? '_blank' : undefined"
                class="group flex gap-4 rounded-xl p-3 ring-1 transition-colors"
                :class="a.destacado ? 'bg-marca-800 text-white ring-marca-800 hover:bg-marca-900' : 'bg-default ring-default hover:bg-muted'"
              >
                <span class="w-16 shrink-0 overflow-hidden rounded-lg text-center ring-1" :class="a.destacado ? 'ring-white/20' : 'ring-default'">
                  <span class="block py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" :class="a.destacado ? 'bg-acento-500' : 'bg-marca-700'">{{ a.mes }}</span>
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

    <!-- Bienvenida de la presidenta -->
    <section class="relative isolate overflow-hidden bg-marca-50 py-16 sm:py-20 dark:bg-marca-950/50">
      <MarcaRed class="pointer-events-none absolute -right-32 -top-32 -z-10 size-[32rem] text-marca-300/40 dark:text-marca-800/40" />
      <UContainer class="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        <div v-revelar class="mx-auto flex flex-col items-center text-center lg:mx-0">
          <div class="relative">
            <div class="absolute inset-0 translate-x-3 translate-y-3 rounded-full border-2 border-acento-500" aria-hidden="true" />
            <span class="relative flex size-44 items-center justify-center rounded-full bg-gradient-to-br from-marca-600 to-marca-900 font-display text-5xl font-bold tracking-wider text-white ring-8 ring-white dark:ring-marca-950" aria-hidden="true">FK</span>
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

    <!-- Colegios agremiados -->
    <section class="relative isolate overflow-hidden bg-marca-900 text-white">
      <MarcaRed class="pointer-events-none absolute -right-40 -top-40 -z-10 size-[36rem] text-white/[0.06]" />
      <UContainer class="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div v-revelar>
          <p class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-acento-300">
            Colegios agremiados
          </p>
          <h2 class="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Una red de colegios y asociaciones de la salud en todo Chiapas
          </h2>
          <p class="mt-4 max-w-lg text-white/75">
            Consulte cada colegio, su mesa directiva y sus datos de contacto, sitio web y redes sociales.
          </p>
          <form class="mt-7 flex max-w-md gap-2" @submit.prevent="navigateTo({ path: '/directorio', query: busqueda ? { q: busqueda } : {} })">
            <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar colegio o especialidad" class="flex-1" :ui="{ base: 'bg-white text-gris-900 placeholder:text-gris-500' }" />
            <UButton type="submit" label="Buscar" class="bg-acento-500 text-white hover:bg-acento-600" />
          </form>
        </div>
        <dl class="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
          <div v-for="c in cifrasColegios" :key="c.etiqueta" v-revelar class="bg-marca-900 p-5 text-center sm:p-7">
            <dd class="font-display text-4xl font-bold text-white sm:text-5xl">
              <SitioContador :valor="c.valor" />
            </dd>
            <dt class="mt-2 text-xs leading-snug text-white/65 sm:text-sm">
              {{ c.etiqueta }}
            </dt>
          </div>
        </dl>
      </UContainer>
      <!-- Cinta de colegios -->
      <div class="overflow-hidden border-t border-white/10 bg-marca-950/60 py-3.5">
        <div class="franja flex w-max gap-10" style="--duracion: 240s">
          <template v-for="copia in 2" :key="copia">
            <span v-for="c in JORNADAS_2026.colegios" :key="`${copia}-${c}`" class="flex items-center gap-10 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.12em] text-white/80" :aria-hidden="copia === 2">
              {{ c }}<span class="size-1.5 rotate-45 bg-acento-400" />
            </span>
          </template>
        </div>
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
        <UButton to="/admision" label="Cómo afiliarse" trailing-icon="i-lucide-arrow-right" class="bg-acento-500 text-white hover:bg-acento-600" />
      </div>
      <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(b, i) in BENEFICIOS" :key="b.titulo" v-revelar="i * 70" class="border-t-2 border-marca-800 pt-5 dark:border-marca-400">
          <UIcon :name="b.icono" class="size-7 text-acento-500" />
          <h3 class="mt-3 font-display text-lg font-bold text-highlighted">
            {{ b.titulo }}
          </h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">
            {{ b.texto }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- Historial de actividades -->
    <section v-if="actividades.length" class="bg-muted/70 py-16 sm:py-20">
      <UContainer class="space-y-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div v-revelar>
            <p class="rotulo">
              Historial
            </p>
            <h2 class="mt-2 font-display text-3xl font-bold tracking-tight text-highlighted">
              Actividades realizadas
            </h2>
          </div>
          <UButton to="/noticias?tipo=ACTIVIDAD" label="Ver historial" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SitioTarjetaNoticia v-for="n in actividades" :key="n.slug" v-revelar :noticia="n" />
        </div>
      </UContainer>
    </section>

    <!-- Trayectoria -->
    <UContainer v-if="portada?.hitos.length" class="space-y-14 py-16 sm:py-20">
      <div v-revelar class="mx-auto max-w-2xl space-y-3 text-center">
        <p class="rotulo">
          Desde {{ portada.hitos[0]!.anio }}
        </p>
        <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
          Nuestra trayectoria
        </h2>
      </div>
      <SitioTrayectoria :hitos="portada.hitos" />
      <div class="text-center">
        <UButton to="/expresidentes" label="Conozca a nuestros expresidentes" trailing-icon="i-lucide-arrow-right" color="neutral" variant="outline" />
      </div>
    </UContainer>

    <!-- Censo médico (sólo cifras agregadas, y sólo con datos suficientes) -->
    <section v-if="mostrarCenso" class="bg-muted/70 py-16 sm:py-20">
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
          <div v-revelar class="rounded-xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
            <GraficaBarras :barras="censo!.porRegion" titulo="Por región" />
          </div>
          <div v-revelar="80" class="rounded-xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
            <GraficaBarras :barras="censo!.porEspecialidad" titulo="Por especialidad" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Colaboradores -->
    <UContainer v-if="inicio?.vinculos.length" class="space-y-8 py-16">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2 v-revelar class="font-display text-2xl font-bold tracking-tight text-highlighted">
          Colaboradores
        </h2>
        <UButton to="/vinculacion" label="Todos los colaboradores" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <component
          :is="v.sitioWeb ? 'a' : 'div'"
          v-for="v in inicio.vinculos"
          :key="v.nombre"
          v-revelar
          :href="v.sitioWeb ?? undefined"
          :target="v.sitioWeb ? '_blank' : undefined"
          rel="noopener"
          class="flex items-center gap-3 rounded-xl bg-default px-4 py-3 ring-1 ring-default transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-tarjeta"
          :title="v.nombre"
        >
          <LogoOrganizacion :logo-id="v.logoId" :nombre="v.nombre" />
          <span class="max-w-48 text-sm font-medium text-highlighted">{{ v.nombre }}</span>
        </component>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 } from '#shared/jornadas2026'
import { BENEFICIOS, BIENVENIDA } from '#shared/organizacion'
import type { DatosPortada } from '#shared/parametros'
import { NOMBRE_NOTICIA } from '#shared/schemas/portal'
import { formatoFecha } from '#shared/texto'
import type { NoticiaPublica } from '~~/server/services/noticias'
import type { EventoPublico } from '~~/server/services/eventos'

useSeoMeta({ title: 'Inicio', description: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' })

const { data: institucion } = await useInstitucion()

interface Inicio {
  cifras: { colegios: number, asociaciones: number, afiliados: number }
  portada: DatosPortada
  noticias: NoticiaPublica[]
  eventos: EventoPublico[]
  actividades: NoticiaPublica[]
  vinculos: { nombre: string, sitioWeb: string | null, logoId: string | null }[]
}
interface CensoPublico {
  totales: { registrados: number, afiliados: number, organizacionesAfiliadas: number, municipios: number, especialidades: number }
  porEspecialidad: { etiqueta: string, valor: number }[]
  porRegion: { etiqueta: string, valor: number }[]
}
const { data: inicio } = await useFetch<Inicio>('/api/publico/inicio')
// El censo se carga en el navegador, después de lo principal.
const { data: censo } = useFetch<CensoPublico>('/api/publico/censo', { lazy: true, server: false })

const portada = computed(() => inicio.value?.portada)
const destacada = computed(() => inicio.value?.noticias[0])
const busqueda = ref('')

const tramites = [
  { to: '/admision#colegio', icono: 'i-lucide-landmark', titulo: 'Afiliar mi colegio', texto: 'Requisitos y pasos para incorporarse.' },
  { to: '/admision#individual', icono: 'i-lucide-stethoscope', titulo: 'Afiliarme como profesional', texto: 'A través de un colegio agremiado.' },
  { to: '/directorio', icono: 'i-lucide-search', titulo: 'Encontrar un colegio', texto: 'Directorio, mesas directivas y contacto.' },
  { to: '/constancias', icono: 'i-lucide-award', titulo: 'Descargar mi constancia', texto: 'De las Jornadas y demás eventos.' },
]

// Las actividades que ya están en «Lo más reciente» no se repiten.
const actividades = computed(() => (inicio.value?.actividades ?? []).filter(a => !inicio.value?.noticias.some(n => n.slug === a.slug)))

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
    const d = new Date(e.inicio)
    items.push({ clave: d.toISOString().slice(0, 10), dia: String(d.getDate()), mes: MESES[d.getMonth()]!, titulo: e.titulo, lugar: e.sede ?? undefined, to: `/eventos/${e.slug}` })
  }
  return items.sort((a, b) => a.clave.localeCompare(b.clave)).slice(0, 4)
})

// Con muy pocos registros la gráfica pública no dice nada y podría identificar personas.
const mostrarCenso = computed(() => (censo.value?.totales.registrados ?? 0) >= 20)
</script>
