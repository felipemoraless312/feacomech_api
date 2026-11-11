<template>
  <div>
    <SitioEncabezado antetitulo="Directorio" titulo="Colegios agremiados" descripcion="Colegios y asociaciones de la salud de Chiapas que forman parte de la Federación. Consulte su mesa directiva, sitio web y redes sociales.">
      <SitioNavDirectorio />
    </SitioEncabezado>

    <UContainer class="py-12 sm:py-16">
      <div v-if="organizaciones?.length" class="mb-8 flex flex-wrap items-center gap-3">
        <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar por nombre o municipio" class="w-full sm:max-w-sm" />
        <UTabs v-model="tipo" :items="pestanas" :content="false" size="sm" />
      </div>

      <EstadoVacio
        v-if="!filtradas.length"
        icono="i-lucide-landmark"
        :titulo="organizaciones?.length ? 'Ninguna organización coincide con la búsqueda' : 'El directorio se publicará próximamente'"
        :descripcion="organizaciones?.length ? undefined : 'La Federación está registrando a sus organizaciones afiliadas.'"
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="o in filtradas"
          :key="o.slug"
          v-revelar
          :to="`/directorio/${o.slug}`"
          class="group flex flex-col rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante"
        >
          <div class="flex items-center gap-4">
            <LogoOrganizacion :logo-id="o.logoId" :nombre="o.siglas || o.nombre" tamano="lg" />
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
                {{ NOMBRE_TIPO[o.tipo] }}
              </p>
              <p v-if="o.municipio" class="text-sm text-muted">
                {{ o.municipio }}
              </p>
            </div>
          </div>
          <p class="mt-4 font-display text-lg font-semibold leading-snug text-highlighted group-hover:text-primary">
            {{ o.nombre }}
          </p>
          <p v-if="o.descripcion" class="mt-2 line-clamp-3 text-sm text-muted">
            {{ o.descripcion }}
          </p>
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { NOMBRE_TIPO } from '#shared/schemas/organizacion'
import { normalizarNombre } from '#shared/texto'

useSeoMeta({ title: 'Directorio de colegios y asociaciones', description: 'Colegios y asociaciones médicas de Chiapas afiliados a la Federación.' })

interface OrgPublica { slug: string, tipo: 'COLEGIO' | 'ASOCIACION', nombre: string, siglas: string | null, municipio: string | null, logoId: string | null, descripcion: string | null }
const { data: organizaciones } = await useFetch<OrgPublica[]>('/api/publico/organizaciones', { default: () => [] })

const busqueda = ref(String(useRoute().query.q ?? ''))
const tipo = ref('TODAS')
const pestanas = [{ label: 'Todas', value: 'TODAS' }, { label: 'Colegios', value: 'COLEGIO' }, { label: 'Asociaciones', value: 'ASOCIACION' }]
const filtradas = computed(() => {
  const q = normalizarNombre(busqueda.value)
  return (organizaciones.value ?? []).filter(o =>
    (tipo.value === 'TODAS' || o.tipo === tipo.value)
    && (!q || normalizarNombre(`${o.nombre} ${o.siglas ?? ''} ${o.municipio ?? ''}`).includes(q)))
})
</script>
