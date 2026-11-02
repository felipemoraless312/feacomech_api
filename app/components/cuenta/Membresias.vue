<!-- Historial de afiliaciones del usuario y solicitud de afiliación a una organización -->
<template>
  <GrupoDatos titulo="Mis organizaciones">
    <template #acciones>
      <UButton label="Solicitar afiliación" icon="i-lucide-plus" size="xs" color="neutral" variant="ghost" @click="abierto = true" />
    </template>
    <EstadoVacio
      v-if="!membresias.length"
      icono="i-lucide-landmark"
      titulo="Aún no pertenece a ninguna organización"
      descripcion="Solicite su afiliación a su colegio o asociación; la Federación la valida."
    />
    <div v-for="m in membresias" :key="m.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
      <LogoOrganizacion :logo-id="m.organizacion.logoId" :nombre="m.organizacion.nombre" />
      <div class="min-w-0 flex-1">
        <p class="font-medium text-highlighted">
          {{ m.organizacion.nombre }}
        </p>
        <p class="text-sm text-muted">
          <template v-if="m.estado === 'SOLICITADA'">
            Solicitada el {{ formatoFecha(m.solicitadaEn) }}
          </template>
          <template v-else-if="m.estado === 'RECHAZADA'">
            No aprobada<template v-if="m.motivo">
              : {{ m.motivo }}
            </template>
          </template>
          <template v-else>
            {{ fechaCorta(m.desde) }} – {{ m.hasta ? fechaCorta(m.hasta) : 'actual' }}<template v-if="m.numeroSocio">
              · Socio {{ m.numeroSocio }}
            </template>
          </template>
        </p>
      </div>
      <UBadge v-if="m.estado === 'ACTIVA' && m.bajaSolicitadaEn" label="Baja solicitada" color="warning" variant="soft" size="sm" />
      <EstadoPunto :texto="NOMBRE_MEMBRESIA[m.estado]" :tono="TONO_MEMBRESIA[m.estado]" />
      <UButton v-if="m.estado === 'ACTIVA' && !m.bajaSolicitadaEn" icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Solicitar baja" @click="pedirBaja(m.id)" />
    </div>

    <UModal v-model:open="abierto" title="Solicitar afiliación">
      <template #body>
        <UForm :schema="solicitudPropiaSchema" :state="estado" class="space-y-4" @submit="solicitar">
          <UFormField label="Colegio o asociación" name="organizacionId" required>
            <USelectMenu v-model="estado.organizacionId" :items="opciones" value-key="value" placeholder="Elija una organización" class="w-full" />
          </UFormField>
          <UFormField label="Comentario" name="comentario" help="Opcional: número de socio, fecha de ingreso…">
            <UTextarea v-model="estado.comentario" :rows="2" autoresize class="w-full" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
            <UButton type="submit" label="Enviar solicitud" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>

    <DialogoMotivo
      v-model:open="bajaAbierta"
      titulo="Solicitar baja"
      descripcion="La Federación confirmará su baja; su historial se conserva."
      confirmar="Solicitar baja"
      color="warning"
      :accion="m => api(`/api/membresias/${bajaId}/solicitar-baja`, { method: 'POST', body: { motivo: m } })"
      @hecho="hecho('Baja solicitada')"
    />
  </GrupoDatos>
</template>

<script setup lang="ts">
import { NOMBRE_MEMBRESIA, NOMBRE_TIPO, solicitudPropiaSchema } from '#shared/schemas/organizacion'
import { formatoFecha } from '#shared/texto'
import type { MiMembresiaDto } from '~~/server/services/membresias'

const api = useApi()
const toast = useToast()

const { data: membresias, refresh } = await useAsyncData('mis-membresias', () => api<MiMembresiaDto[]>('/api/cuenta/membresias'), { default: () => [] })

const abierto = ref(false)
const estado = reactive({ organizacionId: undefined as string | undefined, comentario: '' })
const { data: disponibles } = await useAsyncData(
  'organizaciones-disponibles',
  () => api<{ id: string, nombre: string, tipo: 'COLEGIO' | 'ASOCIACION', municipio: string | null }[]>('/api/organizaciones/disponibles'),
  { default: () => [] },
)
const opciones = computed(() => disponibles.value.map(o => ({ label: o.nombre, description: [NOMBRE_TIPO[o.tipo], o.municipio].filter(Boolean).join(' · '), value: o.id })))
watch(abierto, a => a && Object.assign(estado, { organizacionId: undefined, comentario: '' }))

const { enviando, error, enviar } = useEnvio()
async function solicitar() {
  const r = await enviar(() => api('/api/cuenta/membresias', { method: 'POST', body: estado }))
  if (r.ok) {
    abierto.value = false
    hecho('Solicitud enviada a la Federación')
  }
}

const bajaAbierta = ref(false)
const bajaId = ref('')
function pedirBaja(id: string) {
  bajaId.value = id
  bajaAbierta.value = true
}

function hecho(titulo: string) {
  toast.add({ title: titulo, color: 'success', icon: 'i-lucide-check' })
  refresh()
}
</script>
