<template>
  <PanelPagina id="evento-gestion" :titulo="evento?.titulo ?? 'Evento'" tamano="lg">
    <template #acciones>
      <UButton to="/plataforma/eventos/gestion" icon="i-lucide-arrow-left" label="Eventos" color="neutral" variant="ghost" class="hidden sm:inline-flex" />
    </template>

    <div v-if="evento" class="space-y-6">
      <!-- Estado y acciones -->
      <div class="flex flex-wrap items-center gap-3">
        <EstadoPunto :texto="NOMBRE_ESTADO_EVENTO[evento.estado]" :tono="evento.estado === 'PUBLICADO' ? 'exito' : evento.estado === 'CANCELADO' ? 'error' : 'neutro'" class="font-medium" />
        <span class="text-sm text-muted">{{ rangoEvento(evento.inicio, evento.fin) }} · {{ evento.confirmados }} inscrito(s){{ evento.capacidad ? ` de ${evento.capacidad}` : '' }}</span>
        <NuxtLink v-if="evento.estado !== 'BORRADOR'" :to="`/eventos/${evento.slug}`" target="_blank" class="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Ver en el portal <UIcon name="i-lucide-external-link" class="size-3.5" />
        </NuxtLink>
        <div class="ml-auto flex gap-2">
          <UButton v-if="evento.estado === 'BORRADOR'" label="Publicar" icon="i-lucide-globe" size="sm" @click="cambiarEstado('PUBLICADO')" />
          <UButton v-if="evento.estado === 'PUBLICADO'" label="Cancelar evento" icon="i-lucide-ban" color="error" variant="soft" size="sm" @click="cambiarEstado('CANCELADO')" />
          <UButton v-if="evento.estado === 'CANCELADO'" label="Reactivar" color="neutral" variant="soft" size="sm" @click="cambiarEstado('PUBLICADO')" />
        </div>
      </div>

      <UTabs v-model="pestana" :items="pestanas" :content="false" variant="link" :ui="{ list: 'overflow-x-auto' }" />

      <!-- Datos -->
      <div v-if="pestana === 'datos'" class="space-y-8">
        <div class="space-y-2">
          <div class="relative aspect-[16/7] overflow-hidden rounded-2xl bg-muted">
            <img v-if="evento.portadaId" :src="`/api/archivos/${evento.portadaId}?v=${version}`" alt="Portada" class="size-full object-cover">
            <div v-else class="flex size-full items-center justify-center text-dimmed">
              <UIcon name="i-lucide-image" class="size-10" />
            </div>
            <UButton :label="evento.portadaId ? 'Cambiar portada' : 'Agregar portada'" icon="i-lucide-upload" size="sm" color="neutral" class="absolute bottom-3 right-3" @click="selectorPortada?.click()" />
          </div>
          <input ref="selectorPortada" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="subirPortada">
        </div>
        <EventosFormulario :key="evento.actualizadoEn as unknown as string" :evento="evento" @guardado="alGuardar('Evento actualizado')" />
      </div>

      <!-- Programa -->
      <div v-else-if="pestana === 'programa'" class="space-y-4">
        <div class="flex justify-end">
          <UButton icon="i-lucide-plus" label="Agregar actividad" @click="abrirActividad()" />
        </div>
        <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
          <EstadoVacio v-if="!evento.programa.length" icono="i-lucide-list-ordered" titulo="Sin programa" descripcion="Agregue las conferencias, talleres y recesos." />
          <ul v-else class="divide-y divide-default">
            <li v-for="a in evento.programa" :key="a.id" class="flex items-start gap-4 px-5 py-3.5">
              <div class="w-28 shrink-0 text-sm">
                <p class="capitalize text-muted">
                  {{ diaEvento(a.inicio) }}
                </p>
                <p class="font-medium tabular-nums text-highlighted">
                  {{ horaEvento(a.inicio) }}{{ a.fin ? `–${horaEvento(a.fin)}` : '' }}
                </p>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-highlighted">
                  {{ a.titulo }}
                </p>
                <p class="text-sm text-muted">
                  {{ [a.ponentes, a.lugar].filter(Boolean).join(' · ') }}
                </p>
              </div>
              <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" aria-label="Editar" @click="abrirActividad(a)" />
            </li>
          </ul>
        </div>
      </div>

      <!-- Ponentes -->
      <div v-else-if="pestana === 'ponentes'" class="space-y-4">
        <div class="flex justify-end">
          <UButton icon="i-lucide-plus" label="Agregar ponente" @click="abrirPonente()" />
        </div>
        <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
          <EstadoVacio v-if="!evento.ponentes.length" icono="i-lucide-mic" titulo="Sin ponentes registrados" />
          <ul v-else class="divide-y divide-default">
            <li v-for="p in evento.ponentes" :key="p.id" class="flex items-start gap-4 px-5 py-3.5">
              <FotoPerfil :nombre="p.nombre" />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-highlighted">
                  {{ p.nombre }}
                </p>
                <p v-if="p.semblanza" class="line-clamp-2 text-sm text-muted">
                  {{ p.semblanza }}
                </p>
              </div>
              <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" aria-label="Editar" @click="abrirPonente(p)" />
            </li>
          </ul>
        </div>
      </div>

      <!-- Inscritos -->
      <EventosInscritos v-else :evento="evento" @cambio="refresh" />
    </div>

    <!-- Actividad -->
    <UModal v-model:open="actividad.abierto" :title="actividad.id ? 'Editar actividad' : 'Agregar actividad'">
      <template #body>
        <UForm :schema="actividadSchema" :state="actividad.datos" class="space-y-4" @submit="guardarActividad">
          <UFormField label="Título" name="titulo" required>
            <UInput v-model="actividad.datos.titulo" class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Inicio" name="inicio" required>
              <UInput v-model="actividad.datos.inicio" type="datetime-local" class="w-full" />
            </UFormField>
            <UFormField label="Fin" name="fin">
              <UInput v-model="actividad.datos.fin" type="datetime-local" class="w-full" />
            </UFormField>
            <UFormField label="Ponentes" name="ponentes">
              <UInput v-model="actividad.datos.ponentes" class="w-full" />
            </UFormField>
            <UFormField label="Lugar o sala" name="lugar">
              <UInput v-model="actividad.datos.lugar" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Descripción" name="descripcion">
            <UTextarea v-model="actividad.datos.descripcion" :rows="2" autoresize class="w-full" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton v-if="actividad.id" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar('programa', actividad.id)" />
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="actividad.abierto = false" />
            <UButton type="submit" label="Guardar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Ponente -->
    <UModal v-model:open="ponente.abierto" :title="ponente.id ? 'Editar ponente' : 'Agregar ponente'">
      <template #body>
        <UForm :schema="ponenteSchema" :state="ponente.datos" class="space-y-4" @submit="guardarPonente">
          <UFormField label="Nombre" name="nombre" required>
            <UInput v-model="ponente.datos.nombre" class="w-full" />
          </UFormField>
          <UFormField label="Semblanza" name="semblanza">
            <UTextarea v-model="ponente.datos.semblanza" :rows="4" autoresize class="w-full" />
          </UFormField>
          <UFormField label="Orden" name="orden">
            <UInputNumber v-model="ponente.datos.orden" :min="0" :max="999" class="w-32" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton v-if="ponente.id" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar('ponentes', ponente.id)" />
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="ponente.abierto = false" />
            <UButton type="submit" label="Guardar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { NOMBRE_ESTADO_EVENTO, actividadSchema, ponenteSchema, type ActividadInput, type PonenteInput } from '#shared/schemas/eventos'
import type { EventoGestion } from '~~/server/services/eventos'

definePageMeta({ layout: 'plataforma', permiso: 'evento.gestionar' })
useSeoMeta({ title: 'Evento' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const id = String(route.params.id)

const { data: evento, refresh } = await useAsyncData(`evento-gestion-${id}`, () => api<EventoGestion>(`/api/eventos/gestion/${id}`))

const pestanas = [
  { label: 'Datos', value: 'datos', icon: 'i-lucide-info' },
  { label: 'Programa', value: 'programa', icon: 'i-lucide-list-ordered' },
  { label: 'Ponentes', value: 'ponentes', icon: 'i-lucide-mic' },
  { label: 'Inscritos', value: 'inscritos', icon: 'i-lucide-users' },
]
const pestana = ref(typeof route.query.p === 'string' ? route.query.p : 'datos')

function alGuardar(titulo: string) {
  toast.add({ title: titulo, color: 'success', icon: 'i-lucide-check' })
  refresh()
}

async function cambiarEstado(estado: 'PUBLICADO' | 'CANCELADO') {
  if (estado === 'CANCELADO' && !confirm('¿Cancelar el evento? Se avisará a los inscritos.')) return
  try {
    await api(`/api/eventos/gestion/${id}/estado`, { method: 'POST', body: { estado } })
    alGuardar(estado === 'PUBLICADO' ? 'Evento publicado' : 'Evento cancelado')
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

// --- Portada
const selectorPortada = useTemplateRef<HTMLInputElement>('selectorPortada')
const version = ref(0)
async function subirPortada(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  input.value = ''
  if (!archivo) return
  const datos = new FormData()
  datos.append('portada', archivo)
  try {
    await api(`/api/eventos/gestion/${id}/portada`, { method: 'POST', body: datos })
    version.value++
    alGuardar('Portada actualizada')
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

// --- Programa y ponentes
const local = (v?: string | Date | null) => (v ? new Date(new Date(v).getTime() - 6 * 3_600_000).toISOString().slice(0, 16) : '')
type Actividad = EventoGestion['programa'][number]
type Ponente = EventoGestion['ponentes'][number]
const actividad = reactive<{ abierto: boolean, id?: string, datos: EstadoFormulario<ActividadInput> }>({ abierto: false, datos: { inicio: '', fin: '', titulo: '', descripcion: '', ponentes: '', lugar: '' } })
const ponente = reactive<{ abierto: boolean, id?: string, datos: EstadoFormulario<PonenteInput> }>({ abierto: false, datos: { nombre: '', semblanza: '', orden: 0 } })

function abrirActividad(a?: Actividad) {
  Object.assign(actividad, {
    abierto: true,
    id: a?.id,
    datos: { inicio: local(a?.inicio) || local(evento.value?.inicio), fin: local(a?.fin), titulo: a?.titulo ?? '', descripcion: a?.descripcion ?? '', ponentes: a?.ponentes ?? '', lugar: a?.lugar ?? '' },
  })
}
function abrirPonente(p?: Ponente) {
  Object.assign(ponente, { abierto: true, id: p?.id, datos: { nombre: p?.nombre ?? '', semblanza: p?.semblanza ?? '', orden: p?.orden ?? (evento.value?.ponentes.length ?? 0) } })
}

const { enviando, error, enviar } = useEnvio()
async function guardarActividad() {
  const r = await enviar(() => api(actividad.id ? `/api/eventos/gestion/${id}/programa/${actividad.id}` : `/api/eventos/gestion/${id}/programa`, { method: actividad.id ? 'PUT' : 'POST', body: actividad.datos }))
  if (r.ok) {
    actividad.abierto = false
    alGuardar('Programa actualizado')
  }
}
async function guardarPonente() {
  const r = await enviar(() => api(ponente.id ? `/api/eventos/gestion/${id}/ponentes/${ponente.id}` : `/api/eventos/gestion/${id}/ponentes`, { method: ponente.id ? 'PUT' : 'POST', body: ponente.datos }))
  if (r.ok) {
    ponente.abierto = false
    alGuardar('Ponentes actualizados')
  }
}
async function eliminar(tipo: 'programa' | 'ponentes', elemento: string) {
  if (!confirm('¿Eliminar?')) return
  const r = await enviar(() => api(`/api/eventos/gestion/${id}/${tipo}/${elemento}`, { method: 'DELETE' }))
  if (r.ok) {
    actividad.abierto = false
    ponente.abierto = false
    alGuardar('Eliminado')
  }
}
</script>
