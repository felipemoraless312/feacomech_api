<template>
  <PanelPagina id="notificaciones" titulo="Notificaciones" tamano="md">
    <template #acciones>
      <UButton v-if="noLeidas" label="Marcar todas como leídas" icon="i-lucide-check-check" size="sm" color="neutral" variant="ghost" @click="marcarTodas" />
    </template>
    <template #herramientas>
      <UTabs v-model="filtro" :items="pestanas" :content="false" size="sm" variant="link" />
    </template>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio
        v-if="status !== 'pending' && !pagina?.datos.length"
        icono="i-lucide-bell-off"
        :titulo="filtro === 'noLeidas' ? 'No tiene notificaciones sin leer' : 'Aún no tiene notificaciones'"
        descripcion="Aquí verá avisos de su cuenta, afiliaciones, eventos y la comunidad."
      />
      <ul v-else class="divide-y divide-default">
        <li v-for="n in pagina?.datos" :key="n.id">
          <component
            :is="n.enlace ? NuxtLink : 'div'"
            :to="n.enlace ?? undefined"
            class="flex gap-4 px-5 py-4 transition-colors"
            :class="[n.enlace ? 'hover:bg-muted/60' : '', !n.leidaEn ? 'bg-marca-50/50 dark:bg-marca-950/30' : '']"
            @click="marcar(n)"
          >
            <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="n.leidaEn ? 'bg-transparent' : 'bg-primary'" />
            <div class="min-w-0 flex-1">
              <p class="text-[15px] text-highlighted" :class="{ 'font-semibold': !n.leidaEn }">
                {{ n.titulo }}
              </p>
              <p v-if="n.cuerpo" class="mt-0.5 text-sm text-muted">
                {{ n.cuerpo }}
              </p>
              <p class="mt-1 text-xs text-dimmed">
                {{ formatoFechaHora(n.creadaEn) }}
              </p>
            </div>
            <UIcon v-if="n.enlace" name="i-lucide-chevron-right" class="mt-1 size-4 shrink-0 text-dimmed" />
          </component>
        </li>
      </ul>
    </div>
    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="mt-6 flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import type { Pagina } from '#shared/schemas/comunes'
import { formatoFechaHora } from '#shared/texto'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Notificaciones' })

const api = useApi()
const { noLeidas, actualizar } = useNotificaciones()

interface NotificacionDto { id: string, titulo: string, cuerpo: string | null, enlace: string | null, leidaEn: string | null, creadaEn: string }

const POR_PAGINA = 25
const filtro = ref<'todas' | 'noLeidas'>('todas')
const pestanas = [{ label: 'Todas', value: 'todas' }, { label: 'Sin leer', value: 'noLeidas' }]
const numeroPagina = ref(1)
watch(filtro, () => (numeroPagina.value = 1))

const { data: pagina, status, refresh } = await useAsyncData(
  'notificaciones',
  () => api<Pagina<NotificacionDto>>('/api/cuenta/notificaciones', {
    query: { soloNoLeidas: filtro.value === 'noLeidas' ? 'true' : undefined, pagina: numeroPagina.value, porPagina: POR_PAGINA },
  }),
  { watch: [filtro, numeroPagina] },
)

async function marcar(n: NotificacionDto) {
  if (n.leidaEn) return
  n.leidaEn = new Date().toISOString()
  await api('/api/cuenta/notificaciones/leidas', { method: 'POST', body: { ids: [n.id] } }).catch(() => {})
  actualizar()
}

async function marcarTodas() {
  await api('/api/cuenta/notificaciones/leidas', { method: 'POST', body: {} })
  await Promise.all([refresh(), actualizar()])
}
</script>
