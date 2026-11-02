<template>
  <UDashboardPanel id="bitacora">
    <template #header>
      <UDashboardNavbar title="Bitácora">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-6xl space-y-6 py-4 sm:py-8">
        <EncabezadoPagina titulo="Bitácora de auditoría">
          Registro inalterable de cambios, validaciones, descargas, consultas e inicios de sesión. Nadie puede modificarlo ni borrarlo.
        </EncabezadoPagina>

        <div class="grid gap-3 sm:grid-cols-5">
          <UInput v-model="filtros.entidad" placeholder="Entidad (Usuario, Rol…)" icon="i-lucide-box" />
          <USelect v-model="filtros.accion" :items="acciones" placeholder="Acción" />
          <UInput v-model="filtros.usuario" placeholder="Usuario o correo" icon="i-lucide-user" />
          <UInput v-model="filtros.desde" type="date" aria-label="Desde" />
          <UInput v-model="filtros.hasta" type="date" aria-label="Hasta" />
        </div>

        <div class="overflow-x-auto rounded-2xl bg-default shadow-tarjeta">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="border-b border-default text-xs font-medium uppercase tracking-wide text-dimmed">
              <tr>
                <th class="px-5 py-3">
                  Fecha
                </th><th class="px-3 py-3">
                  Usuario
                </th><th class="px-3 py-3">
                  Acción
                </th><th class="px-3 py-3">
                  Entidad
                </th><th class="px-3 py-3">
                  Motivo
                </th><th class="px-5 py-3">
                  IP
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-if="!pagina?.datos.length">
                <td colspan="6" class="px-5 py-10 text-center text-muted">
                  Sin registros con esos filtros
                </td>
              </tr>
              <template v-for="r in pagina?.datos" :key="r.id">
                <tr class="cursor-pointer hover:bg-muted/60" @click="abierto = abierto === r.id ? null : r.id">
                  <td class="whitespace-nowrap px-5 py-2.5 text-muted">
                    {{ formatoFechaHora(r.fecha) }}
                  </td>
                  <td class="px-3 py-2.5">
                    {{ r.usuario ? r.usuario.email : '—' }}
                  </td>
                  <td class="px-3 py-2.5">
                    <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{{ r.accion }}</span>
                  </td>
                  <td class="px-3 py-2.5">
                    {{ r.entidad }} <span class="font-mono text-xs text-dimmed">{{ r.entidadId.slice(0, 8) }}</span>
                  </td>
                  <td class="max-w-64 truncate px-3 py-2.5 text-muted">
                    {{ r.motivo }}
                  </td>
                  <td class="px-5 py-2.5 font-mono text-xs text-dimmed">
                    {{ r.ip }}
                  </td>
                </tr>
                <tr v-if="abierto === r.id">
                  <td colspan="6" class="bg-muted px-5 py-3">
                    <div class="grid gap-3 text-xs sm:grid-cols-2">
                      <div>
                        <p class="mb-1 font-semibold">
                          Antes
                        </p><pre class="max-h-64 overflow-auto whitespace-pre-wrap break-all">{{ r.antes ? JSON.stringify(r.antes, null, 2) : '—' }}</pre>
                      </div>
                      <div>
                        <p class="mb-1 font-semibold">
                          Después
                        </p><pre class="max-h-64 overflow-auto whitespace-pre-wrap break-all">{{ r.despues ? JSON.stringify(r.despues, null, 2) : '—' }}</pre>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div v-if="(pagina?.total ?? 0) > 50" class="flex justify-center">
          <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="50" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { formatoFechaHora } from '#shared/texto'

definePageMeta({ layout: 'plataforma', permiso: 'auditoria.ver' })
useSeoMeta({ title: 'Bitácora' })

const api = useApi()
const acciones = ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CONSULTAR', 'DESCARGAR', 'VALIDAR', 'RECHAZAR', 'LOGIN', 'LOGIN_FALLIDO', 'LOGOUT']
const filtros = reactive({ entidad: '', accion: undefined as string | undefined, usuario: '', desde: '', hasta: '' })
const f = refDebounced(computed(() => ({ ...filtros })), 300)
const numeroPagina = ref(1)
watch(f, () => { numeroPagina.value = 1 })
const abierto = ref<string | null>(null)

interface Fila { id: string, fecha: string, accion: string, entidad: string, entidadId: string, motivo: string | null, ip: string | null, antes: unknown, despues: unknown, usuario: { email: string } | null }
const { data: pagina } = await useAsyncData(
  'bitacora',
  () => api<{ total: number, datos: Fila[] }>('/api/auditoria', {
    query: Object.fromEntries(Object.entries({ ...f.value, pagina: numeroPagina.value, porPagina: 50 }).filter(([, v]) => v !== '' && v !== undefined)),
  }),
  { watch: [f, numeroPagina] },
)
</script>
