<!-- La Federación: mensaje de bienvenida de la presidencia, objetivo, misión y visión, historia y
     trayectoria. (La página de Organización quedó dedicada sólo a la mesa directiva.) -->
<template>
  <div>
    <SitioEncabezado antetitulo="La Federación" :titulo="institucion?.nombre ?? 'La Federación'" :descripcion="institucion?.lema || undefined" />

    <UContainer class="grid gap-14 py-16 lg:grid-cols-[14rem_1fr]">
      <!-- Índice -->
      <nav class="hidden lg:block" aria-label="Contenido">
        <ul class="sticky top-24 space-y-2 text-sm">
          <li v-for="s in secciones" :key="s.id">
            <a :href="`#${s.id}`" class="text-muted hover:text-highlighted">{{ s.titulo }}</a>
          </li>
          <li class="pt-2">
            <NuxtLink to="/organizacion" class="text-muted hover:text-highlighted">
              Mesa directiva →
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
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { BIENVENIDA, OBJETIVO_GENERAL } from '#shared/organizacion'

useSeoMeta({ title: 'La Federación', description: 'Mensaje de bienvenida de la presidencia, objetivo, misión, visión, historia y trayectoria de la FEACOMECH.' })

const { data: institucion } = await useInstitucion()
const { data: hitos } = await useFetch('/api/publico/trayectoria')

const identidad = computed(() => [
  { t: 'Objetivo', i: 'i-lucide-flag', v: OBJETIVO_GENERAL },
  { t: 'Misión', i: 'i-lucide-target', v: institucion.value?.mision },
  { t: 'Visión', i: 'i-lucide-eye', v: institucion.value?.vision },
].filter(x => x.v))

const secciones = computed(() => [
  { id: 'bienvenida', titulo: 'Bienvenida' },
  { id: 'objetivo', titulo: 'Objetivo, misión y visión' },
  ...(institucion.value?.presentacion || institucion.value?.historia ? [{ id: 'historia', titulo: 'Historia' }] : []),
  ...(hitos.value?.length ? [{ id: 'trayectoria', titulo: 'Trayectoria' }] : []),
])
</script>
