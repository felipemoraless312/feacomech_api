<template>
  <div>
    <SitioEncabezado antetitulo="Organización" :titulo="institucion?.nombre ?? 'La Federación'" :descripcion="institucion?.lema || undefined" />

    <UContainer class="grid gap-14 py-16 lg:grid-cols-[14rem_1fr]">
      <!-- Índice -->
      <nav class="hidden lg:block" aria-label="Contenido">
        <ul class="sticky top-24 space-y-2 text-sm">
          <li v-for="s in secciones" :key="s.id">
            <a :href="`#${s.id}`" class="text-muted hover:text-highlighted">{{ s.titulo }}</a>
          </li>
          <li class="pt-2">
            <NuxtLink to="/expresidentes" class="text-muted hover:text-highlighted">
              Expresidentes →
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="min-w-0 space-y-20">
        <!-- Bienvenida -->
        <section id="bienvenida" v-revelar class="scroll-mt-24">
          <div class="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-marca-700 via-marca-600 to-marca-500 p-8 shadow-flotante text-white sm:p-12">
            <MarcaRed class="pointer-events-none absolute -bottom-32 -right-24 -z-10 size-96 text-white/10" />
            <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-200">
              Mensaje de bienvenida
            </p>
            <div class="mt-6 flex items-center gap-4">
              <FotoPerfil :src="BIENVENIDA.foto" nombre="Fanny Kramsky Soto" tamano="3xl" class="size-20 text-2xl ring-4 ring-white/20" />
              <div>
                <p class="font-display text-2xl font-semibold">
                  {{ BIENVENIDA.autora }}
                </p>
                <p class="text-sm text-white/75">
                  {{ BIENVENIDA.cargo }}
                </p>
              </div>
            </div>
            <div class="mt-8 space-y-4 text-[17px] leading-relaxed text-white/90">
              <p v-for="(p, i) in BIENVENIDA.parrafos" :key="i">
                {{ p }}
              </p>
            </div>
          </div>
        </section>

        <!-- Objetivo, misión y visión -->
        <section id="objetivo" v-revelar class="scroll-mt-24 space-y-6">
          <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
            Objetivo, misión y visión
          </h2>
          <div class="grid gap-4" :class="identidad.length === 3 ? 'md:grid-cols-3' : identidad.length === 2 ? 'md:grid-cols-2' : ''">
            <div v-for="b in identidad" :key="b.t" class="rounded-2xl bg-muted p-6">
              <p class="flex items-center gap-2 font-display text-xl font-semibold text-highlighted">
                <UIcon :name="b.i" class="size-5 text-marca-600 dark:text-marca-300" />{{ b.t }}
              </p>
              <p class="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted">
                {{ b.v }}
              </p>
            </div>
          </div>
          <div v-if="institucion?.objetivos" class="space-y-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-dimmed">
              Objetivos específicos
            </h3>
            <SitioTexto :texto="institucion.objetivos" />
          </div>
        </section>

        <!-- Historia -->
        <section v-if="institucion?.presentacion || institucion?.historia" id="historia" v-revelar class="scroll-mt-24 space-y-4">
          <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
            Historia y trayectoria
          </h2>
          <SitioTexto :texto="institucion?.presentacion" />
          <SitioTexto :texto="institucion?.historia" />
        </section>

        <!-- Trayectoria: hitos capturados en Configuración → Página de inicio -->
        <section v-if="hitos?.length" id="trayectoria" class="scroll-mt-24 space-y-10">
          <div v-revelar class="space-y-2">
            <p class="rotulo">
              Desde {{ hitos[0]!.anio }}
            </p>
            <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
              Nuestra trayectoria
            </h2>
          </div>
          <SitioTrayectoria :hitos="hitos" />
          <div class="text-center">
            <UButton to="/expresidentes" label="Conozca a nuestros expresidentes" trailing-icon="i-lucide-arrow-right" color="neutral" variant="outline" />
          </div>
        </section>

        <!-- Mesa directiva -->
        <section id="mesa-directiva" class="scroll-mt-24 space-y-6">
          <div v-revelar class="flex flex-wrap items-end justify-between gap-3">
            <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
              Mesa directiva
            </h2>
            <span class="text-sm text-muted">{{ MESA_DIRECTIVA.periodo }}</span>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SitioTarjetaPersona v-for="(p, i) in mesa" :key="p.nombre" v-revelar="(i % 3) * 60" v-bind="p" />
          </div>
        </section>

        <!-- Consejo consultivo -->
        <section id="consejo-consultivo" class="scroll-mt-24 space-y-6">
          <div v-revelar class="space-y-2">
            <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
              Consejo consultivo
            </h2>
            <p class="max-w-2xl text-muted">
              Integrado por los expresidentes de la Federación, que aportan su experiencia a la Mesa Directiva.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SitioTarjetaPersona v-for="(p, i) in consejo" :key="p.nombre" v-revelar="(i % 3) * 60" v-bind="p" />
          </div>
          <UButton to="/expresidentes" label="Galería de expresidentes" trailing-icon="i-lucide-arrow-right" color="neutral" variant="soft" />
        </section>

        <!-- Presidencias de los colegios afiliados -->
        <section id="presidentes-colegios" class="scroll-mt-24 space-y-6">
          <div v-revelar class="space-y-2">
            <h2 class="font-display text-3xl font-semibold tracking-tight text-highlighted">
              Presidentes de colegios
            </h2>
            <p class="max-w-2xl text-muted">
              Quienes presiden los colegios y asociaciones afiliados a la Federación.
              <NuxtLink to="/directorio" class="text-primary hover:underline">Ver el directorio de colegios</NuxtLink>.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SitioTarjetaPersona v-for="(p, i) in presidentesConResena" :key="p.nombre" v-revelar="(i % 3) * 60" v-bind="p" />
          </div>
          <ul class="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <li v-for="p in presidentesSinResena" :key="p.nombre" class="flex justify-between gap-3 border-b border-default pb-2">
              <span class="font-medium text-highlighted">{{ p.nombre }}</span>
              <NuxtLink v-if="p.colegio" :to="`/directorio/${p.colegio.slug}`" class="text-right text-muted hover:text-primary hover:underline">{{ p.colegio.nombre }}</NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { BIENVENIDA, MESA_DIRECTIVA, OBJETIVO_GENERAL, PERSONAS } from '#shared/organizacion'

useSeoMeta({ title: 'Organización', description: 'Bienvenida de la presidencia, objetivo, misión, visión, historia y trayectoria, mesa directiva, consejo consultivo y presidentes de colegios de la FEACOMECH.' })

const { data: institucion } = await useInstitucion()
const { data: hitos } = await useFetch('/api/publico/trayectoria')

const identidad = computed(() => [
  { t: 'Objetivo', i: 'i-lucide-flag', v: OBJETIVO_GENERAL },
  { t: 'Misión', i: 'i-lucide-target', v: institucion.value?.mision },
  { t: 'Visión', i: 'i-lucide-eye', v: institucion.value?.vision },
].filter(x => x.v))

// Cada integrante con su página propia (los consejeros toman su reseña de los expresidentes).
const mesa = PERSONAS.filter(p => p.organo === 'Mesa directiva')
const consejo = PERSONAS.filter(p => p.organo === 'Consejo consultivo')
const presidentesConResena = PERSONAS.filter(p => p.organo === 'Presidentes de colegios' && p.resena)
const presidentesSinResena = PERSONAS.filter(p => p.organo === 'Presidentes de colegios' && !p.resena)

const secciones = computed(() => [
  { id: 'bienvenida', titulo: 'Bienvenida' },
  { id: 'objetivo', titulo: 'Objetivo, misión y visión' },
  ...(institucion.value?.presentacion || institucion.value?.historia ? [{ id: 'historia', titulo: 'Historia' }] : []),
  ...(hitos.value?.length ? [{ id: 'trayectoria', titulo: 'Trayectoria' }] : []),
  { id: 'mesa-directiva', titulo: 'Mesa directiva' },
  { id: 'consejo-consultivo', titulo: 'Consejo consultivo' },
  { id: 'presidentes-colegios', titulo: 'Presidentes de colegios' },
])
</script>
