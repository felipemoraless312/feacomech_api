<template>
  <PanelPagina id="censo" titulo="Censo médico" tamano="xl">
    <template #herramientas>
      <USelect v-model="segmento" :items="opcionesSegmento" value-key="value" class="w-56 shrink-0" />
      <USelectMenu v-model="especialidad" :items="opcionesEspecialidad" value-key="value" class="w-52 shrink-0" />
      <USelect v-model="region" :items="opcionesRegion" value-key="value" class="w-52 shrink-0" />
      <USelectMenu v-if="filtros.organizaciones.length > 1" v-model="organizacion" :items="opcionesOrganizacion" value-key="value" class="w-52 shrink-0" />
    </template>

    <div v-if="censo" class="space-y-6" :class="{ 'opacity-60 transition-opacity': status === 'pending' }">
      <!-- Totales -->
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          v-for="t in tarjetas"
          :key="t.segmento"
          type="button"
          class="rounded-2xl bg-default p-5 text-left shadow-tarjeta ring-2 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante"
          :class="segmento === t.segmento ? 'ring-marca-500' : 'ring-transparent'"
          @click="segmento = t.segmento"
        >
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon :name="t.icono" class="size-4" />{{ t.etiqueta }}
          </span>
          <span class="mt-2 block font-display text-3xl font-semibold tabular-nums text-highlighted">{{ nf.format(t.valor) }}</span>
        </button>
      </div>

      <p class="text-sm text-muted">
        {{ NOMBRE_SEGMENTO[censo.segmento] }} con los filtros actuales: <strong class="text-highlighted">{{ nf.format(censo.total) }}</strong>.
        {{ censo.totales.municipios }} municipios y {{ censo.totales.especialidades }} especialidades representadas;
        {{ censo.totales.organizacionesAfiliadas }} de {{ censo.totales.organizaciones }} organizaciones afiliadas.
      </p>

      <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
        <GraficaEvolucion :puntos="censo.evolucion" titulo="Evolución de registros (últimos 12 meses, acumulado)" />
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <GraficaBarras :barras="censo.porEspecialidad" titulo="Por especialidad" />
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <GraficaBarras :barras="censo.porRegion" titulo="Por región socioeconómica" />
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <GraficaBarras :barras="censo.porMunicipio" titulo="Por municipio" />
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <GraficaBarras :barras="censo.porOrganizacion" titulo="Por colegio o asociación (membresías activas)" />
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <GraficaBarras :barras="censo.porSubespecialidad" titulo="Por subespecialidad" vacio="Nadie ha registrado subespecialidad." />
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <GraficaBarras
            :barras="censo.porInstitucion"
            titulo="Por institución de trabajo"
            nota="Sólo de quienes autorizaron mostrar su institución."
            vacio="Nadie ha autorizado mostrar su institución."
          />
        </div>
      </div>

      <p class="text-xs text-muted">
        Se cuentan profesionales con cuenta activa y cédula capturada. «Afiliados» tienen al menos una membresía activa.
        La región se deriva del municipio que cada profesional indica en su perfil.
      </p>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NOMBRE_SEGMENTO, SEGMENTOS } from '#shared/schemas/censo'
import type { CensoDto } from '~~/server/services/censo'

definePageMeta({ layout: 'plataforma', permiso: 'censo.ver' })
useSeoMeta({ title: 'Censo médico' })

type Segmento = (typeof SEGMENTOS)[number]
const api = useApi()
const nf = new Intl.NumberFormat('es-MX')
const TODOS = '__todos__'

const segmento = ref<Segmento>('registrados')
const especialidad = ref(TODOS)
const region = ref(TODOS)
const organizacion = ref(TODOS)

const { data: filtros } = await useAsyncData('censo-filtros', () => api<{
  especialidades: { id: string, nombre: string }[]
  regiones: { id: string, nombre: string, numero: number }[]
  organizaciones: { id: string, nombre: string, siglas: string | null }[]
}>('/api/censo/filtros'), { default: () => ({ especialidades: [], regiones: [], organizaciones: [] }) })

const opcionesSegmento = SEGMENTOS.map(s => ({ label: NOMBRE_SEGMENTO[s], value: s }))
const opcionesEspecialidad = computed(() => [{ label: 'Todas las especialidades', value: TODOS }, ...filtros.value.especialidades.map(e => ({ label: e.nombre, value: e.id }))])
const opcionesRegion = computed(() => [{ label: 'Todas las regiones', value: TODOS }, ...filtros.value.regiones.map(r => ({ label: `${r.numero}. ${r.nombre}`, value: r.id }))])
const opcionesOrganizacion = computed(() => [{ label: 'Todas las organizaciones', value: TODOS }, ...filtros.value.organizaciones.map(o => ({ label: o.siglas || o.nombre, value: o.id }))])

const valor = (v: string) => (v === TODOS ? undefined : v)
const { data: censo, status } = await useAsyncData(
  'censo',
  () => api<CensoDto>('/api/censo', { query: { segmento: segmento.value, especialidadId: valor(especialidad.value), regionId: valor(region.value), organizacionId: valor(organizacion.value) } }),
  { watch: [segmento, especialidad, region, organizacion] },
)

const tarjetas = computed(() => {
  const t = censo.value?.totales
  return [
    { segmento: 'registrados' as const, etiqueta: 'Registrados', icono: 'i-lucide-users', valor: t?.registrados ?? 0 },
    { segmento: 'afiliados' as const, etiqueta: 'Afiliados', icono: 'i-lucide-id-card', valor: t?.afiliados ?? 0 },
    { segmento: 'validados' as const, etiqueta: 'Validados', icono: 'i-lucide-badge-check', valor: t?.validados ?? 0 },
    { segmento: 'pendientes' as const, etiqueta: 'Por validar', icono: 'i-lucide-hourglass', valor: t?.pendientes ?? 0 },
  ]
})
</script>
