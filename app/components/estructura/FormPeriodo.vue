<template>
  <UForm ref="form" :schema="periodoSchema" :state="estado" class="space-y-4" @submit="guardar">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Nombre del periodo" name="nombre" required class="sm:col-span-2">
        <UInput v-model="estado.nombre" placeholder="Ej.: 2025–2027" class="w-full" />
      </UFormField>
      <UFormField label="Inicio" name="inicio" required>
        <UInput v-model="estado.inicio" type="date" class="w-full" />
      </UFormField>
      <UFormField label="Fin" name="fin" help="Vacío = sin fecha de término">
        <UInput v-model="estado.fin" type="date" class="w-full" />
      </UFormField>
      <UFormField label="Descripción" name="descripcion" class="sm:col-span-2" help="Acta de asamblea, lema de la gestión…">
        <UTextarea v-model="estado.descripcion" :rows="2" autoresize class="w-full" />
      </UFormField>
    </div>
    <AlertaError :mensaje="error" />
    <div class="flex justify-end gap-2">
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cerrar')" />
      <UButton type="submit" label="Guardar" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { periodoSchema, type PeriodoInput } from '#shared/schemas/estructura'
import type { EstructuraDto } from '~~/server/services/estructura'

const props = defineProps<{ organizacionId: string | null, periodo?: EstructuraDto['periodos'][number] }>()
const emit = defineEmits<{ cerrar: [], guardado: [] }>()
const api = useApi()
const dia = (v?: string | Date | null) => (v ? new Date(v).toISOString().slice(0, 10) : '')

const p = props.periodo
const estado = reactive<EstadoFormulario<PeriodoInput>>({
  organizacionId: props.organizacionId ?? undefined,
  nombre: p?.nombre ?? '',
  inicio: dia(p?.inicio),
  fin: dia(p?.fin),
  descripcion: p?.descripcion ?? '',
})

const form = useTemplateRef<Form<PeriodoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => p
    ? api<unknown>(`/api/estructura/periodos/${p.id}`, { method: 'PUT', body: estado })
    : api<unknown>('/api/estructura/periodos', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado')
}
</script>
