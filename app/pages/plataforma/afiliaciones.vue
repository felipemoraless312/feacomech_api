<template>
  <PanelPagina id="afiliaciones" titulo="Afiliaciones" tamano="lg">
    <div class="space-y-10">
      <EncabezadoPagina titulo="Solicitudes pendientes">
        <template v-if="puede('afiliacion.validar')">
          Altas y bajas de integrantes, y cambios a los datos de las organizaciones que esperan su resolución.
        </template>
        <template v-else>
          Estado de las solicitudes de sus organizaciones; las resuelve la Federación.
        </template>
      </EncabezadoPagina>

      <!-- Altas -->
      <GrupoDatos :titulo="`Solicitudes de alta (${altas.length})`">
        <EstadoVacio v-if="!altas.length" icono="i-lucide-inbox" titulo="No hay solicitudes de alta pendientes" />
        <div v-for="m in altas" :key="m.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
          <FotoPerfil :foto-id="m.usuario.perfil?.fotoId" :nombre="nombreCompleto(m.usuario)" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(m.usuario) }}
            </p>
            <p class="text-sm text-muted">
              <NuxtLink :to="`/plataforma/organizaciones/${m.organizacion.id}`" class="hover:text-primary">
                {{ m.organizacion.nombre }}
              </NuxtLink>
              · {{ m.usuario.perfil?.especialidad?.nombre ?? 'Sin especialidad' }} · {{ formatoFechaHora(m.solicitadaEn) }}
            </p>
          </div>
          <UButton v-if="puede('afiliacion.validar')" label="Resolver" size="sm" @click="resolver(m)" />
          <EstadoPunto v-else texto="En revisión" tono="info" />
        </div>
      </GrupoDatos>

      <!-- Bajas solicitadas -->
      <GrupoDatos :titulo="`Bajas solicitadas (${bajas.length})`">
        <EstadoVacio v-if="!bajas.length" icono="i-lucide-inbox" titulo="No hay bajas por confirmar" />
        <div v-for="m in bajas" :key="m.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
          <FotoPerfil :foto-id="m.usuario.perfil?.fotoId" :nombre="nombreCompleto(m.usuario)" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(m.usuario) }} <span class="font-normal text-muted">· {{ m.organizacion.nombre }}</span>
            </p>
            <p class="text-sm text-muted">
              Motivo: {{ m.motivo }}
            </p>
          </div>
          <UButton v-if="puede('afiliacion.validar')" label="Confirmar baja" size="sm" color="error" variant="soft" @click="confirmarBaja(m)" />
          <EstadoPunto v-else texto="En revisión" tono="info" />
        </div>
      </GrupoDatos>

      <!-- Cambios de datos -->
      <GrupoDatos :titulo="`Cambios a datos de organizaciones (${datos?.cambios.length ?? 0})`">
        <EstadoVacio v-if="!datos?.cambios.length" icono="i-lucide-inbox" titulo="No hay cambios propuestos" />
        <div v-for="c in datos?.cambios" :key="c.id" class="space-y-3 px-5 py-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-medium text-highlighted">
              {{ c.organizacion.nombre }}
            </p>
            <p class="text-sm text-muted">
              {{ c.solicitadaPor ? `${c.solicitadaPor.nombre} ${c.solicitadaPor.apellidoPaterno} · ` : '' }}{{ formatoFechaHora(c.creadaEn) }}
            </p>
          </div>
          <div class="overflow-x-auto rounded-xl ring-1 ring-default">
            <table class="w-full min-w-[520px] text-sm">
              <thead class="bg-muted text-left text-xs uppercase tracking-wide text-dimmed">
                <tr>
                  <th class="px-3 py-2">
                    Campo
                  </th><th class="px-3 py-2">
                    Actual
                  </th><th class="px-3 py-2">
                    Propuesto
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr v-for="d in diferencias(c)" :key="d.campo">
                  <td class="px-3 py-2 text-muted">
                    {{ d.etiqueta }}
                  </td>
                  <td class="px-3 py-2 text-dimmed line-through">
                    {{ d.antes || '—' }}
                  </td>
                  <td class="px-3 py-2 font-medium text-highlighted">
                    {{ d.despues || '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!diferencias(c).length" class="px-3 py-2 text-sm text-muted">
              Sin diferencias con los datos actuales.
            </p>
          </div>
          <div v-if="puede('organizacion.administrar')" class="flex justify-end gap-2">
            <UButton label="Rechazar" size="sm" color="neutral" variant="ghost" @click="rechazarCambio(c.id)" />
            <UButton label="Aprobar y aplicar" size="sm" :loading="aprobando === c.id" @click="aprobarCambio(c.id)" />
          </div>
        </div>
      </GrupoDatos>
    </div>

    <AfiliacionesResolver v-model:open="resolverAbierto" :solicitud="seleccion" :organizacion="seleccion && 'organizacion' in seleccion ? (seleccion as Fila).organizacion.nombre : undefined" @resuelta="alTerminar('Solicitud resuelta')" />
    <DialogoMotivo
      v-model:open="bajaAbierta"
      titulo="Confirmar baja"
      etiqueta="Motivo de la baja"
      confirmar="Dar de baja"
      :accion="m => api(`/api/membresias/${seleccion!.id}/baja`, { method: 'POST', body: { motivo: m } })"
      @hecho="alTerminar('Baja registrada')"
    >
      <p v-if="seleccion" class="text-sm text-muted">
        Motivo indicado en la solicitud: {{ seleccion.motivo }}
      </p>
    </DialogoMotivo>
    <DialogoMotivo
      v-model:open="rechazoAbierto"
      titulo="Rechazar cambios"
      confirmar="Rechazar"
      :accion="m => api(`/api/solicitudes-cambio/${cambioId}/resolver`, { method: 'POST', body: { aprobar: false, motivo: m } })"
      @hecho="alTerminar('Cambios rechazados')"
    />
  </PanelPagina>
</template>

<script setup lang="ts">
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { BandejaDto } from '~~/server/services/membresias'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Afiliaciones' })

type Fila = BandejaDto['membresias'][number]
type Cambio = BandejaDto['cambios'][number]

const api = useApi()
const toast = useToast()
const { puede } = usePermisos()

const { data: datos, refresh } = await useAsyncData('bandeja-afiliaciones', () => api<BandejaDto>('/api/afiliaciones/bandeja'))
const altas = computed(() => datos.value?.membresias.filter(m => m.estado === 'SOLICITADA') ?? [])
const bajas = computed(() => datos.value?.membresias.filter(m => m.estado === 'ACTIVA' && m.bajaSolicitadaEn) ?? [])

const seleccion = ref<Fila>()
const resolverAbierto = ref(false)
const bajaAbierta = ref(false)
function resolver(m: Fila) {
  seleccion.value = m
  resolverAbierto.value = true
}
function confirmarBaja(m: Fila) {
  seleccion.value = m
  bajaAbierta.value = true
}

function alTerminar(titulo: string) {
  toast.add({ title: titulo, color: 'success', icon: 'i-lucide-check' })
  refresh()
}

// --- Cambios de datos
const CAMPOS = { nombre: 'Nombre', siglas: 'Siglas', descripcion: 'Descripción', fechaConstitucion: 'Constitución', municipio: 'Municipio', direccion: 'Dirección', telefono: 'Teléfono', email: 'Correo', sitioWeb: 'Sitio web' } as const
const texto = (v: unknown) => (v instanceof Date || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) ? String(v).slice(0, 10) : (v ?? '') as string)
function diferencias(c: Cambio) {
  const propuesto = c.datos as Record<string, unknown>
  return (Object.keys(CAMPOS) as (keyof typeof CAMPOS)[])
    .map(campo => ({ campo, etiqueta: CAMPOS[campo], antes: texto(c.organizacion[campo]), despues: texto(propuesto[campo]) }))
    .filter(d => d.antes !== d.despues)
}

const aprobando = ref<string>()
async function aprobarCambio(id: string) {
  aprobando.value = id
  try {
    await api(`/api/solicitudes-cambio/${id}/resolver`, { method: 'POST', body: { aprobar: true } })
    alTerminar('Cambios aplicados')
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    aprobando.value = undefined
  }
}
const rechazoAbierto = ref(false)
const cambioId = ref('')
function rechazarCambio(id: string) {
  cambioId.value = id
  rechazoAbierto.value = true
}
</script>
