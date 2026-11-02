<template>
  <PanelPagina id="moderacion" titulo="Comunidad y foro" tamano="lg">
    <template #acciones>
      <UButton v-if="grupos?.puedeCrear" icon="i-lucide-plus" label="Nuevo grupo" @click="nuevoAbierto = true" />
    </template>

    <div class="space-y-10">
      <EncabezadoPagina titulo="Moderación">
        Reportes pendientes de los grupos que modera. Los reportes por posibles datos de pacientes aparecen primero.
      </EncabezadoPagina>

      <GrupoDatos :titulo="`Reportes pendientes (${reportes.length})`">
        <EstadoVacio v-if="!reportes.length" icono="i-lucide-shield-check" titulo="No hay reportes pendientes" />
        <div v-for="r in reportes" :key="r.id" class="space-y-3 px-5 py-4">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge :label="NOMBRE_MOTIVO[r.motivo]" :color="r.motivo === 'DATOS_PACIENTE' ? 'error' : 'warning'" variant="soft" />
            <span class="text-sm text-muted">{{ grupoDe(r) }} · {{ formatoFechaHora(r.creadoEn) }} · reportó {{ r.reportadoPor.nombre }} {{ r.reportadoPor.apellidoPaterno }}</span>
          </div>
          <p v-if="r.detalle" class="text-sm text-muted">
            «{{ r.detalle }}»
          </p>
          <div class="rounded-xl bg-muted p-4">
            <p class="text-xs text-dimmed">
              {{ r.publicacion ? 'Publicación' : 'Comentario' }} de {{ autorDe(r) }}
            </p>
            <p v-if="r.publicacion?.titulo" class="mt-1 font-medium text-highlighted">
              {{ r.publicacion.titulo }}
            </p>
            <p class="mt-1 line-clamp-4 whitespace-pre-line text-sm text-highlighted">
              {{ r.publicacion?.contenido ?? r.comentario?.contenido }}
            </p>
            <NuxtLink :to="`/plataforma/comunidad/publicacion/${r.publicacion?.id ?? r.comentario?.publicacionId}`" class="mt-2 inline-block text-sm text-primary hover:underline">
              Ver en contexto
            </NuxtLink>
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            <UButton label="Desestimar" size="sm" color="neutral" variant="ghost" @click="resolver(r.id, 'DESESTIMAR')" />
            <UButton label="Eliminar contenido" size="sm" color="error" @click="resolver(r.id, 'ELIMINAR')" />
          </div>
        </div>
      </GrupoDatos>

      <GrupoDatos v-if="grupos" titulo="Grupos">
        <div v-for="g in grupos.grupos" :key="g.id" class="flex items-center gap-3 px-5 py-3">
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/plataforma/comunidad/${g.slug}`" class="font-medium text-highlighted hover:text-primary" :class="{ 'text-dimmed line-through': !g.activo }">
              {{ g.nombre }}
            </NuxtLink>
            <p class="text-xs text-muted">
              {{ NOMBRE_TIPO_GRUPO[g.tipo] }} · {{ NOMBRE_PRIVACIDAD[g.privacidad] }} · {{ g.publicaciones }} publicación(es) · {{ g.miembros }} miembro(s) registrados
            </p>
          </div>
          <UBadge v-if="g.solicitudes" :label="`${g.solicitudes} solicitud(es)`" color="warning" variant="soft" size="sm" />
        </div>
      </GrupoDatos>
    </div>

    <UModal v-model:open="nuevoAbierto" title="Nuevo grupo">
      <template #body>
        <ComunidadFormGrupo @cerrar="nuevoAbierto = false" @guardado="alCrear" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NOMBRE_MOTIVO, NOMBRE_PRIVACIDAD, NOMBRE_TIPO_GRUPO } from '#shared/schemas/comunidad'
import { formatoFechaHora } from '#shared/texto'
import type { GruposDto, ReporteDto } from '~~/server/services/comunidad'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Moderación' })

const api = useApi()
const toast = useToast()
const { data: reportes, refresh } = await useAsyncData('reportes', () => api<ReporteDto[]>('/api/comunidad/reportes').catch(() => []), { default: () => [] })
const { data: grupos, refresh: refrescarGrupos } = await useAsyncData('comunidad-grupos', () => api<GruposDto>('/api/comunidad/grupos'))

const grupoDe = (r: ReporteDto) => r.publicacion?.grupo.nombre ?? r.comentario?.publicacion.grupo.nombre
const autorDe = (r: ReporteDto) => { const a = r.publicacion?.autor ?? r.comentario?.autor; return a ? `${a.nombre} ${a.apellidoPaterno}` : '—' }

async function resolver(id: string, decision: 'ELIMINAR' | 'DESESTIMAR') {
  const nota = decision === 'ELIMINAR' ? prompt('Motivo (se le comunicará al autor):') : ''
  if (nota === null) return
  try {
    await api(`/api/comunidad/reportes/${id}`, { method: 'POST', body: { decision, nota } })
    toast.add({ title: decision === 'ELIMINAR' ? 'Contenido eliminado' : 'Reporte desestimado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

const nuevoAbierto = ref(false)
function alCrear() {
  nuevoAbierto.value = false
  toast.add({ title: 'Grupo creado', color: 'success', icon: 'i-lucide-check' })
  refrescarGrupos()
}
</script>
