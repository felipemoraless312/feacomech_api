<template>
  <PanelPagina id="seguridad" titulo="Seguridad" tamano="md">
    <div class="space-y-10">
      <EncabezadoPagina titulo="Seguridad de su cuenta">
        Contraseña y dispositivos con sesión abierta.
      </EncabezadoPagina>

      <GrupoDatos titulo="Contraseña">
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p class="text-[15px] text-muted">
            Al cambiarla se cierran sus sesiones en otros dispositivos.
          </p>
          <UButton to="/plataforma/cambiar-password" label="Cambiar contraseña" icon="i-lucide-key-round" color="neutral" variant="soft" />
        </div>
      </GrupoDatos>

      <GrupoDatos titulo="Sesiones abiertas">
        <template #acciones>
          <UButton v-if="otras" label="Cerrar las demás" size="xs" color="error" variant="ghost" @click="confirmarOtras = true" />
        </template>
        <div v-if="status === 'pending' && !sesiones.length" class="px-5 py-6 text-center text-muted">
          Cargando…
        </div>
        <div v-for="s in sesiones" :key="s.id" class="flex items-center gap-4 px-5 py-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted">
            <UIcon :name="icono(s.dispositivo)" class="size-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ s.dispositivo }}
              <UBadge v-if="s.actual" label="Este dispositivo" color="primary" variant="soft" size="sm" class="ml-1" />
            </p>
            <p class="truncate text-sm text-muted">
              Inició {{ formatoFechaHora(s.creadaEn) }} · Última actividad {{ formatoFechaHora(s.ultimaActividad) }}<template v-if="s.ip">
                · {{ s.ip }}
              </template>
            </p>
          </div>
          <UButton v-if="!s.actual" icon="i-lucide-log-out" color="neutral" variant="ghost" aria-label="Cerrar esta sesión" @click="cerrar(s.id)" />
        </div>
      </GrupoDatos>
    </div>

    <UModal v-model:open="confirmarOtras" title="Cerrar las demás sesiones">
      <template #body>
        <p class="text-sm">
          Se cerrará su sesión en los otros {{ otras }} dispositivo(s). Esta sesión seguirá abierta.
        </p>
      </template>
      <template #footer>
        <UButton label="Cancelar" color="neutral" variant="ghost" @click="confirmarOtras = false" />
        <UButton label="Cerrar sesiones" color="error" @click="cerrarOtras" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { formatoFechaHora } from '#shared/texto'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Seguridad' })

const api = useApi()
const toast = useToast()

interface SesionDto { id: string, creadaEn: string, ultimaActividad: string, ip: string | null, dispositivo: string, actual: boolean }
const { data: sesiones, status, refresh } = await useAsyncData('sesiones', () => api<SesionDto[]>('/api/cuenta/sesiones'), { default: () => [] })
const otras = computed(() => sesiones.value.filter(s => !s.actual).length)
const confirmarOtras = ref(false)

const icono = (d: string) => /iPhone|Android/.test(d) ? 'i-lucide-smartphone' : /iPad/.test(d) ? 'i-lucide-tablet' : 'i-lucide-monitor'

async function cerrar(id: string) {
  try {
    await api(`/api/cuenta/sesiones/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Sesión cerrada', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

async function cerrarOtras() {
  try {
    const { cerradas } = await api<{ cerradas: number }>('/api/cuenta/sesiones/cerrar-otras', { method: 'POST' })
    confirmarOtras.value = false
    toast.add({ title: `${cerradas} sesión(es) cerrada(s)`, color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
