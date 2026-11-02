<template>
  <PanelPagina id="portada" titulo="Página de inicio" tamano="md">
    <div v-if="estado" class="space-y-10">
      <EncabezadoPagina titulo="Contenido de la página de inicio">
        Cifras destacadas, trayectoria, cita y líneas de trabajo. Indique la fuente o el año de cada cifra.
        Una sección sin elementos no se muestra.
      </EncabezadoPagina>

      <!-- Cifras -->
      <GrupoDatos titulo="Cifras destacadas">
        <template #acciones>
          <UButton icon="i-lucide-plus" label="Agregar" size="xs" color="neutral" variant="ghost" :disabled="estado.cifras.length >= 6" @click="estado.cifras.push({ valor: '', etiqueta: '', nota: '' })" />
        </template>
        <div v-for="(c, i) in estado.cifras" :key="`c${i}`" class="grid gap-3 px-5 py-4 sm:grid-cols-[7rem_1fr_1fr_auto]">
          <UInput v-model="c.valor" placeholder="300" aria-label="Valor" />
          <UInput v-model="c.etiqueta" placeholder="Integrantes" aria-label="Etiqueta" />
          <UInput v-model="c.nota" placeholder="Fuente o año" aria-label="Nota" />
          <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost" aria-label="Quitar" @click="estado.cifras.splice(i, 1)" />
        </div>
        <p v-if="!estado.cifras.length" class="px-5 py-4 text-sm text-muted">
          Sin cifras.
        </p>
      </GrupoDatos>

      <!-- Trayectoria -->
      <GrupoDatos titulo="Trayectoria (hitos)">
        <template #acciones>
          <UButton icon="i-lucide-plus" label="Agregar" size="xs" color="neutral" variant="ghost" @click="estado.hitos.push({ anio: '', titulo: '', texto: '' })" />
        </template>
        <div v-for="(h, i) in estado.hitos" :key="`h${i}`" class="space-y-2 px-5 py-4">
          <div class="grid gap-3 sm:grid-cols-[7rem_1fr_auto]">
            <UInput v-model="h.anio" placeholder="1978" aria-label="Año" />
            <UInput v-model="h.titulo" placeholder="Título del hito" aria-label="Título" />
            <div class="flex">
              <UButton icon="i-lucide-arrow-up" color="neutral" variant="ghost" :disabled="i === 0" aria-label="Subir" @click="mover(estado.hitos, i, -1)" />
              <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost" aria-label="Quitar" @click="estado.hitos.splice(i, 1)" />
            </div>
          </div>
          <UTextarea v-model="h.texto" :rows="2" autoresize placeholder="Descripción breve" class="w-full" />
        </div>
      </GrupoDatos>

      <!-- Cita -->
      <GrupoDatos titulo="Cita destacada">
        <div class="space-y-3 px-5 py-4">
          <UTextarea v-model="estado.cita.texto" :rows="2" autoresize placeholder="Texto de la cita" class="w-full" />
          <div class="grid gap-3 sm:grid-cols-2">
            <UInput v-model="estado.cita.autor" placeholder="Autor" />
            <UInput v-model="estado.cita.cargo" placeholder="Cargo y fecha" />
          </div>
        </div>
      </GrupoDatos>

      <!-- Líneas de trabajo -->
      <GrupoDatos titulo="Líneas de trabajo">
        <template #acciones>
          <UButton icon="i-lucide-plus" label="Agregar" size="xs" color="neutral" variant="ghost" :disabled="estado.lineas.length >= 9" @click="estado.lineas.push({ icono: 'i-lucide-check', titulo: '', texto: '' })" />
        </template>
        <div v-for="(l, i) in estado.lineas" :key="`l${i}`" class="space-y-2 px-5 py-4">
          <div class="grid gap-3 sm:grid-cols-[12rem_1fr_auto]">
            <USelect v-model="l.icono" :items="ICONOS" value-key="value" aria-label="Ícono">
              <template #leading>
                <UIcon :name="l.icono" class="size-4" />
              </template>
            </USelect>
            <UInput v-model="l.titulo" placeholder="Título" aria-label="Título" />
            <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost" aria-label="Quitar" @click="estado.lineas.splice(i, 1)" />
          </div>
          <UTextarea v-model="l.texto" :rows="2" autoresize placeholder="Descripción" class="w-full" />
        </div>
      </GrupoDatos>

      <!-- Agenda -->
      <GrupoDatos titulo="Agenda (fechas próximas)">
        <template #acciones>
          <UButton icon="i-lucide-plus" label="Agregar" size="xs" color="neutral" variant="ghost" :disabled="estado.agenda.length >= 8" @click="estado.agenda.push({ fecha: '', fin: '', titulo: '', lugar: '', organiza: '', url: '' })" />
        </template>
        <div v-for="(a, i) in estado.agenda" :key="`a${i}`" class="space-y-2 px-5 py-4">
          <div class="grid gap-3 sm:grid-cols-[10rem_10rem_1fr_auto]">
            <UInput v-model="a.fecha" type="date" aria-label="Fecha" />
            <UInput v-model="a.fin" type="date" aria-label="Termina (opcional)" />
            <UInput v-model="a.titulo" placeholder="Título" aria-label="Título" />
            <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost" aria-label="Quitar" @click="estado.agenda.splice(i, 1)" />
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <UInput v-model="a.lugar" placeholder="Lugar" />
            <UInput v-model="a.organiza" placeholder="Organiza" />
            <UInput v-model="a.url" placeholder="Enlace de la fuente" />
          </div>
        </div>
        <p class="px-5 pb-4 text-xs text-muted">
          Las fechas ya pasadas dejan de mostrarse automáticamente.
        </p>
      </GrupoDatos>

      <div class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <AlertaError :mensaje="error" class="sm:mr-auto" />
        <UButton label="Guardar" icon="i-lucide-check" size="lg" :loading="enviando" class="justify-center" @click="guardar" />
      </div>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { DatosPortada } from '#shared/parametros'

definePageMeta({ layout: 'plataforma', permiso: 'contenido.administrar' })
useSeoMeta({ title: 'Página de inicio' })

const api = useApi()
const toast = useToast()
const ICONOS = [
  { label: 'Salud', value: 'i-lucide-heart-pulse' },
  { label: 'Investigación', value: 'i-lucide-microscope' },
  { label: 'Academia', value: 'i-lucide-graduation-cap' },
  { label: 'Censo', value: 'i-lucide-chart-pie' },
  { label: 'Planes de estudio', value: 'i-lucide-book-open' },
  { label: 'Regularización', value: 'i-lucide-badge-check' },
  { label: 'Vinculación', value: 'i-lucide-handshake' },
  { label: 'Comunidad', value: 'i-lucide-users-round' },
  { label: 'Defensa gremial', value: 'i-lucide-shield-check' },
  { label: 'Genérico', value: 'i-lucide-check' },
]

const { data: estado } = await useAsyncData('portada-config', () => api<DatosPortada>('/api/configuracion/portada'))
function mover<T>(lista: T[], i: number, d: number) {
  const [x] = lista.splice(i, 1)
  lista.splice(i + d, 0, x!)
}

const { enviando, error, enviar } = useEnvio()
async function guardar() {
  const r = await enviar(() => api('/api/configuracion/portada', { method: 'PUT', body: estado.value }))
  if (r.ok) toast.add({ title: 'Página de inicio actualizada', color: 'success', icon: 'i-lucide-check' })
}
</script>
