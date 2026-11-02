<!-- Editor de noticia. /plataforma/noticias/nueva crea una; las demás se editan según su estado. -->
<template>
  <PanelPagina id="noticia" :titulo="nueva ? 'Redactar' : 'Noticia'" tamano="md">
    <template #acciones>
      <UButton to="/plataforma/noticias" icon="i-lucide-arrow-left" label="Noticias" color="neutral" variant="ghost" class="hidden sm:inline-flex" />
    </template>

    <div class="space-y-8">
      <div v-if="noticia" class="flex flex-wrap items-center gap-3">
        <EstadoPunto :texto="NOMBRE_ESTADO_NOTICIA[noticia.estado]" :tono="TONO[noticia.estado]" class="font-medium" />
        <NuxtLink v-if="noticia.estado === 'PUBLICADA'" :to="`/noticias/${noticia.slug}`" target="_blank" class="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Ver en el portal <UIcon name="i-lucide-external-link" class="size-3.5" />
        </NuxtLink>
        <div class="ml-auto flex flex-wrap gap-2">
          <UButton v-if="noticia.estado === 'BORRADOR' && noticia.editable" label="Enviar a revisión" icon="i-lucide-send" color="neutral" variant="soft" size="sm" @click="transicion('ENVIAR_A_REVISION')" />
          <UButton v-if="admin && noticia.estado === 'REVISION'" label="Devolver" icon="i-lucide-undo-2" color="neutral" variant="soft" size="sm" @click="devolverAbierto = true" />
          <UButton v-if="admin && noticia.estado !== 'PUBLICADA'" label="Publicar" icon="i-lucide-globe" size="sm" @click="transicion('PUBLICAR')" />
          <UButton v-if="admin && noticia.estado === 'PUBLICADA'" label="Retirar del portal" icon="i-lucide-eye-off" color="error" variant="soft" size="sm" @click="transicion('RETIRAR')" />
        </div>
      </div>

      <UAlert
        v-if="noticia && !noticia.editable"
        color="info"
        variant="subtle"
        icon="i-lucide-lock"
        :title="noticia.estado === 'PUBLICADA' ? 'Publicada: sólo la administración puede editarla.' : 'No puede editar esta noticia.'"
      />

      <!-- Portada -->
      <div v-if="noticia" class="space-y-2">
        <div class="relative aspect-[16/7] overflow-hidden rounded-2xl bg-muted">
          <img v-if="noticia.portadaId" :src="`/api/archivos/${noticia.portadaId}?v=${version}`" alt="Portada" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center text-dimmed">
            <UIcon name="i-lucide-image" class="size-10" />
          </div>
          <UButton v-if="noticia.editable" :label="noticia.portadaId ? 'Cambiar portada' : 'Agregar portada'" icon="i-lucide-upload" size="sm" color="neutral" class="absolute bottom-3 right-3" :loading="subiendo" @click="selector?.click()" />
        </div>
        <p class="text-xs text-dimmed">
          JPG, PNG o WebP de hasta 4 MB. Proporción recomendada 16:7.
        </p>
        <input ref="selector" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="subirPortada">
      </div>

      <UForm ref="form" :schema="noticiaSchema" :state="estado" :disabled="!editable" class="space-y-5" @submit="guardar">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Tipo" name="tipo" required>
            <USelect v-model="estado.tipo" :items="opcionesTipo" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="A nombre de" name="organizacionId" help="Vacío = la Federación">
            <USelectMenu v-model="organizacion" :items="opcionesOrganizacion" value-key="value" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Título" name="titulo" required>
          <UInput v-model="estado.titulo" size="xl" class="w-full" />
        </UFormField>
        <UFormField label="Resumen" name="resumen" help="Una o dos frases para las tarjetas y buscadores.">
          <UTextarea v-model="estado.resumen" :rows="2" autoresize class="w-full" />
        </UFormField>
        <UFormField label="Contenido" name="contenido" required help="Separe los párrafos con una línea en blanco.">
          <UTextarea v-model="estado.contenido" :rows="14" autoresize class="w-full" />
        </UFormField>
        <USwitch v-if="admin" v-model="estado.destacada" label="Destacar en la página de inicio" />

        <AlertaError :mensaje="error" />
        <div v-if="editable" class="flex flex-wrap items-center justify-end gap-2">
          <UButton v-if="noticia?.estado === 'BORRADOR'" label="Eliminar borrador" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
          <UButton type="submit" :label="nueva ? 'Guardar borrador' : 'Guardar cambios'" icon="i-lucide-check" :loading="enviando" />
        </div>
      </UForm>
    </div>

    <DialogoMotivo
      v-model:open="devolverAbierto"
      titulo="Devolver al autor"
      etiqueta="¿Qué debe corregirse?"
      confirmar="Devolver"
      color="warning"
      :accion="m => api(`/api/noticias/${id}/estado`, { method: 'POST', body: { accion: 'DEVOLVER', motivo: m } })"
      @hecho="alCambiar('Devuelta al autor')"
    />
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { NOMBRE_ESTADO_NOTICIA, NOMBRE_NOTICIA, TIPOS_NOTICIA, noticiaSchema, type NoticiaInput } from '#shared/schemas/portal'
import type { NoticiaDetalle } from '~~/server/services/noticias'
import type { TonoEstado } from '~/components/EstadoPunto.vue'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Noticia' })

const opcionesTipo = TIPOS_NOTICIA.map(t => ({ label: NOMBRE_NOTICIA[t], value: t }))
const route = useRoute()
const api = useApi()
const toast = useToast()
const { puede, alcance, acceso } = usePermisos()
const admin = computed(() => puede('noticia.administrar'))
const TONO: Record<string, TonoEstado> = { BORRADOR: 'neutro', REVISION: 'alerta', PUBLICADA: 'exito', RETIRADA: 'error' }

const id = String(route.params.id)
const nueva = id === 'nueva'
const { data: noticia, refresh } = await useAsyncData(`noticia-${id}`, () => (nueva ? Promise.resolve(null) : api<NoticiaDetalle>(`/api/noticias/${id}`)))
const editable = computed(() => nueva || !!noticia.value?.editable)

const estado = reactive<EstadoFormulario<NoticiaInput>>({ tipo: 'NOTICIA', titulo: '', resumen: '', contenido: '', destacada: false, organizacionId: undefined })
watch(noticia, (n) => {
  if (n) Object.assign(estado, { tipo: n.tipo, titulo: n.titulo, resumen: n.resumen ?? '', contenido: n.contenido, destacada: n.destacada, organizacionId: n.organizacionId ?? undefined })
}, { immediate: true })

// Organizaciones a cuyo nombre puede publicar.
const { data: organizaciones } = await useAsyncData('organizaciones-disponibles', () => api<{ id: string, nombre: string }[]>('/api/organizaciones/disponibles'), { default: () => [] })
const NINGUNA = '__federacion__'
const opcionesOrganizacion = computed(() => {
  const propias = alcance('noticia.publicar') === 'ORGANIZACION' && !admin.value ? acceso.value?.organizaciones['noticia.publicar'] ?? [] : null
  const lista = organizaciones.value.filter(o => !propias || propias.includes(o.id))
  return [{ label: 'La Federación', value: NINGUNA }, ...lista.map(o => ({ label: o.nombre, value: o.id }))]
})
const organizacion = computed({ get: () => estado.organizacionId ?? NINGUNA, set: (v: string) => { estado.organizacionId = v === NINGUNA ? undefined : v } })

const form = useTemplateRef<Form<NoticiaInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  if (nueva) {
    const r = await enviar(() => api<{ id: string }>('/api/noticias', { method: 'POST', body: estado }))
    if (r.ok) {
      toast.add({ title: 'Borrador guardado', description: 'Agregue una portada y envíelo a revisión.', color: 'success', icon: 'i-lucide-check' })
      await navigateTo(`/plataforma/noticias/${r.valor.id}`, { replace: true })
    }
    return
  }
  const r = await enviar(() => api(`/api/noticias/${id}`, { method: 'PUT', body: estado }))
  if (r.ok) alCambiar('Cambios guardados')
}

async function transicion(accion: 'ENVIAR_A_REVISION' | 'PUBLICAR' | 'RETIRAR') {
  const r = await enviar(() => api(`/api/noticias/${id}/estado`, { method: 'POST', body: { accion } }))
  if (r.ok) alCambiar({ ENVIAR_A_REVISION: 'Enviada a revisión', PUBLICAR: 'Publicada en el portal', RETIRAR: 'Retirada del portal' }[accion])
  else toast.add({ title: error.value, color: 'error', icon: 'i-lucide-circle-alert' })
}

const devolverAbierto = ref(false)

function alCambiar(titulo: string) {
  toast.add({ title: titulo, color: 'success', icon: 'i-lucide-check' })
  refresh()
}

async function eliminar() {
  if (!confirm('¿Eliminar este borrador?')) return
  const r = await enviar(() => api(`/api/noticias/${id}`, { method: 'DELETE' }))
  if (r.ok) {
    toast.add({ title: 'Borrador eliminado', color: 'success', icon: 'i-lucide-check' })
    await navigateTo('/plataforma/noticias')
  }
}

// --- Portada
const selector = useTemplateRef<HTMLInputElement>('selector')
const subiendo = ref(false)
const version = ref(0)
async function subirPortada(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  input.value = ''
  if (!archivo) return
  const datos = new FormData()
  datos.append('portada', archivo)
  subiendo.value = true
  try {
    await api(`/api/noticias/${id}/portada`, { method: 'POST', body: datos })
    version.value++
    alCambiar('Portada actualizada')
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    subiendo.value = false
  }
}
</script>
