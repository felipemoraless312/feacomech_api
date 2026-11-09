<!-- Inicio del portal. Todo proviene de la base: lo que no se ha capturado no se muestra. -->
<template>
  <div>
    <!-- Presentación: texto a la izquierda, fotografía de la Federación a la derecha -->
    <section class="relative isolate overflow-hidden bg-marca-950 text-white">
      <MarcaRed class="girar-lento pointer-events-none absolute -left-56 -top-56 -z-10 size-[46rem] text-white/[0.07]" />
      <!-- Fotografía a color, a sangre por la derecha, con acercamiento lento -->
      <div class="absolute inset-y-0 right-0 -z-20 hidden w-[52%] overflow-hidden [clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] lg:block">
        <img
          src="/img/jornadas-2025-1920.webp"
          srcset="/img/jornadas-2025-1280.webp 1280w, /img/jornadas-2025-1920.webp 1920w"
          sizes="52vw"
          alt="Integrantes de la Federación en las Jornadas Médicas FEACOMECH 2025"
          class="acercamiento size-full object-cover"
          width="1920"
          height="1440"
          fetchpriority="high"
        >
        <div class="absolute inset-0 bg-gradient-to-r from-marca-950/50 via-transparent to-transparent" />
      </div>
      <!-- Filete cobre que sigue el corte diagonal -->
      <div class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[52%] bg-acento-500 [clip-path:polygon(14%_0,14.8%_0,0.8%_100%,0_100%)] lg:block" />

      <UContainer class="grid min-h-[36rem] gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div class="flex flex-col justify-center lg:pr-10">
          <div class="entrada flex items-center gap-4">
            <img src="/img/escudo-160.png" alt="Escudo de la Federación" class="h-20 w-auto drop-shadow-xl" width="138" height="160">
            <div class="border-l border-white/25 pl-4">
              <p class="font-display text-sm font-bold uppercase tracking-[0.24em] text-acento-300">{{ institucion?.siglas ?? 'FEACOMECH' }}</p>
              <p class="text-sm text-white/70">{{ institucion?.ciudad ?? 'Tuxtla Gutiérrez, Chiapas' }}</p>
            </div>
          </div>
          <h1 class="entrada mt-8 font-display text-4xl font-bold uppercase leading-[1.03] tracking-[0.03em] text-balance sm:text-5xl" style="--retraso: 80ms">
            {{ institucion?.nombre ?? 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' }}
          </h1>
          <p v-if="institucion?.lema || institucion?.presentacion" class="entrada mt-6 max-w-xl border-l-2 border-acento-500 pl-4 text-lg text-white/85" style="--retraso: 160ms">
            {{ institucion?.lema || primerParrafo(institucion?.presentacion) }}
          </p>
          <div class="entrada mt-9 flex flex-wrap gap-3" style="--retraso: 240ms">
            <UButton to="/directorio" label="Colegios y asociaciones" icon="i-lucide-landmark" size="xl" class="bg-white text-marca-900 hover:bg-marca-50" />
            <UButton to="/plataforma" label="Plataforma para afiliados" icon="i-lucide-lock" size="xl" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
          </div>
        </div>

        <!-- Fotografía en móvil -->
        <div class="overflow-hidden rounded-lg lg:hidden">
          <img src="/img/jornadas-2025-768.webp" alt="Integrantes de la Federación en las Jornadas Médicas FEACOMECH 2025" class="acercamiento aspect-[4/3] w-full object-cover" width="768" height="576">
        </div>

        <!-- Cuenta regresiva sobre la fotografía -->
        <div class="flex items-end justify-end">
          <NuxtLink v-if="jornadasVigentes" to="/jornadas-2026" class="entrada group w-full max-w-sm overflow-hidden rounded-lg bg-white/95 text-marca-950 shadow-flotante" style="--retraso: 320ms">
            <div class="flex items-center justify-between bg-acento-500 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Próximo evento <span>26 – 28 nov</span>
            </div>
            <div class="p-4">
              <p class="font-display text-lg font-bold uppercase leading-tight tracking-[0.04em]">VII Jornadas Académicas FEACOMECH</p>
              <p class="font-display text-sm font-semibold uppercase italic tracking-[0.06em] text-acento-600">&amp; Simposio de Dermatología</p>
              <div class="mt-3 grid grid-cols-4 gap-1.5 text-center">
                <div v-for="u in cuentaJornadas" :key="u.t" class="rounded-md bg-marca-50 py-2">
                  <p class="font-display text-2xl font-bold tabular-nums text-marca-800">{{ u.v }}</p>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-marca-900/60">{{ u.t }}</p>
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
      <p class="absolute bottom-3 right-4 hidden text-xs text-white/80 drop-shadow lg:block">Jornadas Médicas FEACOMECH 2025</p>
    </section>

    <!-- Cinta de colegios participantes -->
    <div class="overflow-hidden border-b border-default bg-marca-900 py-3 text-white">
      <div class="franja flex w-max gap-10">
        <template v-for="copia in 2" :key="copia">
          <span v-for="c in JORNADAS_2026.colegios" :key="`${copia}-${c}`" class="flex items-center gap-10 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.12em] text-white/85" :aria-hidden="copia === 2">
            {{ c }}<span class="size-1.5 rotate-45 bg-acento-400" />
          </span>
        </template>
      </div>
    </div>

    <!-- Franja en movimiento -->
    <div v-if="franja.length" class="overflow-hidden border-b border-default bg-marca-50 py-4 dark:bg-marca-950/60" aria-hidden="true">
      <div class="franja flex w-max gap-10">
        <template v-for="copia in 2" :key="copia">
          <span v-for="t in franja" :key="`${copia}-${t.texto}`" class="flex items-center gap-3 whitespace-nowrap font-display text-lg font-medium text-marca-800 dark:text-marca-200">
            <UIcon :name="t.icono" class="size-5 text-marca-500" />{{ t.texto }}
            <span class="ml-7 size-1.5 rounded-full bg-marca-300 dark:bg-marca-700" />
          </span>
        </template>
      </div>
    </div>

    <!-- Cifras -->
    <section v-if="cifras.length" class="border-b border-default bg-default">
      <UContainer class="grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-4">
        <div v-for="(c, i) in cifras" :key="c.etiqueta" v-revelar="i * 80" class="text-center">
          <p class="font-display text-4xl font-semibold text-marca-700 sm:text-5xl dark:text-marca-300">
            <SitioContador :valor="c.valor" />
          </p>
          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ c.etiqueta }}
          </p>
          <p v-if="c.nota" class="mt-0.5 text-xs text-muted">
            {{ c.nota }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- La Federación -->
    <UContainer v-if="institucion?.presentacion || institucion?.mision || institucion?.vision" class="grid gap-12 py-20 lg:grid-cols-[1.2fr_1fr]">
      <section v-if="institucion.presentacion" v-revelar class="space-y-4">
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
          La Federación
        </p>
        <SitioTexto :texto="institucion.presentacion" />
        <UButton to="/nosotros" label="Conozca más" trailing-icon="i-lucide-arrow-right" color="neutral" variant="link" class="px-0" />
      </section>
      <div class="space-y-4">
        <div v-for="b in misionVision" :key="b.t" v-revelar class="rounded-2xl bg-muted p-6">
          <p class="flex items-center gap-2 font-display text-xl font-semibold text-highlighted">
            <UIcon :name="b.i" class="size-5 text-marca-600 dark:text-marca-300" />{{ b.t }}
          </p>
          <p class="mt-2 text-[15px] leading-relaxed text-muted">
            {{ b.v }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- Líneas de trabajo -->
    <section v-if="portada?.lineas.length" class="relative isolate overflow-hidden bg-muted/60 py-20">
      <MarcaRed class="pointer-events-none absolute -right-40 top-10 -z-10 size-[30rem] text-marca-500/[0.07]" />
      <UContainer class="space-y-10">
        <div v-revelar class="max-w-2xl space-y-3">
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
            Lo que impulsamos
          </p>
          <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
            Líneas de trabajo
          </h2>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(l, i) in portada.lineas"
            :key="l.titulo"
            v-revelar="(i % 3) * 80"
            class="group relative overflow-hidden rounded-xl bg-default p-7 shadow-tarjeta ring-1 ring-default transition-[box-shadow,transform] duration-300 hover:shadow-flotante"
          >
            <span class="absolute right-5 top-4 font-display text-5xl font-semibold text-marca-500/10 transition-colors group-hover:text-marca-500/20">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-marca-500 to-marca-800 text-white shadow-tarjeta transition-transform duration-300 ">
              <UIcon :name="l.icono" class="size-6" />
            </span>
            <h3 class="mt-5 font-display text-xl font-semibold text-highlighted">
              {{ l.titulo }}
            </h3>
            <p v-if="l.texto" class="mt-2 text-[15px] leading-relaxed text-muted">
              {{ l.texto }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- Cita -->
    <section v-if="portada?.cita.texto" class="px-4 py-20">
      <UContainer class="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-marca-700 via-marca-800 to-marca-950 px-8 py-16 text-center text-white sm:px-16">
        <MarcaRed class="girar-lento pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 text-white/[0.07]" />
        <UIcon name="i-lucide-quote" class="mx-auto size-10 text-marca-300" aria-hidden="true" />
        <blockquote v-revelar class="mx-auto mt-6 max-w-3xl font-display text-3xl font-medium leading-snug text-balance sm:text-4xl">
          {{ portada.cita.texto }}
        </blockquote>
        <p v-if="portada.cita.autor" v-revelar="120" class="mt-8 font-semibold">
          {{ portada.cita.autor }}
        </p>
        <p v-if="portada.cita.cargo" class="text-sm text-white/70">
          {{ portada.cita.cargo }}
        </p>
      </UContainer>
    </section>

    <!-- Trayectoria -->
    <UContainer v-if="portada?.hitos.length" class="space-y-14 py-20">
      <div v-revelar class="mx-auto max-w-2xl space-y-3 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
          Desde {{ portada.hitos[0]!.anio }}
        </p>
        <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
          Nuestra trayectoria
        </h2>
      </div>
      <SitioTrayectoria :hitos="portada.hitos" />
      <div class="text-center">
        <UButton to="/nosotros" label="Historia completa" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
      </div>
    </UContainer>

    <!-- Agenda: fechas próximas y eventos -->
    <section v-if="hayAgenda || inicio?.eventos?.length" class="bg-muted/60 py-20">
      <UContainer class="space-y-10">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div v-revelar class="space-y-3">
            <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
              Próximamente
            </p>
            <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
              Agenda
            </h2>
          </div>
          <UButton to="/eventos" label="Calendario de eventos" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
        </div>
        <SitioAgenda v-if="hayAgenda" :agenda="portada!.agenda" />
        <div v-if="inicio?.eventos?.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EventosTarjeta v-for="e in inicio.eventos" :key="e.slug" v-revelar :to="`/eventos/${e.slug}`" :evento="e" />
        </div>
      </UContainer>
    </section>

    <!-- Noticias -->
    <section v-if="inicio?.noticias.length" class="py-20">
      <UContainer class="space-y-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2 v-revelar class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
            Noticias recientes
          </h2>
          <UButton to="/noticias" label="Todas las noticias" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SitioTarjetaNoticia v-for="n in inicio.noticias" :key="n.slug" v-revelar :noticia="n" />
        </div>
      </UContainer>
    </section>

    <!-- Actividades académicas -->
    <section v-if="actividades.length" class="bg-muted/60 py-20">
      <UContainer class="space-y-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2 v-revelar class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
            Actividades académicas
          </h2>
          <UButton to="/noticias?tipo=ACTIVIDAD" label="Ver todas" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SitioTarjetaNoticia v-for="n in actividades" :key="n.slug" v-revelar :noticia="n" />
        </div>
      </UContainer>
    </section>

    <!-- Censo médico (sólo cifras agregadas, y sólo con datos suficientes) -->
    <UContainer v-if="mostrarCenso" class="space-y-10 py-20">
      <div v-revelar class="max-w-2xl space-y-3">
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
          Censo médico estatal
        </p>
        <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
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

    <!-- Colegios y asociaciones + mesa directiva -->
    <section class="py-20" :class="{ 'bg-muted/60': mostrarCenso || !actividades.length }">
      <UContainer class="grid gap-10 lg:grid-cols-2">
        <div v-revelar class="flex flex-col justify-center space-y-4">
          <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
            Colegios y asociaciones
          </h2>
          <p class="text-lg text-muted">
            Consulte las organizaciones médicas afiliadas, su mesa directiva y los profesionales que autorizaron aparecer en el directorio.
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton to="/directorio" label="Directorio" icon="i-lucide-landmark" />
            <UButton to="/directorio/profesionales" label="Profesionales" icon="i-lucide-stethoscope" color="neutral" variant="soft" />
          </div>
        </div>
        <div v-if="inicio?.presidencia?.cargo.personas.length" v-revelar class="relative overflow-hidden rounded-xl bg-default p-8 shadow-tarjeta ring-1 ring-default">
          <MarcaRed class="pointer-events-none absolute -bottom-24 -right-24 size-72 text-marca-500/10" />
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
            {{ inicio.presidencia.cargo.nombre }}<template v-if="inicio.periodo">
              · {{ inicio.periodo.nombre }}
            </template>
          </p>
          <div v-for="p in inicio.presidencia.cargo.personas" :key="p.nombre" class="relative mt-5 flex items-center gap-4">
            <FotoPerfil :foto-id="p.fotoId" :nombre="p.nombre" tamano="3xl" class="size-20" />
            <div>
              <p class="font-display text-xl font-semibold text-highlighted">
                {{ p.nombre }}
              </p>
              <p v-if="p.procedencia" class="text-sm text-muted">
                {{ p.procedencia }}
              </p>
            </div>
          </div>
          <UButton to="/directorio/mesa-directiva" label="Mesa directiva completa" trailing-icon="i-lucide-arrow-right" color="neutral" variant="link" class="relative mt-6 px-0" />
        </div>
      </UContainer>
    </section>

    <!-- Vinculación -->
    <UContainer v-if="inicio?.vinculos.length" class="space-y-8 py-20">
      <h2 v-revelar class="text-center font-display text-2xl font-semibold tracking-tight text-highlighted">
        Vinculación institucional
      </h2>
      <div class="flex flex-wrap items-center justify-center gap-6">
        <component
          :is="v.sitioWeb ? 'a' : 'div'"
          v-for="v in inicio.vinculos"
          :key="v.nombre"
          v-revelar
          :href="v.sitioWeb ?? undefined"
          :target="v.sitioWeb ? '_blank' : undefined"
          rel="noopener"
          class="flex items-center gap-3 rounded-2xl bg-default px-4 py-3 ring-1 ring-default transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-tarjeta"
          :title="v.nombre"
        >
          <LogoOrganizacion :logo-id="v.logoId" :nombre="v.nombre" />
          <span class="max-w-48 text-sm font-medium text-highlighted">{{ v.nombre }}</span>
        </component>
      </div>
      <div class="text-center">
        <UButton to="/vinculacion" label="Convenios y colaboración" trailing-icon="i-lucide-arrow-right" color="neutral" variant="ghost" />
      </div>
    </UContainer>

    <!-- Comunidad privada -->
    <section class="px-4 pb-20">
      <UContainer class="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-marca-700 to-marca-950 px-8 py-14 text-white sm:px-14">
        <MarcaRed class="girar-lento pointer-events-none absolute -bottom-32 -right-24 -z-10 size-96 text-white/10" />
        <div class="destello pointer-events-none absolute inset-0 -z-10" />
        <h2 class="max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight">
          La plataforma de la comunidad médica de Chiapas
        </h2>
        <p class="mt-3 max-w-xl text-white/80">
          Para afiliados: perfil profesional, colegios y asociaciones, eventos con constancia, comunidad, documentos y censo médico.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton to="/plataforma" label="Entrar" icon="i-lucide-log-in" size="lg" class="bg-white text-marca-900 hover:bg-marca-50" />
          <UButton to="/contacto" label="¿Cómo afiliarme?" size="lg" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 } from '#shared/jornadas2026'
import type { DatosPortada } from '#shared/parametros'
import type { NoticiaPublica } from '~~/server/services/noticias'
import type { EventoPublico } from '~~/server/services/eventos'
import type { EstructuraPublicaDto } from '~~/server/services/estructura'

useSeoMeta({ title: 'Inicio', description: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' })

const { data: institucion } = await useInstitucion()

type Nodo = EstructuraPublicaDto['organos'][number]['organigrama'][number]
interface Inicio {
  cifras: { colegios: number, asociaciones: number, afiliados: number }
  portada: DatosPortada
  noticias: NoticiaPublica[]
  eventos: EventoPublico[]
  actividades: NoticiaPublica[]
  vinculos: { nombre: string, sitioWeb: string | null, logoId: string | null }[]
  periodo: { nombre: string } | null
  presidencia: Nodo | null
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

// Las actividades que ya están en "Noticias recientes" no se repiten.
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
const franja = computed(() => {
  const lineas = (portada.value?.lineas ?? []).map(l => ({ icono: l.icono, texto: l.titulo }))
  return lineas.length && institucion.value?.lema ? [{ icono: 'i-lucide-sparkles', texto: institucion.value.lema }, ...lineas] : lineas
})

const misionVision = computed(() => [
  { t: 'Misión', i: 'i-lucide-target', v: institucion.value?.mision },
  { t: 'Visión', i: 'i-lucide-eye', v: institucion.value?.vision },
].filter(x => x.v))

const hayAgenda = computed(() => {
  const hoy = new Date().toISOString().slice(0, 10)
  return (portada.value?.agenda ?? []).some(a => (a.fin || a.fecha) >= hoy)
})

// Con muy pocos registros la gráfica pública no dice nada y podría identificar personas.
const mostrarCenso = computed(() => (censo.value?.totales.registrados ?? 0) >= 20)

const jornadasVigentes = new Date() < new Date('2026-11-28T16:00:00-06:00')

// Cuenta regresiva al inicio de las Jornadas (mismo valor al hidratar; corre en el navegador).
const ahora = useState('inicio-ahora', () => Date.now())
let reloj: ReturnType<typeof setInterval> | undefined
onMounted(() => { reloj = setInterval(() => (ahora.value = Date.now()), 1000) })
onBeforeUnmount(() => clearInterval(reloj))
const cuentaJornadas = computed(() => {
  const s = Math.max(0, Math.floor((new Date(JORNADAS_2026.inicio).getTime() - ahora.value) / 1000))
  return [
    { v: Math.floor(s / 86400), t: 'días' },
    { v: String(Math.floor((s % 86400) / 3600)).padStart(2, '0'), t: 'horas' },
    { v: String(Math.floor((s % 3600) / 60)).padStart(2, '0'), t: 'min' },
    { v: String(s % 60).padStart(2, '0'), t: 'seg' },
  ]
})

const primerParrafo = (t?: string | null) => (t ?? '').split(/\n\s*\n/)[0]
</script>
