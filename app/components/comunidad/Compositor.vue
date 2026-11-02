<!-- Nueva publicación en un grupo (o edición de una existente) con adjuntos -->
<template>
  <UForm ref="form" :schema="publicacionSchema" :state="estado" class="space-y-3" @submit="guardar">
    <UInput v-model="estado.titulo" placeholder="Título (opcional)" variant="none" size="xl" class="w-full font-medium" :ui="{ base: 'px-0' }" />
    <UFormField name="contenido">
      <UTextarea v-model="estado.contenido" :rows="3" autoresize :maxrows="16" placeholder="Comparta una pregunta, un artículo o una experiencia…" class="w-full" />
    </UFormField>

    <UAlert
      v-if="advertencia.length"
      color="warning"
      variant="subtle"
      icon="i-lucide-shield-alert"
      :title="`Parece incluir ${advertencia.join(' y ')}`"
      description="La comunidad no es un expediente clínico: no publique datos que identifiquen a pacientes."
    />

    <ul v-if="archivos.length" class="flex flex-wrap gap-2">
      <li v-for="(a, i) in archivos" :key="i" class="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs">
        <UIcon :name="a.type.startsWith('image/') ? 'i-lucide-image' : 'i-lucide-file-text'" class="size-4 text-muted" />
        <span class="max-w-40 truncate">{{ a.name }}</span>
        <button type="button" class="text-dimmed hover:text-error" aria-label="Quitar" @click="archivos.splice(i, 1)">
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>
      </li>
    </ul>

    <AlertaError :mensaje="error" />
    <div class="flex flex-wrap items-center gap-2">
      <UButton v-if="!publicacion" icon="i-lucide-paperclip" label="Adjuntar" color="neutral" variant="ghost" size="sm" :disabled="archivos.length >= 5" @click="selector?.click()" />
      <input ref="selector" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden" @change="elegir">
      <span class="text-xs text-dimmed">Imágenes o PDF, hasta 5 de 10 MB.</span>
      <div class="ml-auto flex gap-2">
        <UButton v-if="publicacion" label="Cancelar" color="neutral" variant="ghost" size="sm" @click="emit('cancelar')" />
        <UButton type="submit" :label="publicacion ? 'Guardar' : 'Publicar'" icon="i-lucide-send" size="sm" :loading="enviando" :disabled="!estado.contenido.trim()" />
      </div>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { datosIdentificables, publicacionSchema, type PublicacionInput } from '#shared/schemas/comunidad'

const props = defineProps<{ grupoId?: string, publicacion?: { id: string, titulo: string | null, contenido: string } }>()
const emit = defineEmits<{ publicado: [id: string], cancelar: [] }>()
const api = useApi()
const toast = useToast()

const estado = reactive<EstadoFormulario<PublicacionInput>>({ titulo: props.publicacion?.titulo ?? '', contenido: props.publicacion?.contenido ?? '' })
const advertencia = computed(() => datosIdentificables(`${estado.titulo ?? ''} ${estado.contenido}`))

const selector = useTemplateRef<HTMLInputElement>('selector')
const archivos = ref<File[]>([])
function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  for (const f of Array.from(input.files ?? [])) {
    if (archivos.value.length >= 5) break
    if (f.size > 10 * 1024 * 1024) {
      toast.add({ title: `${f.name} supera los 10 MB`, color: 'error', icon: 'i-lucide-circle-alert' })
      continue
    }
    archivos.value.push(f)
  }
  input.value = ''
}

const form = useTemplateRef<Form<PublicacionInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  if (props.publicacion) {
    const r = await enviar(() => api(`/api/comunidad/publicaciones/${props.publicacion!.id}`, { method: 'PUT', body: estado }))
    if (r.ok) emit('publicado', props.publicacion.id)
    return
  }
  const r = await enviar(async () => {
    const p = await api<{ id: string }>(`/api/comunidad/grupos/${props.grupoId}/publicaciones`, { method: 'POST', body: estado })
    if (archivos.value.length) {
      const datos = new FormData()
      for (const a of archivos.value) datos.append('archivo', a)
      try {
        await api(`/api/comunidad/publicaciones/${p.id}/adjuntos`, { method: 'POST', body: datos })
      }
      catch (e) {
        toast.add({ title: 'La publicación se creó, pero no se pudieron adjuntar los archivos', description: errorDeApi(e).mensaje, color: 'warning', icon: 'i-lucide-paperclip' })
      }
    }
    return p
  })
  if (r.ok) {
    Object.assign(estado, { titulo: '', contenido: '' })
    archivos.value = []
    emit('publicado', r.valor.id)
  }
}
</script>
