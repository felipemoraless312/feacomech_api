<!-- Directorio público de colegios y asociaciones afiliados: cifras de la red, muro de
     logotipos con su presidencia y búsqueda. Los logotipos estáticos están en shared/colegios.ts. -->
<template>
  <div>
    <SitioEncabezado antetitulo="Directorio" titulo="Colegios agremiados" descripcion="Colegios y asociaciones de la salud de Chiapas que forman parte de la Federación. Consulte su mesa directiva, sitio web y redes sociales.">
      <SitioNavDirectorio />
    </SitioEncabezado>

    <!-- La red en cifras -->
    <section v-if="organizaciones?.length" class="relative isolate overflow-hidden bg-gradient-to-br from-marca-800 via-marca-700 to-marca-600 text-white">
      <MarcaRed class="girar-lento pointer-events-none absolute -right-32 -top-32 -z-10 size-[30rem] text-white/[0.08]" />
      <UContainer class="grid gap-8 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div v-revelar>
          <p class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-acento-300">
            Una red en todo Chiapas
          </p>
          <p class="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <SitioContador :valor="String(organizaciones.length)" /> colegios y asociaciones de la salud, unidos en una sola Federación
          </p>
          <p class="mt-3 max-w-xl text-white/80">
            Medicina, odontología, química, psicología y trabajo social: especialistas de todas las disciplinas que trabajan juntos por la salud de Chiapas.
          </p>
        </div>
        <dl class="grid grid-cols-3 gap-3">
          <div v-for="(c, i) in cifras" :key="c.etiqueta" v-revelar.escala="i * 90" class="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/20 backdrop-blur-md sm:p-6">
            <dd class="font-display text-3xl font-bold sm:text-5xl">
              <SitioContador :valor="String(c.valor)" />
            </dd>
            <dt class="mt-1 text-xs leading-snug text-white/80 sm:text-sm">
              {{ c.etiqueta }}
            </dt>
          </div>
        </dl>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div v-if="organizaciones?.length" class="mb-8 flex flex-wrap items-center gap-3">
        <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar colegio, siglas o presidente" class="w-full sm:max-w-md" />
        <UTabs v-model="tipo" :items="pestanas" :content="false" size="sm" />
        <p class="text-sm text-muted sm:ml-auto" aria-live="polite">
          {{ filtradas.length }} de {{ organizaciones.length }}
        </p>
      </div>

      <EstadoVacio
        v-if="!filtradas.length"
        icono="i-lucide-landmark"
        :titulo="organizaciones?.length ? 'Ninguna organización coincide con la búsqueda' : 'El directorio se publicará próximamente'"
        :descripcion="organizaciones?.length ? undefined : 'La Federación está registrando a sus organizaciones afiliadas.'"
      />

      <ul v-else class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        <li v-for="(o, i) in filtradas" :key="o.slug" v-revelar="(i % 4) * 60">
          <NuxtLink
            :to="`/directorio/${o.slug}`"
            class="group flex h-full flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-flotante hover:ring-marca-200 dark:hover:ring-marca-800"
          >
            <!-- Logotipo protagonista -->
            <div class="relative flex aspect-[4/3] items-center justify-center bg-white p-4 sm:p-6">
              <span class="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-marca-600 to-acento-500 transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
              <img
                v-if="logoDe(o)"
                :src="logoDe(o)"
                :alt="`Logotipo del ${o.nombre}`"
                class="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <span v-else class="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-marca-50 to-acento-50 ring-1 ring-marca-100 sm:size-24" aria-hidden="true">
                <UIcon name="i-lucide-stethoscope" class="size-9 text-marca-600 sm:size-10" />
              </span>
            </div>
            <div class="flex flex-1 flex-col border-t border-default p-3 sm:p-5">
              <p class="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-dimmed">
                <span>{{ NOMBRE_TIPO[o.tipo] }}</span>
                <span v-if="o.siglas" class="rounded-full bg-marca-50 px-2 py-0.5 text-marca-700 dark:bg-marca-950 dark:text-marca-200">{{ o.siglas }}</span>
              </p>
              <p class="mt-1.5 line-clamp-3 font-display text-sm font-semibold leading-snug text-highlighted group-hover:text-primary sm:text-base">
                {{ o.nombre }}
              </p>
              <p v-if="o.presidencia" class="mt-auto flex items-start gap-1.5 pt-3 text-xs text-muted sm:text-sm">
                <UIcon name="i-lucide-user-round" class="mt-0.5 size-3.5 shrink-0 text-acento-600" />
                <span><span class="sr-only">Presidencia: </span>{{ o.presidencia }}</span>
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <div v-if="organizaciones?.length" class="mt-14 flex flex-col items-center gap-3 rounded-2xl bg-muted p-8 text-center">
        <p class="font-display text-xl font-semibold text-highlighted">
          ¿Su colegio aún no forma parte de la Federación?
        </p>
        <p class="max-w-lg text-muted">
          Conozca los requisitos para incorporarlo y sumarse a esta red.
        </p>
        <UButton to="/admision#colegio" label="Afiliar mi colegio" trailing-icon="i-lucide-arrow-right" />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { logoColegio } from '#shared/colegios'
import { NOMBRE_TIPO } from '#shared/schemas/organizacion'
import { normalizarNombre } from '#shared/texto'

useSeoMeta({ title: 'Directorio de colegios y asociaciones', description: 'Colegios y asociaciones médicas de Chiapas afiliados a la Federación.' })

interface OrgPublica {
  slug: string, tipo: 'COLEGIO' | 'ASOCIACION', nombre: string, siglas: string | null, municipio: string | null
  logoId: string | null, descripcion: string | null, presidencia: string | null
}
const { data: organizaciones } = await useFetch<OrgPublica[]>('/api/publico/organizaciones', { default: () => [] })

const logoDe = (o: OrgPublica) => (o.logoId ? `/api/archivos/${o.logoId}` : logoColegio(o.slug))

const cifras = computed(() => {
  const l = organizaciones.value ?? []
  return [
    { valor: l.filter(o => o.tipo === 'COLEGIO').length, etiqueta: 'Colegios' },
    { valor: l.filter(o => o.tipo === 'ASOCIACION').length, etiqueta: l.filter(o => o.tipo === 'ASOCIACION').length === 1 ? 'Asociación' : 'Asociaciones' },
    { valor: l.filter(o => o.presidencia).length, etiqueta: 'Presidencias en funciones' },
  ]
})

const busqueda = ref(String(useRoute().query.q ?? ''))
const tipo = ref('TODAS')
const pestanas = [{ label: 'Todas', value: 'TODAS' }, { label: 'Colegios', value: 'COLEGIO' }, { label: 'Asociaciones', value: 'ASOCIACION' }]
const filtradas = computed(() => {
  const q = normalizarNombre(busqueda.value)
  return (organizaciones.value ?? []).filter(o =>
    (tipo.value === 'TODAS' || o.tipo === tipo.value)
    && (!q || normalizarNombre(`${o.nombre} ${o.siglas ?? ''} ${o.municipio ?? ''} ${o.presidencia ?? ''}`).includes(q)))
})
</script>
