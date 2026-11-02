<!-- Historial de la afiliación de la organización a la Federación -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted">
        Cada cambio de estado abre un periodo nuevo; los anteriores se conservan.
      </p>
      <UButton v-if="puede('organizacion.administrar')" icon="i-lucide-refresh-cw" label="Cambiar estado" @click="abierto = true" />
    </div>

    <ol class="relative space-y-4 border-s border-default ps-6">
      <li v-for="a in afiliaciones" :key="a.id" class="relative">
        <span class="absolute -start-[1.95rem] top-1.5 size-3 rounded-full ring-4 ring-default" :class="a.hasta ? 'bg-(--ui-text-dimmed)' : 'bg-primary'" />
        <div class="rounded-2xl bg-default px-5 py-4 shadow-tarjeta">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <EstadoPunto :texto="NOMBRE_AFILIACION[a.estado]" :tono="TONO_AFILIACION[a.estado]" class="font-medium" />
            <span class="text-sm text-muted">{{ fechaCorta(a.desde) }} – {{ a.hasta ? fechaCorta(a.hasta) : 'vigente' }}</span>
          </div>
          <p v-if="a.motivo" class="mt-1 text-sm text-muted">
            {{ a.motivo }}
          </p>
          <p v-if="a.registradoPor" class="mt-1 text-xs text-dimmed">
            Registró: {{ a.registradoPor.nombre }} {{ a.registradoPor.apellidoPaterno }}
          </p>
        </div>
      </li>
    </ol>

    <UModal v-model:open="abierto" title="Cambiar estado de afiliación">
      <template #body>
        <UForm ref="form" :schema="estadoAfiliacionSchema" :state="estado" class="space-y-4" @submit="guardar">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Nuevo estado" name="estado" required>
              <USelect v-model="estado.estado" :items="opciones" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="A partir de" name="desde" required>
              <UInput v-model="estado.desde" type="date" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Motivo o referencia (acta, oficio…)" name="motivo">
            <UTextarea v-model="estado.motivo" :rows="2" autoresize class="w-full" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
            <UButton type="submit" label="Guardar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { ESTADOS_AFILIACION, NOMBRE_AFILIACION, estadoAfiliacionSchema, type EstadoAfiliacionInput } from '#shared/schemas/organizacion'
import type { OrganizacionDetalle } from '~~/server/services/organizaciones'

const props = defineProps<{ organizacionId: string, afiliaciones: OrganizacionDetalle['afiliaciones'], actual: string }>()
const emit = defineEmits<{ cambio: [] }>()

const api = useApi()
const toast = useToast()
const { puede } = usePermisos()

const opciones = ESTADOS_AFILIACION.map(e => ({ label: NOMBRE_AFILIACION[e], value: e }))
const abierto = ref(false)
const estado = reactive<EstadoFormulario<EstadoAfiliacionInput>>({ estado: 'AFILIADA', desde: '', motivo: '' })
watch(abierto, a => a && Object.assign(estado, { estado: props.actual === 'AFILIADA' ? 'SUSPENDIDA' : 'AFILIADA', desde: new Date().toISOString().slice(0, 10), motivo: '' }))

const form = useTemplateRef<Form<EstadoAfiliacionInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => api(`/api/organizaciones/${props.organizacionId}/afiliacion`, { method: 'POST', body: estado }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Estado actualizado', color: 'success', icon: 'i-lucide-check' })
    emit('cambio')
  }
}
</script>
