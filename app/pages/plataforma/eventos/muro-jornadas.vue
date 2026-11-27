<!-- Moderación del muro de las Jornadas 2026: aprobar o rechazar publicaciones, destacarlas,
     marcar las que ya se compartieron en redes, descargar fotos y revisar comentarios reportados. -->
<template>
  <PanelPagina id="muro-jornadas" titulo="Muro · Jornadas 2026" tamano="xl">
    <template #acciones>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" aria-label="Actualizar" :loading="cargando" @click="cargar" />
      <UButton icon="i-lucide-printer" label="Cartel QR" color="neutral" variant="outline" @click="imprimirCartel" />
      <UButton icon="i-lucide-external-link" label="Ver muro" to="/jornadas-2026/muro" target="_blank" />
    </template>
    <template #herramientas>
      <UTabs v-model="vista" :items="pestanas" :content="false" size="sm" />
    </template>

    <div class="space-y-5">
      <AlertaError :mensaje="error" />

      <!-- Publicaciones -->
      <template v-if="vista !== 'COMENTARIOS'">
        <EstadoVacio
          v-if="!cargando && !publicaciones.length"
          :icono="vista === 'PENDIENTE' ? 'i-lucide-inbox' : 'i-lucide-images'"
          :titulo="vista === 'PENDIENTE' ? 'No hay publicaciones por revisar' : vista === 'APROBADA' ? 'Aún no hay publicaciones en el muro' : 'No hay publicaciones rechazadas'"
          :descripcion="vista === 'PENDIENTE' ? 'Esta página se actualiza sola cada 20 segundos.' : undefined"
        />
        <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="p in publicaciones" :key="p.id" class="flex flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta" :class="{ 'ring-2 ring-acento-400': p.destacada }">
            <div v-if="p.fotos.length" class="grid gap-0.5" :class="p.fotos.length === 1 ? 'grid-cols-1' : 'grid-cols-3'">
              <div
                v-for="f in p.fotos"
                :key="f.id"
                class="group relative bg-muted"
                :class="p.fotos.length === 1 ? 'aspect-[4/3]' : 'aspect-square'"
              >
                <a :href="`/api/jornadas/muro/foto/${f.id}/grande`" target="_blank" rel="noopener" class="block size-full">
                  <img :src="`/api/jornadas/muro/foto/${f.id}/mini`" alt="Ver foto completa" loading="lazy" class="size-full object-cover">
                </a>
                <a
                  :href="`/api/jornadas/muro/foto/${f.id}/grande?descargar=1`"
                  class="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Descargar foto"
                  title="Descargar foto"
                >
                  <UIcon name="i-lucide-download" class="size-4" />
                </a>
              </div>
            </div>
            <div class="flex flex-1 flex-col gap-3 p-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-highlighted">{{ p.autor || 'Sin nombre' }}</p>
                  <p class="text-xs text-dimmed">{{ fecha(p.creadoEn) }} · {{ p.fotos.length }} foto(s) · huella {{ p.huella.slice(0, 6) }}</p>
                </div>
                <div class="flex shrink-0 gap-1">
                  <UBadge v-if="p.enRedes" label="En redes" color="info" variant="soft" size="sm" />
                  <UBadge v-if="p.destacada" label="Destacada" color="warning" variant="soft" size="sm" />
                </div>
              </div>
              <p v-if="p.mensaje" class="whitespace-pre-line text-sm text-toned [overflow-wrap:anywhere]">{{ p.mensaje }}</p>
              <p v-if="vista === 'APROBADA'" class="text-xs text-muted">
                <UIcon name="i-lucide-heart" class="size-3.5 align-[-2px]" /> {{ p.meGusta }} · <UIcon name="i-lucide-message-circle" class="size-3.5 align-[-2px]" /> {{ p._count.comentarios }}
              </p>

              <div class="mt-auto flex flex-wrap gap-2 pt-1">
                <template v-if="vista === 'PENDIENTE'">
                  <UButton icon="i-lucide-check" label="Aprobar" color="success" size="sm" :loading="ocupado === p.id" @click="moderar(p, { estado: 'APROBADA' })" />
                  <UButton icon="i-lucide-x" label="Rechazar" color="error" variant="soft" size="sm" :disabled="ocupado === p.id" @click="moderar(p, { estado: 'RECHAZADA' })" />
                </template>
                <template v-else-if="vista === 'APROBADA'">
                  <UButton :icon="p.destacada ? 'i-lucide-star-off' : 'i-lucide-star'" :label="p.destacada ? 'Quitar destacada' : 'Destacar'" color="warning" variant="soft" size="sm" @click="moderar(p, { destacada: !p.destacada })" />
                  <UButton :icon="p.enRedes ? 'i-lucide-undo-2' : 'i-lucide-share-2'" :label="p.enRedes ? 'No compartida' : 'Ya en redes'" color="info" variant="soft" size="sm" @click="moderar(p, { enRedes: !p.enRedes })" />
                  <UButton icon="i-lucide-eye-off" label="Retirar" color="neutral" variant="ghost" size="sm" @click="moderar(p, { estado: 'RECHAZADA' })" />
                </template>
                <template v-else>
                  <UButton icon="i-lucide-check" label="Aprobar" color="success" variant="soft" size="sm" @click="moderar(p, { estado: 'APROBADA' })" />
                </template>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" aria-label="Eliminar" class="ml-auto" @click="eliminar(p)" />
              </div>
            </div>
          </article>
        </div>
      </template>

      <!-- Comentarios -->
      <section v-else class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
        <div class="flex flex-wrap items-center gap-3 border-b border-default px-5 py-3">
          <h2 class="font-display text-base font-bold text-highlighted">Comentarios</h2>
          <UTabs v-model="filtroComentarios" :items="[{ label: 'Reportados u ocultos', value: 'reportados' }, { label: 'Todos', value: 'todos' }]" :content="false" size="xs" class="ml-auto" />
        </div>
        <EstadoVacio v-if="!comentarios.length" icono="i-lucide-message-circle" :titulo="filtroComentarios === 'reportados' ? 'Ningún comentario reportado' : 'Aún no hay comentarios'" />
        <ul v-else class="divide-y divide-default">
          <li v-for="c in comentarios" :key="c.id" class="flex flex-wrap items-start gap-3 px-5 py-3.5">
            <div class="min-w-0 flex-1">
              <p class="text-sm">
                <span class="font-semibold text-highlighted">{{ c.autor || 'Asistente' }}</span>
                <span class="text-dimmed"> · {{ fecha(c.creadoEn) }} · huella {{ c.huella.slice(0, 6) }}</span>
              </p>
              <p class="mt-0.5 text-sm text-toned [overflow-wrap:anywhere]" :class="{ 'line-through opacity-60': c.oculto }">{{ c.texto }}</p>
              <p class="mt-1 truncate text-xs text-dimmed">En: {{ c.publicacion.autor || 'Sin nombre' }}<template v-if="c.publicacion.mensaje"> — «{{ c.publicacion.mensaje.slice(0, 80) }}»</template></p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <UBadge v-if="c.reportes" :label="`${c.reportes} reporte(s)`" color="error" variant="soft" size="sm" />
              <UBadge v-if="c.oculto" label="Oculto" color="neutral" variant="soft" size="sm" />
              <UButton v-if="c.oculto || c.reportes" icon="i-lucide-eye" label="Está bien" size="xs" color="success" variant="soft" @click="moderarComentario(c, false)" />
              <UButton v-if="!c.oculto" icon="i-lucide-eye-off" label="Ocultar" size="xs" color="neutral" variant="soft" @click="moderarComentario(c, true)" />
              <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" aria-label="Eliminar comentario" @click="eliminarComentario(c)" />
            </div>
          </li>
        </ul>
      </section>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import QRCode from 'qrcode'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { HASHTAG_JORNADAS, type EstadoPublicacion } from '#shared/muro-jornadas'
import type { ComentarioModeracion, PublicacionModeracion } from '~~/server/services/muro-jornadas'

definePageMeta({ layout: 'plataforma', permiso: 'evento.gestionar' })
useSeoMeta({ title: 'Muro · Jornadas 2026' })

type Vista = EstadoPublicacion | 'COMENTARIOS'
const api = useApi()
const toast = useToast()

const vista = ref<Vista>('PENDIENTE')
const filtroComentarios = ref<'reportados' | 'todos'>('reportados')
const publicaciones = ref<PublicacionModeracion[]>([])
const comentarios = ref<ComentarioModeracion[]>([])
const conteo = ref<Partial<Record<EstadoPublicacion, number>>>({})
const porRevisarComentarios = ref(0)
const cargando = ref(false)
const ocupado = ref<string | null>(null)
const error = ref('')

const pestanas = computed(() => [
  { label: 'Por revisar', value: 'PENDIENTE', icon: 'i-lucide-inbox', badge: conteo.value.PENDIENTE ? { label: String(conteo.value.PENDIENTE), color: 'warning' as const } : undefined },
  { label: 'En el muro', value: 'APROBADA', icon: 'i-lucide-images', badge: conteo.value.APROBADA ? String(conteo.value.APROBADA) : undefined },
  { label: 'Rechazadas', value: 'RECHAZADA', icon: 'i-lucide-ban' },
  { label: 'Comentarios', value: 'COMENTARIOS', icon: 'i-lucide-message-circle', badge: porRevisarComentarios.value ? { label: String(porRevisarComentarios.value), color: 'error' as const } : undefined },
])

const fecha = (d: Date | string) => new Date(d).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' })

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    if (vista.value === 'COMENTARIOS') {
      comentarios.value = await api<ComentarioModeracion[]>('/api/jornadas/muro/comentarios', { query: { filtro: filtroComentarios.value } })
      const r = await api<{ conteo: typeof conteo.value, comentariosPorRevisar: number }>('/api/jornadas/muro', { query: { estado: 'PENDIENTE' } })
      conteo.value = r.conteo
      porRevisarComentarios.value = r.comentariosPorRevisar
    }
    else {
      const r = await api<{ publicaciones: PublicacionModeracion[], conteo: typeof conteo.value, comentariosPorRevisar: number }>('/api/jornadas/muro', { query: { estado: vista.value } })
      publicaciones.value = r.publicaciones
      conteo.value = r.conteo
      porRevisarComentarios.value = r.comentariosPorRevisar
    }
  }
  catch (e) {
    error.value = errorDeApi(e).mensaje
  }
  finally {
    cargando.value = false
  }
}
watch([vista, filtroComentarios], cargar)
onMounted(cargar)
useIntervalFn(() => { if (document.visibilityState === 'visible' && !ocupado.value) cargar() }, 20_000)

async function moderar(p: PublicacionModeracion, cambios: { estado?: EstadoPublicacion, destacada?: boolean, enRedes?: boolean }) {
  ocupado.value = p.id
  try {
    await api(`/api/jornadas/muro/${p.id}`, { method: 'PATCH', body: cambios })
    if (cambios.estado && cambios.estado !== vista.value) {
      publicaciones.value = publicaciones.value.filter(x => x.id !== p.id)
      toast.add({ title: cambios.estado === 'APROBADA' ? 'Publicada en el muro' : 'Publicación retirada', color: cambios.estado === 'APROBADA' ? 'success' : 'neutral' })
    }
    else Object.assign(p, cambios)
    cargar()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error' })
  }
  finally {
    ocupado.value = null
  }
}

async function eliminar(p: PublicacionModeracion) {
  if (!confirm('¿Eliminar definitivamente esta publicación, sus fotos y sus comentarios?')) return
  try {
    await api(`/api/jornadas/muro/${p.id}`, { method: 'DELETE' })
    publicaciones.value = publicaciones.value.filter(x => x.id !== p.id)
    cargar()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error' })
  }
}

async function moderarComentario(c: ComentarioModeracion, oculto: boolean) {
  try {
    await api(`/api/jornadas/muro/comentarios/${c.id}`, { method: 'PATCH', body: { oculto } })
    cargar()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error' })
  }
}

async function eliminarComentario(c: ComentarioModeracion) {
  if (!confirm('¿Eliminar este comentario?')) return
  try {
    await api(`/api/jornadas/muro/comentarios/${c.id}`, { method: 'DELETE' })
    comentarios.value = comentarios.value.filter(x => x.id !== c.id)
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error' })
  }
}

/** Hoja con el QR del muro en grande para imprimir y pegar en la sede. */
async function imprimirCartel() {
  const url = `${location.origin}/jornadas-2026/muro`
  const qr = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#321f46', light: '#ffffff' } })
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>QR muro · Jornadas 2026</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;margin:0;padding:48px 32px;color:#321f46}
h1{font-size:52px;margin:8px 0;letter-spacing:.02em}p{font-size:22px;margin:6px 0}.qr{width:420px;margin:28px auto}.qr svg{width:100%;height:auto}
.tag{display:inline-block;margin-top:12px;padding:8px 18px;border-radius:999px;background:#d96a22;color:#fff;font-weight:700;font-size:22px}small{color:#666;font-size:14px}</style></head><body>
<p><strong>${J.edicion} Jornadas Académicas FEACOMECH</strong></p><h1>¡Comparte tus fotos!</h1>
<p>Escanea, publica tus mejores momentos y aparece en la pantalla y en nuestras redes sociales.</p>
<div class="qr">${qr}</div><p>${url.replace(/^https?:\/\//, '')}</p><span class="tag">${HASHTAG_JORNADAS}</span>
<p style="margin-top:28px"><small>Cada publicación se revisa antes de mostrarse. No subas fotos de pacientes ni documentos.</small></p>
<script>window.onload=()=>window.print()<\/script></body></html>`)
  w.document.close()
}
</script>
