<template>
  <UForm ref="form" :schema="cargoSchema" :state="estado" class="space-y-4" @submit="guardar">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Nombre del cargo" name="nombre" required class="sm:col-span-2">
        <UInput v-model="estado.nombre" placeholder="Presidencia, Secretaría, Vocalía…" class="w-full" />
      </UFormField>
      <UFormField label="Órgano" name="organoId" required>
        <USelect v-model="estado.organoId" :items="organos.map(o => ({ label: o.nombre, value: o.id }))" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Depende de" name="superiorId" help="Define su lugar en el organigrama">
        <USelect v-model="superior" :items="opcionesSuperior" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Orden" name="orden" help="Entre cargos del mismo nivel">
        <UInputNumber v-model="estado.orden" :min="0" :max="999" class="w-full" />
      </UFormField>
      <UFormField label="Descripción o atribuciones" name="descripcion" class="sm:col-span-2">
        <UTextarea v-model="estado.descripcion" :rows="2" autoresize class="w-full" />
      </UFormField>
    </div>
    <USwitch v-model="estado.activo" label="Activo" />
    <AlertaError :mensaje="error" />
    <div class="flex justify-end gap-2">
      <UButton v-if="cargo" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cerrar')" />
      <UButton type="submit" label="Guardar" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { cargoSchema, type CargoInput } from '#shared/schemas/estructura'
import type { EstructuraDto } from '~~/server/services/estructura'

type Cargo = EstructuraDto['organos'][number]['cargos'][number]
const props = defineProps<{ organos: EstructuraDto['organos'], cargo?: Cargo, organoId?: string }>()
const emit = defineEmits<{ cerrar: [], guardado: [] }>()
const api = useApi()

const c = props.cargo
const estado = reactive<EstadoFormulario<CargoInput>>({
  organoId: c?.organoId ?? props.organoId ?? props.organos[0]?.id ?? '',
  nombre: c?.nombre ?? '',
  descripcion: c?.descripcion ?? '',
  orden: c?.orden ?? 0,
  superiorId: c?.superiorId ?? undefined,
  activo: c?.activo ?? true,
})

// Cualquier cargo de la misma estructura (de cualquier órgano), salvo él mismo.
const NINGUNO = '__ninguno__'
const opcionesSuperior = computed(() => [
  { label: '— Ninguno (nivel superior) —', value: NINGUNO },
  ...props.organos.flatMap(o => o.cargos.filter(x => x.id !== c?.id).map(x => ({ label: `${x.nombre} · ${o.nombre}`, value: x.id }))),
])
const superior = computed({
  get: () => estado.superiorId ?? NINGUNO,
  set: (v: string) => { estado.superiorId = v === NINGUNO ? undefined : v },
})

const form = useTemplateRef<Form<CargoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => c
    ? api<unknown>(`/api/estructura/cargos/${c.id}`, { method: 'PUT', body: estado })
    : api<unknown>('/api/estructura/cargos', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado')
}
async function eliminar() {
  if (!confirm('¿Eliminar este cargo?')) return
  const r = await enviar(() => api(`/api/estructura/cargos/${c!.id}`, { method: 'DELETE' }))
  if (r.ok) emit('guardado')
}
</script>
