<!-- Micrositio de las VII Jornadas Académicas FEACOMECH y Simposio de Dermatología 2026.
     Contenido en shared/jornadas2026.ts (documentos oficiales del Comité organizador). -->
<template>
  <div>
    <!-- Encabezado -->
    <section class="relative isolate overflow-hidden bg-marca-900 text-white">
      <div class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] bg-acento-500 [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)] lg:block" />
      <div class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] bg-marca-950/25 [clip-path:polygon(22%_0,30%_0,8%_100%,0_100%)] lg:block" />
      <UContainer class="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <p class="font-display text-sm font-semibold uppercase tracking-[0.28em] text-acento-300">
            {{ J.edicion }} edición · {{ J.bienio }}
          </p>
          <h1 class="mt-5 font-display font-bold uppercase leading-[0.95]">
            <span class="block text-4xl tracking-[0.12em] sm:text-6xl">Jornadas</span>
            <span class="block text-4xl tracking-[0.12em] sm:text-6xl">Académicas</span>
            <span class="block text-4xl tracking-[0.12em] text-marca-200 sm:text-6xl">FEACOMECH</span>
          </h1>
          <p class="mt-4 font-display text-2xl font-semibold uppercase italic tracking-[0.1em] text-acento-300 sm:text-4xl">
            &amp; {{ J.subtitulo }}
          </p>
          <div class="mt-8 flex flex-wrap items-stretch gap-px overflow-hidden rounded-md bg-white/15 text-sm sm:w-fit">
            <div class="bg-marca-900 px-5 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Fechas</p>
              <p class="mt-0.5 font-semibold">{{ J.fechas }}</p>
            </div>
            <div class="bg-marca-900 px-5 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Sede</p>
              <p class="mt-0.5 font-semibold">Polyforum Chiapas, Tuxtla Gutiérrez</p>
            </div>
          </div>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" label="Inscribirme por WhatsApp" size="xl" class="bg-acento-500 text-white hover:bg-acento-600" />
            <UButton to="#cuotas" label="Ver cuotas" size="xl" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
            <UButton :href="ics" download="jornadas-feacomech-2026.ics" icon="i-lucide-calendar-plus" label="Agregar a mi calendario" size="xl" variant="link" class="text-white/85 hover:text-white" />
          </div>
        </div>

        <!-- Cierre de inscripciones -->
        <aside class="rounded-lg bg-white p-6 text-marca-950 shadow-flotante sm:p-8">
          <div class="flex items-center gap-4">
            <img src="/img/escudo-160.png" alt="Escudo de la Federación" class="h-16 w-auto" width="138" height="160">
            <p class="font-display text-sm font-semibold uppercase leading-snug tracking-[0.12em] text-marca-800">
              Federación de Asociaciones y Colegios Médicos de Chiapas
            </p>
          </div>
          <div class="filete-marca my-6" />
          <template v-if="inscripcionAbierta">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-acento-700">Cierre de inscripciones</p>
            <p class="mt-1 font-display text-lg font-semibold">{{ fechaLarga(J.cierreInscripciones) }}</p>
            <div class="mt-4 grid grid-cols-4 gap-2 text-center" aria-live="polite">
              <div v-for="u in cuenta" :key="u.t" class="rounded-md bg-marca-50 py-3">
                <p class="font-display text-3xl font-bold tabular-nums text-marca-800">{{ u.v }}</p>
                <p class="text-[11px] font-medium uppercase tracking-wide text-marca-900/60">{{ u.t }}</p>
              </div>
            </div>
          </template>
          <template v-else-if="!finalizado">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-acento-700">Inscripción en línea cerrada</p>
            <p class="mt-2 text-sm text-marca-950/70">Consulte disponibilidad de boletos en sede o por WhatsApp al {{ J.contacto.telefono }}.</p>
          </template>
          <p v-else class="font-display text-lg font-semibold">Las Jornadas 2026 concluyeron. ¡Gracias por participar!</p>
          <dl class="mt-6 space-y-2 text-sm">
            <div class="flex justify-between gap-4 border-b border-marca-100 pb-2">
              <dt class="text-marca-950/60">Inscripción desde</dt>
              <dd class="font-semibold">{{ pesos(minimoVigente) }} MXN</dd>
            </div>
            <div class="flex justify-between gap-4 border-b border-marca-100 pb-2">
              <dt class="text-marca-950/60">Talleres</dt>
              <dd class="font-semibold">{{ pesos(J.talleres.costo) }} c/u</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-marca-950/60">Informes</dt>
              <dd><a :href="`tel:+52${J.contacto.telefono.replaceAll(' ', '')}`" class="font-semibold text-marca-700 hover:underline">{{ J.contacto.telefono }}</a></dd>
            </div>
          </dl>
        </aside>
      </UContainer>
    </section>

    <!-- Navegación interna -->
    <nav class="sticky top-[var(--ui-header-height)] z-20 border-b border-default bg-default/95" aria-label="Secciones de las Jornadas">
      <UContainer class="flex gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none]">
        <a v-for="s in secciones" :key="s.id" :href="`#${s.id}`" class="shrink-0 rounded-md px-3 py-1.5 font-medium text-muted hover:bg-muted hover:text-highlighted">
          {{ s.t }}
        </a>
      </UContainer>
    </nav>

    <!-- Cuotas -->
    <section id="cuotas" class="scroll-mt-32 py-16 sm:py-20">
      <UContainer class="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div class="space-y-4">
          <p class="rotulo">Inscripción</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Cuotas de recuperación</h2>
          <p class="text-muted">
            La inscripción incluye el acceso a las conferencias de los tres días y la constancia con valor curricular.
            Los talleres y la cena de gala se adquieren por separado.
          </p>
          <UAlert
            v-if="!reducidaVigente"
            color="warning"
            variant="subtle"
            icon="i-lucide-clock"
            title="La cuota reducida concluyó el 15 de octubre"
            description="Aplica la cuota regular hasta el cierre de inscripciones."
          />
        </div>
        <div class="overflow-hidden rounded-lg ring-1 ring-default">
          <table class="w-full text-left text-sm">
            <thead class="bg-marca-800 text-white">
              <tr>
                <th class="px-4 py-3 font-semibold">Categoría</th>
                <th class="px-4 py-3 text-right font-semibold" :class="{ 'opacity-60': !reducidaVigente }">Reducida<span class="block text-[11px] font-normal opacity-80">hasta 15 oct</span></th>
                <th class="px-4 py-3 text-right font-semibold" :class="{ 'opacity-60': reducidaVigente }">Regular<span class="block text-[11px] font-normal opacity-80">hasta el cierre</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="c in J.cuotas.categorias" :key="c.nombre">
                <td class="px-4 py-4">
                  <p class="font-semibold text-highlighted">{{ c.nombre }}</p>
                  <p class="text-xs text-muted">{{ c.nota }}</p>
                </td>
                <td class="px-4 py-4 text-right font-display text-xl tabular-nums" :class="reducidaVigente ? 'font-bold text-marca-800 dark:text-marca-200' : 'text-dimmed line-through'">{{ pesos(c.reducida) }}</td>
                <td class="px-4 py-4 text-right font-display text-xl tabular-nums" :class="!reducidaVigente ? 'font-bold text-marca-800 dark:text-marca-200' : 'text-muted'">{{ pesos(c.regular) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UContainer>
    </section>

    <!-- Talleres y cena -->
    <section id="talleres" class="scroll-mt-32 bg-muted py-16 sm:py-20">
      <UContainer class="space-y-10">
        <div class="space-y-3">
          <p class="rotulo">Programa complementario</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Talleres y cena de gala</h2>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <article v-for="t in J.talleres.lista" :key="t.titulo" class="flex flex-col rounded-lg border-t-4 border-marca-700 bg-default p-6 shadow-tarjeta">
            <UIcon :name="t.icono" class="size-7 text-marca-700 dark:text-marca-300" />
            <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-acento-700 dark:text-acento-300">Taller · {{ t.dia }}</p>
            <h3 class="mt-1 font-display text-xl font-bold text-highlighted">{{ t.titulo }}</h3>
            <p class="mt-auto pt-6 font-display text-2xl font-bold text-marca-800 dark:text-marca-200">{{ pesos(J.talleres.costo) }} <span class="text-sm font-medium text-muted">MXN</span></p>
          </article>
          <article class="flex flex-col rounded-lg bg-marca-900 p-6 text-white shadow-tarjeta">
            <UIcon name="i-lucide-wine" class="size-7 text-acento-300" />
            <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-acento-300">Evento social</p>
            <h3 class="mt-1 font-display text-xl font-bold">{{ J.cena.titulo }}</h3>
            <p class="text-sm text-white/70">{{ J.cena.lugar }}</p>
            <p class="mt-auto pt-6 font-display text-2xl font-bold">{{ pesos(J.cena.costo) }} <span class="text-sm font-medium text-white/60">MXN por persona</span></p>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- Pago -->
    <section id="pago" class="scroll-mt-32 py-16 sm:py-20">
      <UContainer class="grid gap-12 lg:grid-cols-2">
        <div class="space-y-6">
          <div class="space-y-3">
            <p class="rotulo">Cómo inscribirse</p>
            <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Tres pasos</h2>
          </div>
          <ol class="space-y-5">
            <li v-for="(p, i) in pasos" :key="p.t" class="flex gap-4">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-marca-800 font-display text-lg font-bold text-white">{{ i + 1 }}</span>
              <div>
                <p class="font-semibold text-highlighted">{{ p.t }}</p>
                <p class="text-sm text-muted">{{ p.d }}</p>
              </div>
            </li>
          </ol>
          <div class="rounded-lg bg-muted p-5 text-sm">
            <p class="font-semibold text-highlighted">Venta física de boletos</p>
            <p class="text-muted">{{ J.pago.ventaFisica.lugar }} — {{ J.pago.ventaFisica.direccion }}</p>
            <p class="mt-3 text-muted"><UIcon name="i-lucide-file-text" class="mr-1 inline size-4 align-[-3px]" />{{ J.pago.factura }}</p>
          </div>
        </div>
        <div class="h-fit rounded-lg ring-1 ring-default">
          <div class="flex items-center justify-between border-b border-default px-6 py-4">
            <p class="font-display text-lg font-bold text-highlighted">Depósito o transferencia</p>
            <span class="rounded-sm bg-marca-800 px-2 py-1 text-xs font-bold tracking-wider text-white">{{ J.pago.banco }}</span>
          </div>
          <dl class="divide-y divide-default">
            <div class="px-6 py-4">
              <dt class="text-xs font-semibold uppercase tracking-wide text-dimmed">Titular</dt>
              <dd class="mt-1 font-medium text-highlighted">{{ J.pago.titular }}</dd>
            </div>
            <div v-for="d in datosBancarios" :key="d.t" class="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-dimmed">{{ d.t }}</dt>
                <dd class="mt-1 font-mono text-lg tracking-wider text-highlighted">{{ d.v }}</dd>
              </div>
              <UButton icon="i-lucide-copy" :label="`Copiar`" color="neutral" variant="soft" size="sm" @click="copiar(d.v, d.t)" />
            </div>
          </dl>
          <div class="border-t border-default bg-acento-50 px-6 py-4 text-sm text-acento-900 dark:bg-acento-950/40 dark:text-acento-200">
            <strong>Importante:</strong> una vez realizado el pago, envíe su comprobante por WhatsApp para confirmar su lugar.
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Carteles científicos -->
    <section id="carteles" class="scroll-mt-32 bg-marca-950 py-16 text-white sm:py-20">
      <UContainer class="space-y-10">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-2xl space-y-3">
            <p class="rotulo !text-acento-300">Convocatoria</p>
            <h2 class="font-display text-3xl font-bold tracking-tight sm:text-4xl">Presentación de carteles científicos</h2>
            <p class="text-white/70">Trabajos libres de investigación presentados en cartel durante las Jornadas.</p>
          </div>
          <div class="rounded-md px-4 py-3 text-sm ring-1" :class="cartelesAbierta ? 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/30' : 'bg-white/5 text-white/80 ring-white/20'">
            <p class="font-semibold">{{ cartelesAbierta ? 'Recepción abierta' : 'Recepción de resúmenes cerrada' }}</p>
            <p class="text-white/60">15 de septiembre al 30 de octubre de 2026</p>
          </div>
        </div>
        <div class="grid gap-px overflow-hidden rounded-lg bg-white/10 md:grid-cols-3">
          <div v-for="b in bloquesCarteles" :key="b.t" class="bg-marca-950 p-6">
            <p class="flex items-center gap-2 font-display text-lg font-bold"><UIcon :name="b.i" class="size-5 text-acento-300" />{{ b.t }}</p>
            <ul class="mt-4 space-y-2.5 text-sm text-white/75">
              <li v-for="x in b.l" :key="x" class="flex gap-2"><span class="mt-2 size-1 shrink-0 bg-acento-400" />{{ x }}</li>
            </ul>
          </div>
        </div>
        <div class="grid gap-6 text-sm text-white/75 md:grid-cols-2">
          <p><strong class="text-white">Presentación.</strong> {{ J.carteles.presentacion }}</p>
          <p><strong class="text-white">Evaluación.</strong> {{ J.carteles.evaluacion }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton to="/jornadas/convocatoria-carteles.pdf" target="_blank" icon="i-lucide-file-down" label="Convocatoria completa (PDF)" class="bg-white text-marca-950 hover:bg-marca-50" />
          <UButton :to="`mailto:${J.contacto.correoCarteles}?subject=Carteles%20científicos%20-%20Jornadas%20FEACOMECH%202026`" icon="i-lucide-mail" :label="J.contacto.correoCarteles" class="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" />
        </div>
      </UContainer>
    </section>

    <!-- Sede -->
    <section id="sede" class="scroll-mt-32 py-16 sm:py-20">
      <UContainer class="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div class="space-y-5">
          <p class="rotulo">Sede</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">{{ J.sede.nombre }}</h2>
          <p class="text-muted">{{ J.sede.direccion }}</p>
          <dl class="space-y-3 text-sm">
            <div class="flex gap-3"><UIcon name="i-lucide-calendar-days" class="mt-0.5 size-4 text-marca-700 dark:text-marca-300" /><span>{{ J.fechas }}</span></div>
            <div class="flex gap-3"><UIcon name="i-lucide-wine" class="mt-0.5 size-4 text-marca-700 dark:text-marca-300" /><span>Cena de gala: {{ J.cena.lugar }}</span></div>
          </dl>
          <UButton :to="J.sede.mapa" target="_blank" icon="i-lucide-navigation" label="Cómo llegar" />
        </div>
        <div class="overflow-hidden rounded-lg ring-1 ring-default">
          <iframe :src="J.sede.mapaEmbebido" title="Mapa de la sede: Polyforum Chiapas" class="aspect-[16/10] w-full" loading="lazy" referrerpolicy="no-referrer-when-downgrade" />
        </div>
      </UContainer>
    </section>

    <!-- Colegios participantes -->
    <section id="colegios" class="scroll-mt-32 bg-muted py-16 sm:py-20">
      <UContainer class="space-y-10">
        <div class="max-w-2xl space-y-3">
          <p class="rotulo">Comité académico</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">{{ J.colegios.length }} colegios y asociaciones participantes</h2>
          <p class="text-muted">Las Jornadas se organizan con los colegios médicos y de profesionales de la salud asociados a la Federación.</p>
        </div>
        <ul class="grid gap-px overflow-hidden rounded-lg bg-default ring-1 ring-default sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(c, i) in J.colegios" :key="c" class="flex items-start gap-3 bg-default px-5 py-4 text-sm ring-1 ring-default">
            <span class="font-display text-sm font-bold tabular-nums text-acento-600">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="font-medium text-highlighted">{{ c }}</span>
          </li>
        </ul>
        <div class="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-dimmed">Con el respaldo de</span>
          <span v-for="a in J.avales" :key="a" class="font-semibold text-highlighted">{{ a }}</span>
        </div>
      </UContainer>
    </section>

    <!-- Patrocinadores -->
    <section id="patrocinadores" class="scroll-mt-32 py-16 sm:py-20">
      <UContainer class="space-y-8">
        <div class="text-center">
          <p class="rotulo">Gracias a</p>
          <h2 class="mt-3 font-display text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">Patrocinadores</h2>
        </div>
        <ul class="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <li v-for="p in J.patrocinadores" :key="p" class="font-display text-lg font-semibold uppercase tracking-[0.08em] text-gris-500 transition-colors hover:text-marca-800 dark:hover:text-marca-200">{{ p }}</li>
        </ul>
      </UContainer>
    </section>

    <!-- Documentos y contacto -->
    <section class="border-t border-default bg-muted py-14">
      <UContainer class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div class="space-y-4">
          <h2 class="font-display text-2xl font-bold text-highlighted">Documentos oficiales</h2>
          <div class="flex flex-wrap gap-3">
            <UButton v-for="d in J.documentos" :key="d.archivo" :to="d.archivo" target="_blank" :icon="d.icono" :label="d.titulo" color="neutral" variant="outline" />
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" :label="`WhatsApp ${J.contacto.telefono}`" size="lg" class="bg-acento-500 text-white hover:bg-acento-600" />
          <UButton :to="J.contacto.facebook" target="_blank" icon="i-lucide-facebook" label="Facebook" size="lg" color="neutral" variant="soft" />
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 as J, pesos } from '#shared/jornadas2026'

const titulo = `${J.titulo} y ${J.subtitulo} ${J.anio}`
const descripcion = `${J.edicion} Jornadas Académicas FEACOMECH y Simposio de Dermatología: ${J.fechas} en el ${J.sede.nombre}. Cuotas, talleres, cena de gala y convocatoria de carteles científicos.`
useSeoMeta({
  title: titulo,
  description: descripcion,
  ogTitle: titulo,
  ogDescription: descripcion,
  ogImage: '/img/escudo-512.png',
})
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': titulo,
      'startDate': J.inicio,
      'endDate': J.fin,
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'location': { '@type': 'Place', 'name': J.sede.nombre, 'address': J.sede.direccion },
      'organizer': { '@type': 'Organization', 'name': J.pago.titular, 'url': 'https://feacomech.vercel.app' },
      'offers': J.cuotas.categorias.map(c => ({ '@type': 'Offer', 'name': c.nombre, 'price': c.regular, 'priceCurrency': 'MXN' })),
    }),
  }],
})

// "Ahora" se fija en el servidor y se actualiza cada segundo en el navegador.
const ahora = useState('jornadas-ahora', () => Date.now())
let reloj: ReturnType<typeof setInterval> | undefined
onMounted(() => { reloj = setInterval(() => (ahora.value = Date.now()), 1000) })
onBeforeUnmount(() => clearInterval(reloj))

const ms = (iso: string) => new Date(iso).getTime()
const reducidaVigente = computed(() => ahora.value <= ms(J.cuotas.limiteReducida))
const inscripcionAbierta = computed(() => ahora.value <= ms(J.cierreInscripciones))
const finalizado = computed(() => ahora.value > ms(J.fin))
const cartelesAbierta = computed(() => ahora.value <= ms(J.carteles.recepcionHasta))
const minimoVigente = computed(() => Math.min(...J.cuotas.categorias.map(c => (reducidaVigente.value ? c.reducida : c.regular))))

const cuenta = computed(() => {
  const s = Math.max(0, Math.floor((ms(J.cierreInscripciones) - ahora.value) / 1000))
  return [
    { v: Math.floor(s / 86400), t: 'días' },
    { v: Math.floor((s % 86400) / 3600), t: 'horas' },
    { v: Math.floor((s % 3600) / 60), t: 'min' },
    { v: s % 60, t: 'seg' },
  ]
})

const fechaLarga = (iso: string) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeZone: 'America/Mexico_City' }).format(new Date(iso))

const secciones = [
  { id: 'cuotas', t: 'Cuotas' },
  { id: 'talleres', t: 'Talleres y cena' },
  { id: 'pago', t: 'Cómo pagar' },
  { id: 'carteles', t: 'Carteles científicos' },
  { id: 'sede', t: 'Sede' },
  { id: 'colegios', t: 'Colegios' },
  { id: 'patrocinadores', t: 'Patrocinadores' },
]

const pasos = [
  { t: 'Elija su categoría', d: 'Médico colegiado, no colegiado o estudiante/área afín; agregue talleres o cena si lo desea.' },
  { t: 'Realice su pago', d: 'Por depósito o transferencia a la cuenta BBVA de la Federación, o compre en venta física.' },
  { t: 'Envíe su comprobante', d: `Por WhatsApp al ${J.contacto.telefono} con su nombre completo como aparece en su INE.` },
]

const datosBancarios = [
  { t: 'Cuenta', v: J.pago.cuenta },
  { t: 'CLABE interbancaria', v: J.pago.clabe },
]

const bloquesCarteles = [
  { t: 'Quiénes participan', i: 'i-lucide-users', l: J.carteles.dirigidoA },
  { t: 'Normas del resumen', i: 'i-lucide-file-text', l: J.carteles.normas },
  { t: 'Beneficios', i: 'i-lucide-award', l: J.carteles.beneficios },
]

const toast = useToast()
async function copiar(valor: string, etiqueta: string) {
  try {
    await navigator.clipboard.writeText(valor.replaceAll(' ', ''))
    toast.add({ title: `${etiqueta} copiada`, icon: 'i-lucide-check', color: 'success' })
  }
  catch {
    toast.add({ title: 'No se pudo copiar', description: valor, color: 'error' })
  }
}

// Archivo de calendario (.ics) con las tres fechas del evento.
const fechaIcs = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent([
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FEACOMECH//Jornadas 2026//ES', 'BEGIN:VEVENT',
  `UID:${J.slug}@feacomech`, `DTSTAMP:${fechaIcs('2026-11-01T00:00:00Z')}`,
  `DTSTART:${fechaIcs(J.inicio)}`, `DTEND:${fechaIcs(J.fin)}`,
  `SUMMARY:${titulo}`, `LOCATION:${J.sede.nombre}\\, ${J.sede.direccion.replaceAll(',', '\\,')}`,
  `DESCRIPTION:Informes: ${J.contacto.telefono}`, 'END:VEVENT', 'END:VCALENDAR',
].join('\r\n'))}`
</script>
