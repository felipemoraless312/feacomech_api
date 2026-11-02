<!-- Integrantes de una organización: solicitudes, activos y bajas -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar integrante" class="w-full min-w-48 flex-1 sm:max-w-xs" />
      <USelect v-model="filtro" :items="opcionesFiltro" value-key="value" class="w-44" />
      <UButton v-if="puedeSolicitar" icon="i-lucide-user-plus" label="Solicitar alta" class="ml-auto" @click="altaAbierta = true" />
    </div>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio
        v-if="status !== 'pending' && !pagina?.datos.length"
        icono="i-lucide-users"
        titulo="Sin integrantes en esta vista"
        :descripcion="puedeSolicitar ? 'Solicite el alta de los integrantes; la Federación las valida.' : undefined"
      />
      <ul v-else class="divide-y divide-default">
        <li v-for="m in pagina?.datos" :key="m.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
          <FotoPerfil :foto-id="m.usuario.perfil?.fotoId" :nombre="nombreCompleto(m.usuario)" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(m.usuario) }}
            </p>
            <p class="truncate text-sm text-muted">
              {{ m.usuario.perfil?.especialidad?.nombre ?? 'Sin especialidad' }}<template v-if="m.numeroSocio">
                · Socio {{ m.numeroSocio }}
              </template><template v-if="m.desde">
                · Desde {{ fechaCorta(m.desde) }}
              </template>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge v-if="m.bajaSolicitadaEn && m.estado === 'ACTIVA'" label="Baja solicitada" color="warning" variant="soft" size="sm" />
            <EstadoPunto :texto="NOMBRE_MEMBRESIA[m.estado]" :tono="TONO_MEMBRESIA[m.estado]" />
            <UDropdownMenu v-if="acciones(m).length" :items="acciones(m)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones" />
            </UDropdownMenu>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <!-- Solicitud de alta -->
    <UModal v-model:open="altaAbierta" title="Solicitar alta de integrante" :ui="{ content: 'sm:max-w-xl' }">
      <template #body>
        <UForm ref="form" :schema="altaIntegranteSchema" :state="alta" class="space-y-4" @submit="solicitarAlta">
          <p class="text-sm text-muted">
            Si el correo no está registrado se creará su cuenta; recibirá su acceso cuando la Federación valide el alta.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Correo" name="email" required class="sm:col-span-2">
              <UInput v-model="alta.email" type="email" class="w-full" />
            </UFormField>
            <UFormField label="Nombre(s)" name="nombre" required>
              <UInput v-model="alta.nombre" class="w-full" />
            </UFormField>
            <UFormField label="Apellido paterno" name="apellidoPaterno" required>
              <UInput v-model="alta.apellidoPaterno" class="w-full" />
            </UFormField>
            <UFormField label="Apellido materno" name="apellidoMaterno">
              <UInput v-model="alta.apellidoMaterno" class="w-full" />
            </UFormField>
            <UFormField label="Cédula profesional" name="cedulaProfesional">
              <UInput v-model="alta.cedulaProfesional" inputmode="numeric" class="w-full" />
            </UFormField>
            <UFormField label="Especialidad" name="especialidadId">
              <USelectMenu v-model="especialidad" :items="opcionesEspecialidad" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Número de socio" name="numeroSocio">
              <UInput v-model="alta.numeroSocio" class="w-full" />
            </UFormField>
            <UFormField label="Comentario para la Federación" name="comentario" class="sm:col-span-2">
              <UTextarea v-model="alta.comentario" :rows="2" autoresize class="w-full" />
            </UFormField>
          </div>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="altaAbierta = false" />
            <UButton type="submit" label="Enviar solicitud" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>

    <AfiliacionesResolver v-model:open="resolverAbierto" :solicitud="seleccion" @resuelta="alResolver" />

    <DialogoMotivo
      v-model:open="bajaSolicitadaAbierta"
      titulo="Solicitar baja"
      :descripcion="seleccion ? `La Federación confirmará la baja de ${nombreCompleto(seleccion.usuario)}.` : undefined"
      confirmar="Solicitar baja"
      color="warning"
      :accion="m => api(`/api/membresias/${seleccion!.id}/solicitar-baja`, { method: 'POST', body: { motivo: m } })"
      @hecho="hecho('Baja solicitada')"
    />
    <DialogoMotivo
      v-model:open="bajaAbierta"
      titulo="Dar de baja"
      :descripcion="seleccion ? `${nombreCompleto(seleccion.usuario)} dejará de ser integrante activo. Su historial se conserva.` : undefined"
      confirmar="Dar de baja"
      :accion="m => api(`/api/membresias/${seleccion!.id}/baja`, { method: 'POST', body: { motivo: m } })"
      @hecho="hecho('Baja registrada')"
    />
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, Form } from '@nuxt/ui'
import { refDebounced } from '@vueuse/core'
import type { EstadoFormulario, Pagina } from '#shared/schemas/comunes'
import { ESTADOS_MEMBRESIA, NOMBRE_MEMBRESIA, altaIntegranteSchema, type AltaIntegranteInput } from '#shared/schemas/organizacion'
import { nombreCompleto } from '#shared/texto'
import type { IntegranteDto } from '~~/server/services/membresias'
import type { EspecialidadDto } from '~~/server/services/especialidades'

const props = defineProps<{ organizacionId: string }>()
const emit = defineEmits<{ cambio: [] }>()

const api = useApi()
const toast = useToast()
const { puede, puedeEn } = usePermisos()
const puedeSolicitar = computed(() => puedeEn('afiliacion.solicitar', props.organizacionId))
const puedeValidar = computed(() => puede('afiliacion.validar'))

const VIGENTES = '__vigentes__'
const POR_PAGINA = 25
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const filtro = ref(VIGENTES)
const numeroPagina = ref(1)
watch([q, filtro], () => (numeroPagina.value = 1))
const opcionesFiltro = [{ label: 'Activos y solicitudes', value: VIGENTES }, ...ESTADOS_MEMBRESIA.map(e => ({ label: NOMBRE_MEMBRESIA[e], value: e }))]

const { data: pagina, status, refresh } = await useAsyncData(
  `integrantes-${props.organizacionId}`,
  () => api<Pagina<IntegranteDto>>(`/api/organizaciones/${props.organizacionId}/integrantes`, {
    query: { q: q.value || undefined, estado: filtro.value === VIGENTES ? undefined : filtro.value, pagina: numeroPagina.value, porPagina: POR_PAGINA },
  }),
  { watch: [q, filtro, numeroPagina] },
)

const seleccion = ref<IntegranteDto>()
const resolverAbierto = ref(false)
const bajaSolicitadaAbierta = ref(false)
const bajaAbierta = ref(false)

function acciones(m: IntegranteDto): DropdownMenuItem[] {
  const elegir = (abrir: Ref<boolean>) => () => {
    seleccion.value = m
    abrir.value = true
  }
  const lista: DropdownMenuItem[] = []
  if (m.estado === 'SOLICITADA' && puedeValidar.value) lista.push({ label: 'Validar o rechazar', icon: 'i-lucide-badge-check', onSelect: elegir(resolverAbierto) })
  if (m.estado === 'ACTIVA' && !m.bajaSolicitadaEn && puedeSolicitar.value && !puedeValidar.value) {
    lista.push({ label: 'Solicitar baja', icon: 'i-lucide-user-minus', onSelect: elegir(bajaSolicitadaAbierta) })
  }
  if (m.estado === 'ACTIVA' && puedeValidar.value) lista.push({ label: 'Dar de baja', icon: 'i-lucide-user-x', color: 'error', onSelect: elegir(bajaAbierta) })
  return lista
}

function hecho(titulo: string) {
  toast.add({ title: titulo, color: 'success', icon: 'i-lucide-check' })
  refresh()
  emit('cambio')
}

function alResolver({ invitacion }: { invitacion: { enviado: boolean, enlace?: string } | null }) {
  hecho('Solicitud resuelta')
  if (invitacion && !invitacion.enviado && invitacion.enlace) {
    toast.add({ title: 'No se pudo enviar la invitación por correo', description: 'Reenvíela desde Usuarios para obtener el enlace.', color: 'warning', icon: 'i-lucide-mail-x' })
  }
}

// --- Alta
const altaAbierta = ref(false)
const vacio = (): EstadoFormulario<AltaIntegranteInput> => ({ email: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '', cedulaProfesional: '', especialidadId: undefined, numeroSocio: '', comentario: '' })
const alta = reactive(vacio())
watch(altaAbierta, a => a && Object.assign(alta, vacio()))

const { data: especialidades } = await useAsyncData('especialidades', () => api<EspecialidadDto[]>('/api/especialidades'), { default: () => [] })
const NINGUNA = '__ninguna__'
const opcionesEspecialidad = computed(() => [{ label: 'Sin especialidad', value: NINGUNA }, ...especialidades.value.map(e => ({ label: e.nombre, value: e.id }))])
const especialidad = computed({
  get: () => alta.especialidadId ?? NINGUNA,
  set: (v: string) => { alta.especialidadId = v === NINGUNA ? undefined : v },
})

const form = useTemplateRef<Form<AltaIntegranteInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function solicitarAlta() {
  const r = await enviar(() => api(`/api/organizaciones/${props.organizacionId}/integrantes`, { method: 'POST', body: alta }))
  if (r.ok) {
    altaAbierta.value = false
    hecho('Solicitud enviada a la Federación')
  }
}
</script>
