<template>
  <PanelPagina id="grupo" :titulo="grupo?.nombre ?? 'Grupo'" tamano="xl">
    <template #acciones>
      <UButton to="/plataforma/comunidad" icon="i-lucide-arrow-left" label="Comunidad" color="neutral" variant="ghost" class="hidden sm:inline-flex" />
    </template>

    <div v-if="grupo" class="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside class="hidden lg:block">
        <ComunidadListaGrupos :grupos="grupos?.grupos ?? []" :activo="grupo.slug" class="sticky top-4" />
      </aside>

      <div class="min-w-0 space-y-5">
        <!-- Encabezado del grupo -->
        <header class="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-marca-700 to-marca-950 px-6 py-7 text-white">
          <MarcaRed class="pointer-events-none absolute -right-16 -top-16 -z-10 size-64 text-white/10" />
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-marca-200">
            {{ NOMBRE_TIPO_GRUPO[grupo.tipo] }} · {{ grupo.privacidad === 'PRIVADO' ? 'Privado' : grupo.privacidad === 'MIEMBROS' ? 'Publican los miembros' : 'Abierto' }}
          </p>
          <h1 class="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            {{ grupo.nombre }}
          </h1>
          <p v-if="grupo.descripcion" class="mt-2 max-w-2xl text-white/80">
            {{ grupo.descripcion }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <UBadge v-if="!grupo.activo" label="Grupo inactivo" color="neutral" />
            <UButton v-if="puedeUnirse" :label="grupo.privacidad === 'PRIVADO' ? 'Solicitar ingreso' : 'Unirme'" icon="i-lucide-user-plus" size="sm" class="bg-white text-marca-900 hover:bg-marca-50" :loading="enviando" @click="unirse" />
            <UBadge v-else-if="grupo.acceso.pendiente" label="Solicitud en revisión" color="warning" />
            <UButton v-else-if="grupo.acceso.miembro && grupo.tipo !== 'ORGANIZACION'" label="Salir del grupo" size="sm" class="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" @click="salir" />
            <UButton v-if="grupo.puedeEditar" label="Configurar" icon="i-lucide-settings" size="sm" class="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" @click="editarAbierto = true" />
          </div>
        </header>

        <!-- Solicitudes de ingreso (moderación) -->
        <GrupoDatos v-if="grupo.pendientes.length" :titulo="`Solicitudes de ingreso (${grupo.pendientes.length})`">
          <div v-for="s in grupo.pendientes" :key="s.usuario.id" class="flex items-center gap-3 px-5 py-3">
            <FotoPerfil :foto-id="s.usuario.perfil?.fotoId" :nombre="nombreCompleto(s.usuario)" />
            <div class="min-w-0 flex-1">
              <p class="font-medium text-highlighted">
                {{ nombreCompleto(s.usuario) }}
              </p>
              <p class="text-sm text-muted">
                {{ s.usuario.perfil?.especialidad?.nombre ?? 'Sin especialidad' }}
              </p>
            </div>
            <UButton label="Rechazar" size="xs" color="neutral" variant="ghost" @click="resolver(s.usuario.id, false)" />
            <UButton label="Aprobar" size="xs" @click="resolver(s.usuario.id, true)" />
          </div>
        </GrupoDatos>

        <div v-if="grupo.acceso.publicar && grupo.activo" class="rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <ComunidadCompositor :grupo-id="grupo.id" @publicado="() => refresh()" />
        </div>
        <p v-else-if="grupo.privacidad === 'MIEMBROS' && !grupo.acceso.miembro" class="text-sm text-muted">
          Únase al grupo para publicar.
        </p>

        <EstadoVacio v-if="status !== 'pending' && !pagina?.datos.length" icono="i-lucide-message-circle" titulo="Aún no hay publicaciones en este grupo" />
        <ComunidadTarjetaPublicacion v-for="p in pagina?.datos" :key="p.id" :p="p" @reportar="reportar" />
        <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="flex justify-center">
          <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
        </div>
      </div>
    </div>

    <ComunidadDialogoReporte v-model:open="reporteAbierto" :url="reporteUrl" />
    <UModal v-model:open="editarAbierto" title="Configurar grupo">
      <template #body>
        <ComunidadFormGrupo v-if="grupo" :grupo="grupo" @cerrar="editarAbierto = false" @guardado="alGuardar" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Pagina } from '#shared/schemas/comunes'
import { NOMBRE_TIPO_GRUPO } from '#shared/schemas/comunidad'
import { nombreCompleto } from '#shared/texto'
import type { GrupoDetalle, GruposDto, PublicacionFila } from '~~/server/services/comunidad'

definePageMeta({ layout: 'plataforma' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const slug = computed(() => String(route.params.slug))
const POR_PAGINA = 15

const { data: grupos, refresh: refrescarGrupos } = await useAsyncData('comunidad-grupos', () => api<GruposDto>('/api/comunidad/grupos'))
const { data: grupo, refresh: refrescarGrupo } = await useAsyncData(`grupo-${slug.value}`, () => api<GrupoDetalle>(`/api/comunidad/grupos/${slug.value}`))
useSeoMeta({ title: () => grupo.value?.nombre ?? 'Grupo' })

const numeroPagina = ref(1)
const { data: pagina, status, refresh } = await useAsyncData(
  `grupo-publicaciones-${slug.value}`,
  () => api<Pagina<PublicacionFila>>('/api/comunidad/publicaciones', { query: { grupoId: grupo.value?.id, pagina: numeroPagina.value, porPagina: POR_PAGINA } }),
  { watch: [numeroPagina] },
)

const puedeUnirse = computed(() => !!grupo.value && grupo.value.activo && grupo.value.tipo !== 'ORGANIZACION' && grupo.value.privacidad !== 'ABIERTO' && !grupo.value.acceso.miembro && !grupo.value.acceso.pendiente)

const { enviando, enviar } = useEnvio()
async function unirse() {
  const r = await enviar(() => api<{ estado: string }>(`/api/comunidad/grupos/${grupo.value!.id}/unirse`, { method: 'POST' }))
  if (r.ok) {
    toast.add({ title: r.valor.estado === 'ACTIVO' ? 'Ahora es miembro del grupo' : 'Solicitud enviada a la moderación', color: 'success', icon: 'i-lucide-check' })
    await Promise.all([refrescarGrupo(), refrescarGrupos()])
  }
  else toast.add({ title: 'No se pudo unir al grupo', color: 'error', icon: 'i-lucide-circle-alert' })
}
async function salir() {
  if (!confirm('¿Salir del grupo?')) return
  await api(`/api/comunidad/grupos/${grupo.value!.id}/salir`, { method: 'POST' })
  await Promise.all([refrescarGrupo(), refrescarGrupos()])
}
async function resolver(usuarioId: string, aprobar: boolean) {
  try {
    await api(`/api/comunidad/grupos/${grupo.value!.id}/solicitudes/${usuarioId}`, { method: 'POST', body: { aprobar } })
    toast.add({ title: aprobar ? 'Solicitud aprobada' : 'Solicitud rechazada', color: 'success', icon: 'i-lucide-check' })
    await Promise.all([refrescarGrupo(), refrescarGrupos()])
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

const reporteAbierto = ref(false)
const reporteUrl = ref('')
function reportar(id: string) {
  reporteUrl.value = `/api/comunidad/publicaciones/${id}/reportes`
  reporteAbierto.value = true
}

const editarAbierto = ref(false)
function alGuardar() {
  editarAbierto.value = false
  toast.add({ title: 'Grupo actualizado', color: 'success', icon: 'i-lucide-check' })
  refrescarGrupo()
  refrescarGrupos()
}
</script>
