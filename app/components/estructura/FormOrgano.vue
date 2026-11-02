<template>
  <UForm ref="form" :schema="organoSchema" :state="estado" class="space-y-4" @submit="guardar">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Tipo" name="tipo" required>
        <USelect v-model="estado.tipo" :items="opcionesTipo" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Orden" name="orden" help="Menor = aparece primero">
        <UInputNumber v-model="estado.orden" :min="0" :max="999" class="w-full" />
      </UFormField>
      <UFormField label="Nombre" name="nombre" required class="sm:col-span-2">
        <UInput v-model="estado.nombre" placeholder="Mesa directiva, Comisión de ética…" class="w-full" />
      </UFormField>
      <UFormField label="Descripción" name="descripcion" class="sm:col-span-2">
        <UTextarea v-model="estado.descripcion" :rows="2" autoresize class="w-full" />
      </UFormField>
    </div>
    <USwitch v-model="estado.activo" label="Activo" description="Los inactivos no aparecen en el portal." />
    <AlertaError :mensaje="error" />
    <div class="flex justify-end gap-2">
      <UButton v-if="organo" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cerrar')" />
      <UButton type="submit" label="Guardar" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { NOMBRE_ORGANO, TIPOS_ORGANO, organoSchema, type OrganoInput } from '#shared/schemas/estructura'
import type { EstructuraDto } from '~~/server/services/estructura'

const opcionesTipo = TIPOS_ORGANO.map(t => ({ label: NOMBRE_ORGANO[t], value: t }))
const props = defineProps<{ organizacionId: string | null, organo?: EstructuraDto['organos'][number] }>()
const emit = defineEmits<{ cerrar: [], guardado: [] }>()
const api = useApi()

const o = props.organo
const estado = reactive<EstadoFormulario<OrganoInput>>({
  organizacionId: props.organizacionId ?? undefined,
  tipo: o?.tipo ?? 'COMISION',
  nombre: o?.nombre ?? '',
  descripcion: o?.descripcion ?? '',
  orden: o?.orden ?? 0,
  activo: o?.activo ?? true,
})

const form = useTemplateRef<Form<OrganoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => o
    ? api<unknown>(`/api/estructura/organos/${o.id}`, { method: 'PUT', body: estado })
    : api<unknown>('/api/estructura/organos', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado')
}
async function eliminar() {
  if (!confirm('¿Eliminar este órgano?')) return
  const r = await enviar(() => api(`/api/estructura/organos/${o!.id}`, { method: 'DELETE' }))
  if (r.ok) emit('guardado')
}
</script>
