<!-- Alta o configuración de un grupo de la comunidad -->
<template>
  <UForm ref="form" :schema="grupoSchema" :state="estado" class="space-y-4" @submit="guardar">
    <UFormField v-if="!grupo" label="Tipo" name="tipo" required>
      <USelect v-model="estado.tipo" :items="opcionesTipo" value-key="value" class="w-full" />
    </UFormField>
    <UFormField v-if="!grupo && estado.tipo === 'ESPECIALIDAD'" label="Especialidad" name="especialidadId" required>
      <USelectMenu v-model="estado.especialidadId" :items="opcionesEspecialidad" value-key="value" class="w-full" />
    </UFormField>
    <UFormField label="Nombre" name="nombre" required>
      <UInput v-model="estado.nombre" class="w-full" />
    </UFormField>
    <UFormField label="Descripción" name="descripcion">
      <UTextarea v-model="estado.descripcion" :rows="2" autoresize class="w-full" />
    </UFormField>
    <UFormField label="Privacidad" name="privacidad" required>
      <URadioGroup v-model="estado.privacidad" :items="opcionesPrivacidad" value-key="value" />
    </UFormField>
    <USwitch v-model="estado.activo" label="Activo" description="Un grupo inactivo deja de mostrarse; su contenido se conserva." />
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
import { NOMBRE_PRIVACIDAD, NOMBRE_TIPO_GRUPO, PRIVACIDADES, grupoSchema, type GrupoInput } from '#shared/schemas/comunidad'
import type { EspecialidadDto } from '~~/server/services/especialidades'

const props = defineProps<{ grupo?: { id: string, tipo: GrupoInput['tipo'], nombre: string, descripcion: string | null, privacidad: GrupoInput['privacidad'], especialidadId: string | null, activo: boolean } }>()
const emit = defineEmits<{ cerrar: [], guardado: [] }>()
const api = useApi()

const opcionesTipo: { label: string, value: GrupoInput['tipo'] }[] = (['GENERAL', 'ESPECIALIDAD', 'DEBATE'] as const).map(t => ({ label: NOMBRE_TIPO_GRUPO[t], value: t }))
const opcionesPrivacidad = PRIVACIDADES.map(p => ({ label: NOMBRE_PRIVACIDAD[p], value: p }))
const { data: especialidades } = await useAsyncData('especialidades', () => api<EspecialidadDto[]>('/api/especialidades'), { default: () => [] })
const opcionesEspecialidad = computed(() => especialidades.value.map(e => ({ label: e.nombre, value: e.id })))

const g = props.grupo
const estado = reactive<EstadoFormulario<GrupoInput>>({
  tipo: g?.tipo ?? 'DEBATE',
  nombre: g?.nombre ?? '',
  descripcion: g?.descripcion ?? '',
  privacidad: g?.privacidad ?? 'ABIERTO',
  especialidadId: g?.especialidadId ?? undefined,
  activo: g?.activo ?? true,
})

const form = useTemplateRef<Form<GrupoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => g
    ? api<unknown>(`/api/comunidad/grupos/${g.id}`, { method: 'PUT', body: { ...estado, tipo: g.tipo, especialidadId: g.especialidadId } })
    : api<unknown>('/api/comunidad/grupos', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado')
}
</script>
