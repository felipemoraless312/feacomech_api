<!-- La Federación valida o rechaza una solicitud de alta de integrante -->
<template>
  <UModal v-model:open="abierto" title="Resolver solicitud">
    <template #body>
      <div v-if="solicitud" class="space-y-5">
        <div class="flex items-center gap-3">
          <FotoPerfil :foto-id="solicitud.usuario.perfil?.fotoId" :nombre="nombreCompleto(solicitud.usuario)" />
          <div class="min-w-0">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(solicitud.usuario) }}
            </p>
            <p class="truncate text-sm text-muted">
              {{ solicitud.usuario.email }}<template v-if="organizacion">
                · {{ organizacion }}
              </template>
            </p>
          </div>
        </div>
        <GrupoDatos>
          <FilaDato etiqueta="Cédula profesional" :valor="solicitud.usuario.perfil?.cedulaProfesional" />
          <FilaDato etiqueta="Especialidad" :valor="solicitud.usuario.perfil?.especialidad?.nombre" />
          <FilaDato etiqueta="Solicitada" :valor="formatoFechaHora(solicitud.solicitadaEn)" />
          <FilaDato v-if="solicitud.solicitadaPor" etiqueta="Por" :valor="nombreCompleto(solicitud.solicitadaPor)" />
          <FilaDato v-if="solicitud.comentario" etiqueta="Comentario" :valor="solicitud.comentario" />
        </GrupoDatos>

        <UTabs v-model="decision" :items="opciones" :content="false" class="w-full" />

        <div v-if="decision === 'APROBAR'" class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Número de socio" help="Opcional">
            <UInput v-model="numeroSocio" class="w-full" />
          </UFormField>
          <UFormField label="Fecha de alta" help="Vacío = hoy">
            <UInput v-model="desde" type="date" class="w-full" />
          </UFormField>
          <p class="text-xs text-muted sm:col-span-2">
            Se le asignará el rol de médico afiliado y, si aún no ha activado su cuenta, recibirá su invitación por correo.
          </p>
        </div>
        <UFormField v-else label="Motivo del rechazo" required>
          <UTextarea v-model="motivo" :rows="3" autoresize class="w-full" />
        </UFormField>
        <AlertaError :mensaje="error" />
      </div>
    </template>
    <template #footer>
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
      <UButton
        :label="decision === 'APROBAR' ? 'Validar alta' : 'Rechazar'"
        :color="decision === 'APROBAR' ? 'primary' : 'error'"
        :loading="enviando"
        :disabled="decision === 'RECHAZAR' && motivo.trim().length < 3"
        @click="resolver"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { IntegranteDto } from '~~/server/services/membresias'

const props = defineProps<{ solicitud?: IntegranteDto, organizacion?: string }>()
const emit = defineEmits<{ resuelta: [r: { invitacion: { enviado: boolean, enlace?: string } | null }] }>()
const abierto = defineModel<boolean>('open', { default: false })

const api = useApi()
const opciones = [{ label: 'Validar', value: 'APROBAR' }, { label: 'Rechazar', value: 'RECHAZAR' }]
const decision = ref<'APROBAR' | 'RECHAZAR'>('APROBAR')
const numeroSocio = ref('')
const desde = ref('')
const motivo = ref('')
watch(abierto, (a) => {
  if (!a) return
  decision.value = 'APROBAR'
  numeroSocio.value = props.solicitud?.numeroSocio ?? ''
  desde.value = ''
  motivo.value = ''
})

const { enviando, error, enviar } = useEnvio()

async function resolver() {
  const cuerpo = decision.value === 'APROBAR'
    ? { decision: 'APROBAR', numeroSocio: numeroSocio.value, desde: desde.value }
    : { decision: 'RECHAZAR', motivo: motivo.value }
  const r = await enviar(() => api<{ invitacion: { enviado: boolean, enlace?: string } | null }>(`/api/membresias/${props.solicitud!.id}/resolver`, { method: 'POST', body: cuerpo }))
  if (r.ok) {
    abierto.value = false
    emit('resuelta', r.valor)
  }
}
</script>
