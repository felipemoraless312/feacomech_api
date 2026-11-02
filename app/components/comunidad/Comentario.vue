<!-- Comentario con sus respuestas (hilo). Los eliminados se muestran como marcador para no romper el hilo. -->
<template>
  <div class="flex gap-3">
    <FotoPerfil :foto-id="c.eliminadoEn ? null : c.autor.perfil?.fotoId" :nombre="c.eliminadoEn ? '·' : nombreCompleto(c.autor)" tamano="sm" />
    <div class="min-w-0 flex-1">
      <div class="rounded-2xl bg-muted px-4 py-2.5">
        <template v-if="c.eliminadoEn">
          <p class="text-sm italic text-dimmed">
            Comentario eliminado
          </p>
        </template>
        <template v-else>
          <p class="text-sm">
            <span class="font-medium text-highlighted">{{ nombreCompleto(c.autor) }}</span>
            <span class="text-xs text-dimmed"> · {{ formatoFechaHora(c.creadoEn) }}{{ c.editadoEn ? ' · editado' : '' }}</span>
          </p>
          <p v-if="!editando" class="mt-0.5 whitespace-pre-line text-[15px] leading-relaxed text-highlighted">
            {{ c.contenido }}
          </p>
          <div v-else class="mt-2 space-y-2">
            <UTextarea v-model="texto" :rows="2" autoresize class="w-full" />
            <div class="flex justify-end gap-2">
              <UButton label="Cancelar" size="xs" color="neutral" variant="ghost" @click="editando = false" />
              <UButton label="Guardar" size="xs" :loading="enviando" @click="guardarEdicion" />
            </div>
          </div>
        </template>
      </div>

      <div v-if="!c.eliminadoEn" class="mt-1 flex flex-wrap items-center gap-1 px-1">
        <ComunidadReacciones :resumen="c.reacciones" :url="`/api/comunidad/comentarios/${c.id}/reaccion`" />
        <UButton v-if="puedeResponder" label="Responder" size="xs" color="neutral" variant="ghost" @click="respondiendo = !respondiendo" />
        <UDropdownMenu v-if="acciones.length" :items="acciones" :content="{ align: 'start' }">
          <UButton icon="i-lucide-ellipsis" size="xs" color="neutral" variant="ghost" aria-label="Más acciones" />
        </UDropdownMenu>
      </div>

      <div v-if="respondiendo" class="mt-2 flex gap-2">
        <UTextarea v-model="respuesta" :rows="1" autoresize placeholder="Escriba su respuesta…" class="w-full" />
        <UButton icon="i-lucide-send" :loading="enviando" :disabled="!respuesta.trim()" aria-label="Enviar respuesta" @click="responder" />
      </div>
      <AlertaError :mensaje="error" class="mt-2" />

      <div v-if="respuestas.length" class="mt-3 space-y-3">
        <ComunidadComentario v-for="r in respuestas" :key="r.id" :c="r" :todos="todos" :publicacion-id="publicacionId" :puede-responder="puedeResponder" :moderar="moderar" @cambio="emit('cambio')" @reportar="id => emit('reportar', id)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { PublicacionDetalle } from '~~/server/services/comunidad'

type Comentario = PublicacionDetalle['comentarios'][number]
const props = defineProps<{ c: Comentario, todos: Comentario[], publicacionId: string, puedeResponder: boolean, moderar: boolean }>()
const emit = defineEmits<{ cambio: [], reportar: [id: string] }>()
const api = useApi()

const respuestas = computed(() => props.todos.filter(x => x.padreId === props.c.id))
const respondiendo = ref(false)
const respuesta = ref('')
const editando = ref(false)
const texto = ref(props.c.contenido)

const acciones = computed<DropdownMenuItem[]>(() => [
  ...(props.c.propio ? [{ label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => { texto.value = props.c.contenido; editando.value = true } }] : []),
  ...(props.c.propio || props.moderar ? [{ label: 'Eliminar', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: eliminar }] : []),
  ...(!props.c.propio ? [{ label: 'Reportar', icon: 'i-lucide-flag', onSelect: () => emit('reportar', props.c.id) }] : []),
])

const { enviando, error, enviar } = useEnvio()
async function responder() {
  const r = await enviar(() => api(`/api/comunidad/publicaciones/${props.publicacionId}/comentarios`, { method: 'POST', body: { contenido: respuesta.value, padreId: props.c.id } }))
  if (r.ok) {
    respuesta.value = ''
    respondiendo.value = false
    emit('cambio')
  }
}
async function guardarEdicion() {
  const r = await enviar(() => api(`/api/comunidad/comentarios/${props.c.id}`, { method: 'PUT', body: { contenido: texto.value } }))
  if (r.ok) {
    editando.value = false
    emit('cambio')
  }
}
async function eliminar() {
  const motivo = props.c.propio ? null : prompt('Motivo de la eliminación (se le comunicará al autor):')
  if (!props.c.propio && motivo === null) return
  if (props.c.propio && !confirm('¿Eliminar su comentario?')) return
  const r = await enviar(() => api(`/api/comunidad/comentarios/${props.c.id}/eliminar`, { method: 'POST', body: { motivo } }))
  if (r.ok) emit('cambio')
}
</script>
