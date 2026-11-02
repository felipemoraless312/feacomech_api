<template>
  <PanelPagina id="especialidades" titulo="Especialidades" tamano="md">
    <template #acciones>
      <UButton icon="i-lucide-plus" label="Nueva" @click="abrir()" />
    </template>

    <div class="space-y-8">
      <EncabezadoPagina titulo="Especialidades">
        Catálogo para los perfiles profesionales, el censo y las comunidades. Las que tienen perfiles
        asociados no se eliminan: se desactivan.
      </EncabezadoPagina>

      <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
        <EstadoVacio v-if="!lista.length && status !== 'pending'" icono="i-lucide-stethoscope" titulo="Sin especialidades registradas" />
        <ul class="divide-y divide-default">
          <li v-for="e in lista" :key="e.id">
            <div class="flex items-center gap-3 px-5 py-3.5">
              <div class="min-w-0 flex-1">
                <p class="font-medium" :class="e.activo ? 'text-highlighted' : 'text-dimmed line-through'">
                  {{ e.nombre }}
                </p>
                <p class="text-xs text-muted">
                  {{ e.perfiles }} perfil(es)<template v-if="e.subespecialidades.length">
                    · {{ e.subespecialidades.length }} subespecialidad(es)
                  </template>
                </p>
              </div>
              <UButton icon="i-lucide-plus" size="xs" color="neutral" variant="ghost" aria-label="Agregar subespecialidad" @click="abrir(undefined, e.id)" />
              <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" aria-label="Editar" @click="abrir(e)" />
            </div>
            <ul v-if="e.subespecialidades.length" class="divide-y divide-default border-t border-default bg-muted/40">
              <li v-for="s in e.subespecialidades" :key="s.id" class="flex items-center gap-3 py-2.5 pl-10 pr-5">
                <UIcon name="i-lucide-corner-down-right" class="size-4 text-dimmed" />
                <p class="min-w-0 flex-1 text-sm" :class="s.activo ? 'text-highlighted' : 'text-dimmed line-through'">
                  {{ s.nombre }} <span class="text-xs text-muted">· {{ s.perfiles }}</span>
                </p>
                <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" aria-label="Editar" @click="abrir({ ...s, subespecialidades: [] }, e.id)" />
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <UModal v-model:open="abierto" :title="editando ? 'Editar especialidad' : 'Nueva especialidad'">
      <template #body>
        <UForm ref="form" :schema="especialidadSchema" :state="estado" class="space-y-4" @submit="guardar">
          <UFormField label="Nombre" name="nombre" required>
            <UInput v-model="estado.nombre" class="w-full" autofocus />
          </UFormField>
          <UFormField label="Es subespecialidad de" name="padreId">
            <USelect v-model="padre" :items="opcionesPadre" value-key="value" class="w-full" />
          </UFormField>
          <USwitch v-model="estado.activo" label="Activa" description="Las inactivas no se ofrecen en los perfiles." />
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
            <UButton type="submit" label="Guardar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { especialidadSchema, type EspecialidadInput } from '#shared/schemas/perfil'
import type { EspecialidadDto } from '~~/server/services/especialidades'

definePageMeta({ layout: 'plataforma', permiso: 'config.administrar' })
useSeoMeta({ title: 'Especialidades' })

const api = useApi()
const toast = useToast()

const { data: lista, status, refresh } = await useAsyncData('especialidades-todas', () => api<EspecialidadDto[]>('/api/especialidades', { query: { todas: 'true' } }), { default: () => [] })

const abierto = ref(false)
const editando = ref<EspecialidadDto>()
const estado = reactive<EstadoFormulario<EspecialidadInput>>({ nombre: '', padreId: undefined, activo: true })

const opcionesPadre = computed(() => [
  { label: '— Es especialidad principal —', value: NINGUNA },
  ...lista.value.filter(e => e.id !== editando.value?.id).map(e => ({ label: e.nombre, value: e.id })),
])

// USelect no admite null como valor: "__ninguna__" representa "es especialidad principal".
const NINGUNA = '__ninguna__'
const padre = computed({
  get: () => estado.padreId ?? NINGUNA,
  set: (v: string) => { estado.padreId = v === NINGUNA ? undefined : v },
})

function abrir(e?: EspecialidadDto, padreId: string | null = null) {
  editando.value = e
  Object.assign(estado, { nombre: e?.nombre ?? '', padreId: padreId ?? undefined, activo: e?.activo ?? true })
  abierto.value = true
}

const form = useTemplateRef<Form<EspecialidadInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const r = await enviar(() => editando.value
    ? api(`/api/especialidades/${editando.value.id}`, { method: 'PUT', body: estado })
    : api('/api/especialidades', { method: 'POST', body: estado }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Guardado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}
</script>
