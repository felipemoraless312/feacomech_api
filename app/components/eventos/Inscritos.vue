<!-- Inscritos de un evento: asistencia por día, constancias y lista en CSV -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <USelect v-model="dia" :items="dias" value-key="value" class="w-48" aria-label="Día de asistencia" />
      <UButton :disabled="!seleccion.length" label="Marcar asistencia" icon="i-lucide-check" size="sm" color="neutral" variant="soft" @click="asistencia(true)" />
      <UButton :disabled="!seleccion.length" label="Quitar asistencia" size="sm" color="neutral" variant="ghost" @click="asistencia(false)" />
      <UButton v-if="puede('constancia.emitir')" :disabled="!seleccion.length" label="Emitir constancias" icon="i-lucide-award" size="sm" class="ml-auto" :loading="emitiendo" @click="emitir" />
      <UButton :to="`/api/eventos/gestion/${evento.id}/inscritos-csv`" external target="_blank" icon="i-lucide-download" label="CSV" size="sm" color="neutral" variant="ghost" />
    </div>
    <p class="text-xs text-dimmed">
      Seleccione inscritos para registrar su asistencia del día elegido. Las constancias se emiten a confirmados con al menos un día de asistencia.
    </p>

    <div class="overflow-x-auto rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio v-if="!inscritos.length" icono="i-lucide-users" titulo="Aún no hay inscritos" />
      <table v-else class="w-full min-w-[640px] text-sm">
        <thead class="border-b border-default text-left text-xs font-medium uppercase tracking-wide text-dimmed">
          <tr>
            <th class="w-10 px-4 py-3">
              <UCheckbox :model-value="todos" :indeterminate="seleccion.length > 0 && !todos" aria-label="Seleccionar todos" @update:model-value="seleccionarTodos(!!$event)" />
            </th>
            <th class="px-3 py-3">
              Participante
            </th>
            <th class="px-3 py-3">
              Estado
            </th>
            <th class="px-3 py-3">
              Asistencia
            </th>
            <th class="px-4 py-3">
              Constancia
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="i in inscritos" :key="i.id" :class="{ 'opacity-50': i.estado === 'CANCELADA' }">
            <td class="px-4 py-2.5">
              <UCheckbox v-if="i.estado === 'CONFIRMADA'" :model-value="seleccion.includes(i.id)" :aria-label="`Seleccionar a ${nombreCompleto(i.usuario)}`" @update:model-value="alternar(i.id, !!$event)" />
            </td>
            <td class="px-3 py-2.5">
              <p class="font-medium text-highlighted">
                {{ nombreCompleto(i.usuario) }}
              </p>
              <p class="text-xs text-muted">
                {{ i.usuario.email }}
              </p>
            </td>
            <td class="px-3 py-2.5">
              <EstadoPunto :texto="NOMBRE_INSCRIPCION[i.estado]" :tono="i.estado === 'CONFIRMADA' ? 'exito' : i.estado === 'LISTA_ESPERA' ? 'alerta' : 'neutro'" />
            </td>
            <td class="px-3 py-2.5">
              <span class="flex flex-wrap gap-1">
                <UBadge v-for="d in evento.dias" :key="d" :label="diaCorto(d)" size="sm" :color="i.asistencias.includes(d) ? 'primary' : 'neutral'" :variant="i.asistencias.includes(d) ? 'solid' : 'outline'" />
              </span>
            </td>
            <td class="px-4 py-2.5">
              <span v-if="i.constancia" class="flex items-center gap-2">
                <NuxtLink :to="`/imprimir/constancia/${i.constancia.id}`" class="font-mono text-xs text-primary hover:underline">{{ i.constancia.folio }}</NuxtLink>
                <UBadge v-if="i.constancia.revocadaEn" label="Revocada" color="error" variant="soft" size="sm" />
                <UButton v-else-if="puede('constancia.emitir')" icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Revocar constancia" @click="pedirRevocar(i.constancia.id)" />
              </span>
              <span v-else class="text-dimmed">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DialogoMotivo
      v-model:open="revocarAbierto"
      titulo="Revocar constancia"
      descripcion="La constancia dejará de ser válida al verificarse. Esta acción queda en la bitácora."
      confirmar="Revocar"
      :accion="m => api(`/api/constancias/${revocarId}/revocar`, { method: 'POST', body: { motivo: m } })"
      @hecho="hecho('Constancia revocada')"
    />
  </div>
</template>

<script setup lang="ts">
import { NOMBRE_INSCRIPCION } from '#shared/schemas/eventos'
import { nombreCompleto } from '#shared/texto'
import type { EventoGestion, InscritoDto } from '~~/server/services/eventos'

const props = defineProps<{ evento: EventoGestion }>()
const emit = defineEmits<{ cambio: [] }>()
const api = useApi()
const toast = useToast()
const { puede } = usePermisos()

const { data: inscritos, refresh } = await useAsyncData(`inscritos-${props.evento.id}`, () => api<InscritoDto[]>(`/api/eventos/gestion/${props.evento.id}/inscritos`), { default: () => [] })

const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
const dias = computed(() => props.evento.dias.map(d => ({ label: diaCorto(d), value: d })))
const dia = ref(props.evento.dias.includes(hoy) ? hoy : props.evento.dias[0] ?? hoy)

const seleccion = ref<string[]>([])
const confirmados = computed(() => inscritos.value.filter(i => i.estado === 'CONFIRMADA').map(i => i.id))
const todos = computed(() => confirmados.value.length > 0 && seleccion.value.length === confirmados.value.length)
function alternar(id: string, marcado: boolean) {
  seleccion.value = marcado ? [...seleccion.value, id] : seleccion.value.filter(x => x !== id)
}
function seleccionarTodos(marcado: boolean) {
  seleccion.value = marcado ? [...confirmados.value] : []
}

function hecho(titulo: string, descripcion?: string) {
  toast.add({ title: titulo, description: descripcion, color: 'success', icon: 'i-lucide-check' })
  refresh()
  emit('cambio')
}

async function asistencia(asistio: boolean) {
  try {
    await api(`/api/eventos/gestion/${props.evento.id}/asistencia`, { method: 'POST', body: { inscripcionIds: seleccion.value, fecha: dia.value, asistio } })
    hecho(asistio ? 'Asistencia registrada' : 'Asistencia retirada')
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

const emitiendo = ref(false)
async function emitir() {
  emitiendo.value = true
  try {
    const r = await api<{ emitidas: number, omitidas: number }>(`/api/eventos/gestion/${props.evento.id}/constancias`, { method: 'POST', body: { inscripcionIds: seleccion.value } })
    hecho(`${r.emitidas} constancia(s) emitida(s)`, r.omitidas ? `${r.omitidas} omitida(s): ya tenían constancia o no tienen asistencia.` : undefined)
    seleccion.value = []
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    emitiendo.value = false
  }
}

const revocarAbierto = ref(false)
const revocarId = ref('')
function pedirRevocar(id: string) {
  revocarId.value = id
  revocarAbierto.value = true
}
</script>
