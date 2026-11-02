<template>
  <PanelPagina id="reportes" titulo="Reportes" tamano="md">
    <div class="space-y-8">
      <EncabezadoPagina titulo="Reportes">
        Descargue la información en CSV (se abre en Excel o en Hojas de cálculo).
        <template v-if="!esTotal">
          Sólo incluye la información de sus organizaciones.
        </template>
        Cada descarga queda registrada en la bitácora.
      </EncabezadoPagina>

      <div class="flex flex-wrap items-end gap-3 rounded-2xl bg-default p-5 shadow-tarjeta">
        <UFormField label="Desde" name="desde">
          <UInput v-model="desde" type="date" />
        </UFormField>
        <UFormField label="Hasta" name="hasta">
          <UInput v-model="hasta" type="date" />
        </UFormField>
        <p class="basis-full text-xs text-muted">
          Opcional. Filtra por fecha de alta, de solicitud o de inicio del evento, según el reporte.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <a
          v-for="(r, i) in REPORTES"
          :key="r.tipo"
          :href="enlace(r.tipo)"
          download
          class="entrada group flex gap-4 rounded-2xl bg-default p-5 shadow-tarjeta transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante"
          :style="{ '--retraso': `${i * 50}ms` }"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-marca-950 dark:text-marca-300">
            <UIcon :name="r.icono" class="size-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-highlighted">{{ r.titulo }}</span>
            <span class="mt-0.5 block text-sm text-muted">{{ r.descripcion }}</span>
          </span>
          <UIcon name="i-lucide-download" class="size-5 shrink-0 self-center text-muted transition-colors group-hover:text-marca-600" />
        </a>
      </div>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plataforma', permiso: 'reporte.ver' })
useSeoMeta({ title: 'Reportes' })

const { alcance } = usePermisos()
const esTotal = computed(() => alcance('reporte.ver') === 'TOTAL')
const desde = ref('')
const hasta = ref('')

const REPORTES = [
  { tipo: 'profesionales', titulo: 'Profesionales', descripcion: 'Cédula, especialidad, municipio, región, organizaciones y validación.', icono: 'i-lucide-stethoscope' },
  { tipo: 'organizaciones', titulo: 'Colegios y asociaciones', descripcion: 'Estado de afiliación, contacto y miembros activos.', icono: 'i-lucide-landmark' },
  { tipo: 'afiliaciones', titulo: 'Membresías', descripcion: 'Solicitudes, altas y bajas por organización.', icono: 'i-lucide-file-check-2' },
  { tipo: 'eventos', titulo: 'Eventos y EMC', descripcion: 'Inscritos confirmados, asistencia y constancias emitidas.', icono: 'i-lucide-calendar-check' },
]

function enlace(tipo: string) {
  const p = new URLSearchParams()
  if (desde.value) p.set('desde', desde.value)
  if (hasta.value) p.set('hasta', hasta.value)
  const q = p.toString()
  return `/api/reportes/${tipo}${q ? `?${q}` : ''}`
}
</script>
