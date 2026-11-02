<!-- Subir o editar un documento de la biblioteca -->
<template>
  <UForm ref="form" :schema="documentoSchema" :state="estado" class="space-y-4" @submit="guardar">
    <UFormField v-if="!documento" label="Archivo" name="archivo" required help="PDF, Word, Excel, PowerPoint o imagen, hasta 20 MB.">
      <div class="flex items-center gap-3">
        <UButton :label="archivo ? 'Cambiar archivo' : 'Elegir archivo'" icon="i-lucide-upload" color="neutral" variant="soft" @click="selector?.click()" />
        <span class="min-w-0 truncate text-sm text-muted">{{ archivo?.name ?? 'Ningún archivo' }}</span>
      </div>
      <input ref="selector" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.pptx,.jpg,.jpeg,.png,.webp" class="hidden" @change="elegir">
    </UFormField>
    <UFormField label="Título" name="titulo" required>
      <UInput v-model="estado.titulo" class="w-full" />
    </UFormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Categoría" name="categoriaId" required>
        <USelect v-model="estado.categoriaId" :items="opcionesCategoria" value-key="value" placeholder="Elija la categoría" class="w-full" />
      </UFormField>
      <UFormField label="Fecha del documento" name="fechaDocumento">
        <UInput v-model="estado.fechaDocumento" type="date" class="w-full" />
      </UFormField>
      <UFormField label="¿Quién puede consultarlo?" name="nivelAcceso" required>
        <USelect v-model="estado.nivelAcceso" :items="opcionesNivel" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Organización" name="organizacionId" :help="soloOrganizacion ? undefined : 'Vacío = la Federación'">
        <USelectMenu v-model="organizacion" :items="opcionesOrganizacion" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Responsable" name="responsable" help="Área o persona">
        <UInput v-model="estado.responsable" placeholder="Secretaría general" class="w-full" />
      </UFormField>
      <UFormField label="Evento relacionado" name="eventoId" help="Para material de congresos">
        <USelectMenu v-model="evento" :items="opcionesEvento" value-key="value" class="w-full" />
      </UFormField>
    </div>
    <UFormField label="Descripción" name="descripcion">
      <UTextarea v-model="estado.descripcion" :rows="2" autoresize class="w-full" />
    </UFormField>
    <USwitch v-model="estado.vigente" label="Vigente" description="Los no vigentes sólo los ve quien gestiona documentos." />
    <AlertaError :mensaje="error" />
    <div class="flex justify-end gap-2">
      <UButton v-if="documento" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cerrar')" />
      <UButton type="submit" :label="documento ? 'Guardar' : 'Subir documento'" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario, Pagina } from '#shared/schemas/comunes'
import { NIVELES_ACCESO, NOMBRE_NIVEL, documentoSchema, type DocumentoInput } from '#shared/schemas/documentos'
import type { DocumentoFila } from '~~/server/services/documentos'
import type { EventoFila } from '~~/server/services/eventos'

const props = defineProps<{ documento?: DocumentoFila, categorias: { id: string, nombre: string }[], organizacionId?: string }>()
const emit = defineEmits<{ cerrar: [], guardado: [] }>()
const api = useApi()
const toast = useToast()
const { alcance, acceso, puede } = usePermisos()
const soloOrganizacion = computed(() => alcance('documento.gestionar') === 'ORGANIZACION')

const opcionesCategoria = computed(() => props.categorias.map(c => ({ label: c.nombre, value: c.id })))
const opcionesNivel = NIVELES_ACCESO.map(n => ({ label: NOMBRE_NIVEL[n], value: n }))
const dia = (v?: string | Date | null) => (v ? new Date(v).toISOString().slice(0, 10) : '')

const d = props.documento
const estado = reactive<EstadoFormulario<DocumentoInput>>({
  titulo: d?.titulo ?? '',
  descripcion: d?.descripcion ?? '',
  categoriaId: d?.categoriaId ?? '',
  nivelAcceso: d?.nivelAcceso ?? (props.organizacionId ? 'ORGANIZACION' : 'AFILIADOS'),
  organizacionId: d?.organizacionId ?? props.organizacionId ?? (soloOrganizacion.value ? acceso.value?.organizaciones['documento.gestionar']?.[0] : undefined),
  eventoId: d?.eventoId ?? undefined,
  fechaDocumento: dia(d?.fechaDocumento),
  responsable: d?.responsable ?? '',
  vigente: d?.vigente ?? true,
})

const NINGUNA = '__ninguna__'
const { data: organizaciones } = await useAsyncData('organizaciones-disponibles', () => api<{ id: string, nombre: string }[]>('/api/organizaciones/disponibles'), { default: () => [] })
const opcionesOrganizacion = computed(() => {
  const propias = soloOrganizacion.value ? acceso.value?.organizaciones['documento.gestionar'] ?? [] : null
  const lista = organizaciones.value.filter(o => !propias || propias.includes(o.id)).map(o => ({ label: o.nombre, value: o.id }))
  return soloOrganizacion.value ? lista : [{ label: 'La Federación', value: NINGUNA }, ...lista]
})
const organizacion = computed({ get: () => estado.organizacionId ?? NINGUNA, set: (v: string) => { estado.organizacionId = v === NINGUNA ? undefined : v } })

const { data: eventos } = await useAsyncData('eventos-para-documentos', () => (puede('evento.gestionar')
  ? api<Pagina<EventoFila>>('/api/eventos/gestion', { query: { porPagina: 100 } }).then(p => p.datos)
  : Promise.resolve([] as EventoFila[])), { default: () => [] })
const opcionesEvento = computed(() => [{ label: 'Ninguno', value: NINGUNA }, ...eventos.value.map(e => ({ label: e.titulo, value: e.id }))])
const evento = computed({ get: () => estado.eventoId ?? NINGUNA, set: (v: string) => { estado.eventoId = v === NINGUNA ? undefined : v } })

const selector = useTemplateRef<HTMLInputElement>('selector')
const archivo = ref<File>()
function elegir(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (f.size > 20 * 1024 * 1024) {
    toast.add({ title: 'El archivo supera los 20 MB', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  archivo.value = f
  if (!estado.titulo) estado.titulo = f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ')
}

const form = useTemplateRef<Form<DocumentoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  if (d) {
    const r = await enviar(() => api(`/api/documentos/${d.id}`, { method: 'PUT', body: estado }))
    if (r.ok) emit('guardado')
    return
  }
  if (!archivo.value) {
    error.value = 'Elija el archivo'
    return
  }
  const datos = new FormData()
  datos.append('datos', JSON.stringify(estado))
  datos.append('archivo', archivo.value)
  const r = await enviar(() => api('/api/documentos', { method: 'POST', body: datos }))
  if (r.ok) emit('guardado')
}
async function eliminar() {
  if (!confirm('¿Eliminar este documento? Si sólo dejó de aplicar, márquelo como no vigente.')) return
  const r = await enviar(() => api(`/api/documentos/${d!.id}`, { method: 'DELETE' }))
  if (r.ok) emit('guardado')
}
</script>
