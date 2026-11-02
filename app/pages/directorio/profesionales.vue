<template>
  <div>
    <SitioEncabezado
      antetitulo="Directorio"
      titulo="Profesionales"
      descripcion="Médicos afiliados, con datos validados por la Federación, que autorizaron aparecer en este directorio."
    >
      <SitioNavDirectorio />
    </SitioEncabezado>

    <UContainer class="space-y-8 py-12">
      <div class="flex flex-wrap gap-3">
        <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar por nombre" class="w-full sm:max-w-xs" />
        <USelectMenu v-model="especialidad" :items="opciones" value-key="value" class="w-full sm:w-64" />
      </div>

      <EstadoVacio
        v-if="status !== 'pending' && !pagina?.datos.length"
        icono="i-lucide-stethoscope"
        :titulo="busqueda || especialidad !== TODAS ? 'Nadie coincide con la búsqueda' : 'El directorio se está integrando'"
        descripcion="Sólo aparecen profesionales que dieron su autorización desde su perfil."
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="(p, i) in pagina?.datos" :key="`${p.nombre}-${i}`" class="flex gap-4 rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <FotoPerfil :foto-id="p.fotoId" :nombre="p.nombre" tamano="xl" />
          <div class="min-w-0">
            <p class="font-medium text-highlighted">
              {{ p.nombre }}
            </p>
            <p class="text-sm text-muted">
              {{ [p.especialidad, p.subespecialidad].filter(Boolean).join(' · ') || 'Medicina' }}
            </p>
            <p v-if="p.institucion" class="text-sm text-dimmed">
              {{ p.institucion }}
            </p>
            <p v-if="p.organizaciones.length" class="mt-2 flex flex-wrap gap-1">
              <NuxtLink v-for="o in p.organizaciones" :key="o.slug" :to="`/directorio/${o.slug}`">
                <UBadge :label="o.nombre" color="primary" variant="soft" size="sm" />
              </NuxtLink>
            </p>
          </div>
        </article>
      </div>

      <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="flex justify-center">
        <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'

useSeoMeta({ title: 'Directorio de profesionales' })

const POR_PAGINA = 24
const TODAS = '__todas__'
const busqueda = ref('')
const q = refDebounced(busqueda, 350)
const especialidad = ref(TODAS)
const numeroPagina = ref(1)
watch([q, especialidad], () => (numeroPagina.value = 1))

const { data: especialidades } = await useFetch<{ id: string, nombre: string }[]>('/api/publico/especialidades', { default: () => [] })
const opciones = computed(() => [{ label: 'Todas las especialidades', value: TODAS }, ...especialidades.value.map(e => ({ label: e.nombre, value: e.id }))])

interface Profesional { nombre: string, fotoId: string | null, especialidad: string | null, subespecialidad: string | null, institucion: string | null, organizaciones: { nombre: string, slug: string }[] }
const { data: pagina, status } = await useFetch<{ total: number, datos: Profesional[] }>('/api/publico/profesionales', {
  query: computed(() => ({ q: q.value || undefined, especialidadId: especialidad.value === TODAS ? undefined : especialidad.value, pagina: numeroPagina.value, porPagina: POR_PAGINA })),
})
</script>
