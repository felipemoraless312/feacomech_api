<template>
  <PanelPagina id="publicacion" :titulo="p?.grupo.nombre ?? 'Publicación'" tamano="md">
    <template #acciones>
      <UButton v-if="p" :to="`/plataforma/comunidad/${p.grupo.slug}`" icon="i-lucide-arrow-left" :label="p.grupo.nombre" color="neutral" variant="ghost" class="hidden max-w-60 sm:inline-flex" />
    </template>

    <div v-if="p" class="space-y-6">
      <UAlert v-if="p.eliminadaEn" color="error" variant="subtle" icon="i-lucide-trash-2" title="Publicación eliminada" :description="p.motivoEliminacion ?? 'Sólo la moderación la ve.'" />

      <article class="rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
        <header class="flex items-start gap-3">
          <FotoPerfil :foto-id="p.autor.perfil?.fotoId" :nombre="nombreCompleto(p.autor)" tamano="lg" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(p.autor) }}
            </p>
            <p class="text-sm text-muted">
              {{ p.autor.perfil?.especialidad?.nombre ?? '' }}{{ p.autor.perfil?.especialidad ? ' · ' : '' }}{{ formatoFechaHora(p.creadaEn) }}{{ p.editadaEn ? ' · editada' : '' }}
            </p>
          </div>
          <UBadge v-if="p.fijada" icon="i-lucide-pin" label="Fijada" color="primary" variant="soft" size="sm" />
          <UDropdownMenu v-if="acciones.length" :items="acciones" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones" />
          </UDropdownMenu>
        </header>

        <ComunidadCompositor v-if="editando" :publicacion="p" class="mt-4" @cancelar="editando = false" @publicado="alEditar" />
        <template v-else>
          <h1 v-if="p.titulo" class="mt-4 font-display text-2xl font-semibold leading-snug text-highlighted">
            {{ p.titulo }}
          </h1>
          <p class="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-highlighted">
            {{ p.contenido }}
          </p>
        </template>

        <ComunidadAdjuntos :adjuntos="p.adjuntos" :editable="p.propia && !p.eliminadaEn" class="mt-4" @quitar="quitarAdjunto" />

        <footer class="mt-4 flex items-center gap-2 border-t border-default pt-3">
          <ComunidadReacciones :resumen="p.reacciones" :url="`/api/comunidad/publicaciones/${p.id}/reaccion`" :desactivado="!!p.eliminadaEn" />
          <span class="ml-auto text-sm text-muted">{{ visibles }} comentario(s)</span>
        </footer>
      </article>

      <!-- Comentarios -->
      <section class="space-y-4">
        <div v-if="p.acceso.publicar && !p.eliminadaEn && p.grupoActivo" class="flex gap-3">
          <UTextarea v-model="comentario" :rows="2" autoresize placeholder="Escriba un comentario…" class="w-full" />
          <UButton icon="i-lucide-send" :loading="enviando" :disabled="!comentario.trim()" aria-label="Comentar" class="self-end" @click="comentar" />
        </div>
        <AlertaError :mensaje="error" />
        <EstadoVacio v-if="!p.comentarios.length" icono="i-lucide-message-circle" titulo="Aún no hay comentarios" />
        <ComunidadComentario
          v-for="c in raices"
          :key="c.id"
          :c="c"
          :todos="p.comentarios"
          :publicacion-id="p.id"
          :puede-responder="p.acceso.publicar && !p.eliminadaEn"
          :moderar="p.acceso.moderar"
          @cambio="refresh"
          @reportar="id => abrirReporte(`/api/comunidad/comentarios/${id}/reportes`)"
        />
      </section>
    </div>

    <ComunidadDialogoReporte v-model:open="reporteAbierto" :url="reporteUrl" />
  </PanelPagina>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { PublicacionDetalle } from '~~/server/services/comunidad'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Publicación' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const id = String(route.params.id)
const { data: p, refresh } = await useAsyncData(`publicacion-${id}`, () => api<PublicacionDetalle>(`/api/comunidad/publicaciones/${id}`))

const raices = computed(() => p.value?.comentarios.filter(c => !c.padreId) ?? [])
const visibles = computed(() => p.value?.comentarios.filter(c => !c.eliminadoEn).length ?? 0)
const editando = ref(false)

const acciones = computed<DropdownMenuItem[]>(() => {
  const x = p.value
  if (!x || x.eliminadaEn) return []
  return [
    ...(x.propia ? [{ label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => (editando.value = true) }] : []),
    ...(x.acceso.moderar ? [{ label: x.fijada ? 'Desfijar' : 'Fijar en el grupo', icon: 'i-lucide-pin', onSelect: fijar }] : []),
    ...(x.propia || x.acceso.moderar ? [{ label: 'Eliminar', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: eliminar }] : []),
    ...(!x.propia ? [{ label: 'Reportar', icon: 'i-lucide-flag', onSelect: () => abrirReporte(`/api/comunidad/publicaciones/${x.id}/reportes`) }] : []),
  ]
})

const comentario = ref('')
const { enviando, error, enviar } = useEnvio()
async function comentar() {
  const r = await enviar(() => api(`/api/comunidad/publicaciones/${id}/comentarios`, { method: 'POST', body: { contenido: comentario.value } }))
  if (r.ok) {
    comentario.value = ''
    refresh()
  }
}

function alEditar() {
  editando.value = false
  toast.add({ title: 'Publicación actualizada', color: 'success', icon: 'i-lucide-check' })
  refresh()
}
async function fijar() {
  await enviar(() => api(`/api/comunidad/publicaciones/${id}/fijar`, { method: 'POST', body: { fijada: !p.value!.fijada } }))
  refresh()
}
async function eliminar() {
  const propia = p.value!.propia
  const motivo = propia ? null : prompt('Motivo de la eliminación (se le comunicará al autor):')
  if (!propia && motivo === null) return
  if (propia && !confirm('¿Eliminar su publicación?')) return
  const r = await enviar(() => api(`/api/comunidad/publicaciones/${id}/eliminar`, { method: 'POST', body: { motivo } }))
  if (r.ok) {
    toast.add({ title: 'Publicación eliminada', color: 'success', icon: 'i-lucide-check' })
    if (propia) await navigateTo(`/plataforma/comunidad/${p.value!.grupo.slug}`)
    else refresh()
  }
}
async function quitarAdjunto(adjuntoId: string) {
  if (!confirm('¿Quitar este archivo?')) return
  await enviar(() => api(`/api/comunidad/adjuntos/${adjuntoId}`, { method: 'DELETE' }))
  refresh()
}

const reporteAbierto = ref(false)
const reporteUrl = ref('')
function abrirReporte(url: string) {
  reporteUrl.value = url
  reporteAbierto.value = true
}
</script>
