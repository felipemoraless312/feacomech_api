<!-- Micrositio de las VII Jornadas Académicas FEACOMECH y Simposio de Dermatología 2026.
     Contenido en shared/jornadas2026.ts (documentos oficiales del Comité organizador).
     El encabezado cambia según el momento: cuenta regresiva, "en vivo" durante el evento o
     invitación a descargar la constancia al terminar. -->
<template>
  <div>
    <!-- Encabezado -->
    <section class="relative isolate overflow-hidden bg-marca-900 text-white">
      <div class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] bg-acento-500 [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)] lg:block" />
      <div class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] bg-marca-950/25 [clip-path:polygon(22%_0,30%_0,8%_100%,0_100%)] lg:block" />
      <UContainer class="grid gap-10 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <p class="font-display text-sm font-semibold uppercase tracking-[0.28em] text-acento-300">
            {{ J.edicion }} edición · {{ J.anio }}
          </p>
          <h1 class="mt-4 font-display font-bold uppercase leading-[0.95]">
            <span class="block text-4xl tracking-[0.12em] sm:text-6xl">Jornadas Académicas</span>
            <span class="block text-4xl tracking-[0.12em] text-marca-200 sm:text-6xl">FEACOMECH</span>
          </h1>
          <p class="mt-3 font-display text-2xl font-semibold uppercase italic tracking-[0.1em] text-acento-300 sm:text-3xl">
            &amp; {{ J.subtitulo }}
          </p>
          <div class="mt-7 flex flex-wrap items-stretch gap-px overflow-hidden rounded-md bg-white/15 text-sm sm:w-fit">
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
            <template v-if="fase === 'antes'">
              <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" label="Inscribirme por WhatsApp" size="xl" class="bg-acento-500 text-white hover:bg-acento-600" />
              <UButton to="#programa" icon="i-lucide-calendar-range" label="Ver programa" size="xl" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
            </template>
            <template v-else-if="fase === 'durante'">
              <UButton to="#programa" icon="i-lucide-calendar-range" label="Programa de hoy" size="xl" class="bg-acento-500 text-white hover:bg-acento-600" />
              <UButton to="/jornadas-2026/muro" icon="i-lucide-camera" label="Muro de fotos" size="xl" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
            </template>
            <template v-else>
              <UButton to="/jornadas-2026/constancias" icon="i-lucide-award" label="Descargar mi constancia" size="xl" class="bg-acento-500 text-white hover:bg-acento-600" />
              <UButton to="/jornadas-2026/muro" icon="i-lucide-images" label="Ver el muro de fotos" size="xl" class="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20" />
            </template>
          </div>
        </div>

        <!-- Estado del evento -->
        <aside class="rounded-lg bg-white p-6 text-marca-950 shadow-flotante sm:p-7">
          <div class="flex items-center gap-3">
            <img src="/img/marca/escudo-160.png" alt="Escudo de la Federación" class="h-12 w-auto" width="138" height="160">
            <p class="font-display text-xs font-semibold uppercase leading-snug tracking-[0.12em] text-marca-800">Federación de Asociaciones y Colegios Médicos de Chiapas</p>
          </div>
          <div class="filete-marca my-5" />

          <!-- Antes: cuenta regresiva -->
          <template v-if="fase === 'antes'">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-acento-700">Faltan para la inauguración</p>
            <div class="mt-3 grid grid-cols-4 gap-2 text-center" aria-live="polite">
              <div v-for="u in cuenta" :key="u.t" class="rounded-md bg-marca-50 py-3">
                <p class="font-display text-3xl font-bold tabular-nums text-marca-800">{{ u.v }}</p>
                <p class="text-[11px] font-medium uppercase tracking-wide text-marca-900/60">{{ u.t }}</p>
              </div>
            </div>
            <p class="mt-4 text-sm text-marca-950/70">Registro desde las 7:00 h · primera conferencia a las 8:00 h.</p>
          </template>

          <!-- Durante: en vivo -->
          <template v-else-if="fase === 'durante'">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-acento-700">Día {{ diaActual!.n }} de 3</p>
              <p class="font-display text-sm font-semibold text-marca-800">{{ diaActual!.etiqueta }}</p>
            </div>
            <div v-if="sesion.ahora" class="mt-4 border-l-4 border-acento-500 bg-marca-50 p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-marca-700">En curso · {{ sesion.ahora.inicio }}–{{ sesion.ahora.fin }} h</p>
              <p class="mt-1 font-display text-lg font-bold leading-snug">{{ sesion.ahora.titulo }}</p>
              <p v-if="sesion.ahora.ponente" class="mt-0.5 text-sm text-marca-950/70">{{ sesion.ahora.ponente }}</p>
              <div v-if="sesion.avance !== null" class="mt-3 h-1 overflow-hidden bg-marca-100">
                <div class="h-full bg-marca-600 transition-[width] duration-1000" :style="{ width: `${sesion.avance}%` }" />
              </div>
            </div>
            <div v-if="sesion.siguiente" class="mt-4 flex items-start gap-3">
              <span class="rounded-md bg-marca-800 px-2 py-1 font-display text-sm font-bold tabular-nums text-white">{{ sesion.siguiente.inicio }}</span>
              <div class="min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-dimmed">A continuación</p>
                <p class="text-sm font-semibold leading-snug">{{ sesion.siguiente.titulo }}</p>
              </div>
            </div>
            <p v-if="!sesion.ahora && !sesion.siguiente" class="mt-4 border-l-4 border-marca-300 bg-marca-50 p-4 text-sm">
              Concluyeron las actividades de hoy.<template v-if="diaActual!.n < 3"> Mañana iniciamos a las 8:00 h.</template>
            </p>
          </template>

          <!-- Después -->
          <template v-else>
            <p class="font-display text-xl font-bold">Las Jornadas 2026 concluyeron</p>
            <p class="mt-2 text-sm text-marca-950/70">Gracias por acompañarnos. Ya puede descargar su constancia con el correo con el que se inscribió.</p>
          </template>
        </aside>
      </UContainer>
    </section>

    <!-- Accesos rápidos: qué se puede hacer aquí -->
    <section class="border-b border-default bg-default">
      <UContainer>
        <div class="grid grid-cols-2 gap-px bg-[var(--ui-border)] lg:grid-cols-4">
          <component
            :is="a.externo ? 'a' : NuxtLink"
            v-for="a in accesos"
            :key="a.t"
            v-bind="a.externo ? { href: a.to } : { to: a.to }"
            class="group flex gap-4 bg-default px-3 py-6 transition-colors hover:bg-marca-50/60 sm:px-6 dark:hover:bg-white/5"
          >
            <UIcon :name="a.icono" class="mt-0.5 size-6 shrink-0 text-marca-600 dark:text-marca-300" />
            <span class="min-w-0">
              <span class="block font-display text-base font-bold text-highlighted sm:text-lg">{{ a.t }}</span>
              <span class="mt-0.5 block text-xs leading-snug text-muted sm:text-sm">{{ a.d }}</span>
              <span class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {{ a.accion }} <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </component>
        </div>
      </UContainer>
    </section>

    <!-- Fotos del muro -->
    <SitioMuroFotos />

    <!-- Navegación interna -->
    <nav class="sticky top-[var(--ui-header-height)] z-20 border-y border-default bg-default/95 backdrop-blur" aria-label="Secciones de las Jornadas">
      <UContainer class="flex gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none]">
        <a v-for="s in secciones" :key="s.id" :href="`#${s.id}`" class="shrink-0 rounded-md px-3 py-1.5 font-medium text-muted hover:bg-muted hover:text-highlighted">
          {{ s.t }}
        </a>
      </UContainer>
    </nav>

    <!-- Programa académico -->
    <section id="programa" class="scroll-mt-32 bg-muted/60 py-14 sm:py-20">
      <UContainer class="space-y-10">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-2xl space-y-3">
            <p class="rotulo">Temario oficial</p>
            <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Programa académico</h2>
            <p class="text-muted">{{ ponencias.length }} conferencias en tres días, coordinadas por los colegios de la Federación; el sábado, Simposio de Dermatología.</p>
          </div>
          <UButton to="/jornadas/temario.pdf" target="_blank" icon="i-lucide-file-down" label="Temario en PDF" color="neutral" variant="outline" />
        </div>
        <JornadasPrograma />
      </UContainer>
    </section>

    <!-- Ponentes invitados -->
    <section id="ponentes" class="scroll-mt-32 py-14 sm:py-20">
      <UContainer class="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <div class="space-y-3 lg:sticky lg:top-36 lg:self-start">
          <p class="rotulo">Profesorado</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Ponentes invitados</h2>
          <p class="justificado text-muted">Especialistas de referencia nacional se suman a los ponentes de los colegios de Chiapas.</p>
        </div>
        <div class="grid gap-px overflow-hidden rounded-lg bg-[var(--ui-border)] ring-1 ring-default sm:grid-cols-2">
          <article v-for="p in PONENTES_INVITADOS" :key="p.nombre" class="flex gap-4 bg-default p-5">
            <span class="flex size-12 shrink-0 items-center justify-center rounded-md bg-marca-800 font-display text-base font-bold text-white">{{ iniciales(p.nombre) }}</span>
            <div class="min-w-0">
              <p class="font-display text-lg font-bold leading-tight text-highlighted">{{ p.nombre }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ p.perfil }}</p>
              <p class="mt-3 text-sm font-medium text-marca-800 dark:text-marca-200">«{{ p.tema }}»</p>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-acento-700 dark:text-acento-300">{{ p.dia }} h</p>
            </div>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- Talleres y cena -->
    <section id="talleres" class="scroll-mt-32 bg-muted py-14 sm:py-20">
      <UContainer class="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <div class="space-y-3">
          <p class="rotulo">Además de las conferencias</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Talleres y cena de gala</h2>
          <p class="text-muted">Se adquieren por separado de la inscripción.</p>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <article v-for="t in J.talleres.lista" :key="t.titulo" class="flex flex-col rounded-lg border-t-4 border-marca-700 bg-default p-6 shadow-tarjeta">
            <UIcon :name="t.icono" class="size-7 text-marca-700 dark:text-marca-300" />
            <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-acento-700 dark:text-acento-300">Taller · {{ t.dia }}</p>
            <h3 class="mt-1 font-display text-xl font-bold text-highlighted">{{ t.titulo }}</h3>
            <p class="mt-2 text-sm text-muted">{{ t.imparte }}</p>
            <p class="mt-1 text-sm text-muted"><UIcon name="i-lucide-clock" class="mr-1 inline size-3.5 align-[-2px]" />{{ t.horario }} · {{ t.lugar }}</p>
            <p class="mt-auto pt-6 font-display text-2xl font-bold text-marca-800 dark:text-marca-200">{{ pesos(J.talleres.costo) }} <span class="text-sm font-medium text-muted">MXN</span></p>
          </article>
          <article class="flex flex-col rounded-lg border-t-4 border-acento-500 bg-marca-900 p-6 text-white shadow-tarjeta">
            <UIcon name="i-lucide-wine" class="size-7 text-acento-300" />
            <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-acento-300">Evento social</p>
            <h3 class="mt-1 font-display text-xl font-bold">{{ J.cena.titulo }}</h3>
            <p class="text-sm text-white/70">{{ J.cena.cuando }} · {{ J.cena.lugar }}</p>
            <p class="mt-2 text-sm text-white/70">{{ J.cena.detalle }}</p>
            <p class="mt-auto pt-6 font-display text-2xl font-bold">{{ pesos(J.cena.costo) }} <span class="text-sm font-medium text-white/60">MXN por persona</span></p>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- Inscripción (compacta; desaparece al terminar el evento) -->
    <section v-if="fase !== 'despues'" id="inscripcion" class="scroll-mt-32 border-y border-marca-100 bg-marca-50/70 py-12 dark:border-white/10 dark:bg-marca-950/40">
      <UContainer>
        <div class="grid gap-8 lg:grid-cols-[17rem_1fr_auto] lg:items-center">
          <div class="space-y-2">
            <p class="rotulo">Inscripción</p>
            <h2 class="font-display text-2xl font-bold text-highlighted">¿Aún no se inscribe?</h2>
            <p class="text-sm text-muted">Incluye las conferencias de los tres días y la constancia con valor curricular. Consulte disponibilidad en sede o por WhatsApp.</p>
          </div>
          <ul class="grid gap-2 sm:grid-cols-3">
            <li v-for="c in J.cuotas.categorias" :key="c.nombre" class="rounded-md bg-default px-4 py-3 ring-1 ring-default">
              <p class="font-display text-2xl font-bold tabular-nums text-marca-800 dark:text-marca-200">{{ pesos(reducidaVigente ? c.reducida : c.regular) }}</p>
              <p class="text-xs font-medium leading-snug text-muted">{{ c.nombre }}</p>
            </li>
          </ul>
          <div class="flex flex-col gap-2">
            <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" label="WhatsApp" class="justify-center bg-acento-500 text-white hover:bg-acento-600" />
            <UButton icon="i-lucide-landmark" label="Datos de pago" color="neutral" variant="outline" class="justify-center" @click="abiertoPago = true" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Sede -->
    <section id="sede" class="scroll-mt-32 py-14 sm:py-20">
      <UContainer class="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
        <div class="space-y-5">
          <p class="rotulo">Sede</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">{{ J.sede.nombre }}</h2>
          <p class="text-muted">{{ J.sede.direccion }}</p>
          <dl class="space-y-3 text-sm">
            <div class="flex gap-3"><UIcon name="i-lucide-calendar-days" class="mt-0.5 size-4 text-marca-700 dark:text-marca-300" /><span>{{ J.fechas }}</span></div>
            <div class="flex gap-3"><UIcon name="i-lucide-clock" class="mt-0.5 size-4 text-marca-700 dark:text-marca-300" /><span>Conferencias desde las 8:00 h</span></div>
            <div class="flex gap-3"><UIcon name="i-lucide-wine" class="mt-0.5 size-4 text-marca-700 dark:text-marca-300" /><span>Cena de gala: {{ J.cena.lugar }}</span></div>
          </dl>
          <UButton :to="J.sede.mapa" target="_blank" icon="i-lucide-navigation" label="Cómo llegar" size="lg" />
        </div>
        <div class="overflow-hidden rounded-lg shadow-tarjeta ring-1 ring-default">
          <iframe :src="J.sede.mapaEmbebido" title="Mapa de la sede: Polyforum Chiapas" class="aspect-[16/10] w-full" loading="lazy" referrerpolicy="no-referrer-when-downgrade" />
        </div>
      </UContainer>
    </section>

    <!-- Constancias -->
    <section id="constancias" class="scroll-mt-32 py-14 sm:py-20">
      <UContainer>
        <div class="relative isolate grid gap-8 overflow-hidden rounded-lg bg-marca-900 p-8 text-white sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[38%] bg-acento-500 [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)] lg:block" />
          <div class="space-y-4">
            <p class="rotulo !text-acento-200">{{ fase === 'despues' ? 'Ya disponibles' : 'Al terminar el evento' }}</p>
            <h2 class="font-display text-3xl font-bold tracking-tight sm:text-4xl">Descargue su constancia</h2>
            <p class="max-w-xl text-white/80">En PDF y con código QR para verificar su autenticidad. Sólo necesita el correo con el que se inscribió.</p>
            <UButton to="/jornadas-2026/constancias" icon="i-lucide-award" label="Buscar mi constancia" size="xl" class="bg-white text-marca-900 hover:bg-marca-50" />
          </div>
          <ul class="space-y-3 text-sm">
            <li v-for="t in ['Asistencia con valor curricular', 'Talleres acreditados', 'Carteles científicos', 'Reconocimiento a ponentes']" :key="t" class="flex items-center gap-3 border-b border-white/20 pb-3 font-medium last:border-0">
              <UIcon name="i-lucide-badge-check" class="size-5 shrink-0" />{{ t }}
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <!-- Preguntas frecuentes -->
    <section id="preguntas" class="scroll-mt-32 bg-muted py-14 sm:py-20">
      <UContainer class="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <div class="space-y-3">
          <p class="rotulo">¿Dudas?</p>
          <h2 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Preguntas frecuentes</h2>
          <p class="text-muted">¿Otra duda? Escríbanos por WhatsApp al {{ J.contacto.telefono }}.</p>
          <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" label="Escribir por WhatsApp" color="neutral" variant="outline" class="mt-2" />
        </div>
        <UAccordion :items="preguntas" type="multiple" :ui="{ item: 'border-b border-default', trigger: 'py-4 text-base font-semibold text-highlighted', body: 'justificado pb-5 text-[15px] leading-relaxed text-muted' }" />
      </UContainer>
    </section>

    <!-- Patrocinadores, documentos y contacto -->
    <section class="border-t border-default py-12">
      <UContainer class="space-y-10">
        <div class="text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-dimmed">Gracias a nuestros patrocinadores</p>
          <ul class="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <li v-for="p in J.patrocinadores" :key="p" class="font-display text-base font-semibold uppercase tracking-[0.08em] text-gris-500 transition-colors hover:text-marca-800 dark:hover:text-marca-200">{{ p }}</li>
          </ul>
        </div>
        <div class="flex flex-col gap-6 border-t border-default pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap gap-2">
            <UButton v-for="d in documentos" :key="d.archivo" :to="d.archivo" target="_blank" :icon="d.icono" :label="d.titulo" color="neutral" variant="ghost" />
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" :label="`WhatsApp ${J.contacto.telefono}`" class="bg-acento-500 text-white hover:bg-acento-600" />
            <UButton :to="J.contacto.facebook" target="_blank" icon="i-lucide-facebook" label="Facebook" color="neutral" variant="soft" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Datos de pago -->
    <UModal v-model:open="abiertoPago" title="Datos de pago" description="Inscripción, talleres o cena de gala.">
      <template #body>
        <ol class="space-y-4">
          <li v-for="(p, i) in pasos" :key="p.t" class="flex gap-3">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-marca-800 font-display text-sm font-bold text-white">{{ i + 1 }}</span>
            <div>
              <p class="font-semibold text-highlighted">{{ p.t }}</p>
              <p class="text-sm text-muted">{{ p.d }}</p>
            </div>
          </li>
        </ol>
        <div class="mt-5 overflow-hidden rounded-md ring-1 ring-default">
          <div class="flex items-center justify-between border-b border-default px-4 py-3">
            <p class="text-sm font-medium text-highlighted">{{ J.pago.titular }}</p>
            <span class="rounded-sm bg-marca-800 px-2 py-1 text-xs font-bold tracking-wider text-white">{{ J.pago.banco }}</span>
          </div>
          <div v-for="d in datosBancarios" :key="d.t" class="flex items-center justify-between gap-4 border-b border-default px-4 py-3 last:border-0">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">{{ d.t }}</p>
              <p class="mt-0.5 font-mono text-lg tracking-wider text-highlighted">{{ d.v }}</p>
            </div>
            <UButton icon="i-lucide-copy" label="Copiar" color="neutral" variant="soft" size="sm" @click="copiar(d.v, d.t)" />
          </div>
        </div>
        <p class="mt-4 text-sm text-muted"><strong class="text-highlighted">Venta física:</strong> {{ J.pago.ventaFisica.lugar }} — {{ J.pago.ventaFisica.direccion }}</p>
        <p class="mt-2 text-sm text-muted">{{ J.pago.factura }}</p>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 as J, pesos } from '#shared/jornadas2026'
import { PONENTES_INVITADOS, PROGRAMA_2026, ponenciasDe, type Actividad } from '#shared/jornadas2026-programa'
import { DIAS_JORNADAS } from '#shared/registro-jornadas'

const NuxtLink = resolveComponent('NuxtLink')

const titulo = `${J.titulo} y ${J.subtitulo} ${J.anio}`
const descripcion = `${J.edicion} Jornadas Académicas FEACOMECH y Simposio de Dermatología: ${J.fechas} en el ${J.sede.nombre}. Programa, ponentes, talleres, sede, muro de fotos y constancias.`
useSeoMeta({
  title: titulo,
  description: descripcion,
})
useCompartir({ titulo, descripcion })
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
      'organizer': { '@type': 'Organization', 'name': J.pago.titular, 'url': 'https://feacomech.com' },
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

// Fecha y minuto del día en Tuxtla (Ciudad de México)
const partesMexico = computed(() => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(ahora.value)).map(x => [x.type, x.value]))
  return { fecha: `${p.year}-${p.month}-${p.day}`, minuto: Number(p.hour) * 60 + Number(p.minute) }
})
const fase = computed<'antes' | 'durante' | 'despues'>(() => {
  if (ahora.value > ms(J.fin)) return 'despues'
  return DIAS_JORNADAS.some(d => d.fecha === partesMexico.value.fecha) ? 'durante' : 'antes'
})
const diaActual = computed(() => {
  const i = DIAS_JORNADAS.findIndex(d => d.fecha === partesMexico.value.fecha)
  return i < 0 ? null : { n: i + 1, etiqueta: DIAS_JORNADAS[i]!.etiqueta }
})

// Sesión en curso y la siguiente, del temario oficial
const aMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h! * 60 + m!
}
const sesion = computed(() => {
  const vacio = { ahora: null as Actividad | null, siguiente: null as Actividad | null, avance: null as number | null }
  const dia = PROGRAMA_2026.find(d => d.fecha === partesMexico.value.fecha)
  if (!dia) return vacio
  const m = partesMexico.value.minuto
  const actual = dia.actividades.find(a => a.fin && aMin(a.inicio) <= m && m < aMin(a.fin)) ?? null
  const siguiente = dia.actividades.find(a => aMin(a.inicio) > m) ?? null
  const avance = actual?.fin ? Math.round(((m - aMin(actual.inicio)) / (aMin(actual.fin) - aMin(actual.inicio))) * 100) : null
  return { ahora: actual, siguiente, avance }
})

const cuenta = computed(() => {
  const s = Math.max(0, Math.floor((ms(J.inicio) - ahora.value) / 1000))
  return [
    { v: Math.floor(s / 86400), t: 'días' },
    { v: Math.floor((s % 86400) / 3600), t: 'horas' },
    { v: Math.floor((s % 3600) / 60), t: 'min' },
    { v: s % 60, t: 'seg' },
  ]
})

const accesos = computed(() => [
  { t: 'Programa académico', d: 'Horarios y conferencias de los tres días.', accion: fase.value === 'durante' ? 'Ver hoy' : 'Consultar', icono: 'i-lucide-calendar-range', to: '#programa', externo: true },
  { t: 'Muro de fotos', d: 'Fotografías y comentarios de los asistentes.', accion: 'Ver y publicar', icono: 'i-lucide-images', to: '/jornadas-2026/muro' },
  { t: 'Cómo llegar', d: 'Polyforum Chiapas, Tuxtla Gutiérrez.', accion: 'Ver mapa', icono: 'i-lucide-map-pin', to: '#sede', externo: true },
  { t: 'Constancias', d: fase.value === 'despues' ? 'Descárgala con tu correo de inscripción.' : 'Disponibles al terminar el evento.', accion: 'Buscar', icono: 'i-lucide-award', to: '/jornadas-2026/constancias' },
])

const secciones = computed(() => [
  { id: 'programa', t: 'Programa' },
  { id: 'ponentes', t: 'Ponentes' },
  { id: 'talleres', t: 'Talleres y cena' },
  ...(fase.value !== 'despues' ? [{ id: 'inscripcion', t: 'Inscripción' }] : []),
  { id: 'sede', t: 'Sede' },
  { id: 'constancias', t: 'Constancias' },
  { id: 'preguntas', t: 'Preguntas' },
])

const documentos = J.documentos.filter(d => !d.archivo.includes('carteles'))

const pasos = [
  { t: 'Elija qué va a pagar', d: 'Inscripción (médico colegiado, no colegiado o estudiante/área afín), talleres o cena de gala.' },
  { t: 'Realice su pago', d: 'Por depósito o transferencia a la cuenta BBVA de la Federación, o en venta física.' },
  { t: 'Envíe su comprobante', d: `Por WhatsApp al ${J.contacto.telefono} con su nombre completo como aparece en su INE.` },
]

const datosBancarios = [
  { t: 'Cuenta', v: J.pago.cuenta },
  { t: 'CLABE interbancaria', v: J.pago.clabe },
]
const abiertoPago = ref(false)

const ponencias = PROGRAMA_2026.flatMap(ponenciasDe)
const iniciales = (n: string) => n.replace(/^(Dra?\.|Lic\.|Mtra?\.)\s*/, '').split(/\s+/).slice(0, 2).map(p => p[0]).join('')

const preguntas = [
  { label: '¿A qué hora debo llegar?', content: 'El jueves 26 el registro abre a las 7:00 h, la primera conferencia inicia a las 8:00 h y la inauguración es a las 9:50 h. El viernes y el sábado el programa comienza a las 8:00 h.' },
  { label: '¿Cómo registro mi asistencia?', content: 'En la entrada del Polyforum hay un código QR: escanéelo con su teléfono cada día al llegar para marcar su ingreso. Si tiene dudas, acuda al módulo de registro.' },
  { label: '¿Qué incluye mi inscripción?', content: 'Acceso a las conferencias de los tres días, incluido el Simposio de Dermatología del sábado, y constancia con valor curricular. Los talleres ($400 c/u) y la Cena de Gala ($1,000 por persona) se pagan por separado.' },
  { label: '¿Dónde y cuándo son los talleres?', content: 'En el Salón Misolha de la sede, de 16:00 a 18:00 h: Electrocardiografía para Médicos Generales el jueves 26 y Accesos Vasculares el viernes 27.' },
  { label: '¿Cómo descargo mi constancia?', content: 'Al concluir las Jornadas, entre a «Constancias» y escriba el correo con el que se inscribió. Podrá descargar en PDF su constancia de asistencia, talleres o cartel, con código QR de verificación.' },
  { label: '¿Puedo compartir mis fotos del evento?', content: 'Sí: en el Muro de las Jornadas puede publicar sus fotos y comentar las de sus colegas. Cada publicación se revisa antes de aparecer y las aprobadas pueden compartirse en las redes sociales de la Federación.' },
  { label: '¿Puedo facturar?', content: J.pago.factura },
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
</script>
