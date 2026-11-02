<template>
  <PanelPagina id="roles" titulo="Roles y permisos" tamano="lg">
    <template #acciones>
      <UButton icon="i-lucide-plus" label="Nuevo rol" @click="abrir()" />
    </template>

    <div class="space-y-8">
      <EncabezadoPagina titulo="Roles y permisos">
        Cada rol otorga permisos con un alcance: toda la Federación, sólo su organización o sólo
        lo propio. Un usuario puede tener varios roles; recibe la unión de sus permisos.
      </EncabezadoPagina>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="r in roles"
          :key="r.id"
          type="button"
          class="group flex flex-col rounded-2xl bg-default p-5 text-left shadow-tarjeta transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante"
          @click="abrir(r)"
        >
          <span class="flex items-center gap-2">
            <span class="font-medium text-highlighted">{{ r.nombre }}</span>
            <UBadge v-if="!r.activo" label="Inactivo" color="neutral" variant="soft" size="sm" />
            <UBadge v-if="r.sistema" label="Inicial" color="primary" variant="soft" size="sm" />
          </span>
          <span v-if="r.descripcion" class="mt-1 text-sm text-muted">{{ r.descripcion }}</span>
          <span class="mt-3 flex gap-4 text-xs text-dimmed">
            <span>{{ r.permisos.length }} permiso(s)</span>
            <span>{{ r.usuarios }} usuario(s)</span>
          </span>
        </button>
      </div>
    </div>

    <USlideover v-model:open="abierto" :title="editando ? editando.nombre : 'Nuevo rol'" :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <UForm ref="form" :schema="editando ? rolSchema : rolCrearSchema" :state="estado" class="space-y-6" @submit="guardar">
          <UAlert v-if="esSuper" color="info" variant="subtle" icon="i-lucide-lock" title="El superadministrador tiene siempre todos los permisos" description="Sólo se pueden editar su nombre y descripción." />

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField v-if="!editando" label="Clave" name="clave" required help="Ej.: COORDINADOR_EVENTOS">
              <UInput v-model="estado.clave" class="w-full font-mono uppercase" />
            </UFormField>
            <UFormField label="Nombre" name="nombre" required :class="{ 'sm:col-span-2': editando }">
              <UInput v-model="estado.nombre" class="w-full" />
            </UFormField>
            <UFormField label="Descripción" name="descripcion" class="sm:col-span-2">
              <UTextarea v-model="estado.descripcion" :rows="2" autoresize class="w-full" />
            </UFormField>
          </div>
          <USwitch v-if="!esSuper" v-model="estado.activo" label="Rol activo" description="Un rol inactivo deja de otorgar permisos a quienes lo tengan." />

          <div class="space-y-6">
            <section v-for="(permisos, grupo) in grupos" :key="grupo" class="space-y-2">
              <h3 class="px-1 text-[13px] font-semibold uppercase tracking-wide text-dimmed">
                {{ grupo }}
              </h3>
              <div class="divide-y divide-default overflow-hidden rounded-xl ring-1 ring-default">
                <div v-for="p in permisos" :key="p.clave" class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm text-highlighted">
                      {{ p.descripcion }}
                    </p>
                    <p class="font-mono text-[11px] text-dimmed">
                      {{ p.clave }}
                    </p>
                  </div>
                  <USelect
                    :model-value="seleccion[p.clave] ?? SIN"
                    :items="opcionesAlcance(p.alcances)"
                    value-key="value"
                    :disabled="esSuper"
                    size="sm"
                    class="w-full sm:w-52"
                    @update:model-value="asignar(p.clave, $event as string)"
                  />
                </div>
              </div>
            </section>
          </div>

          <AlertaError :mensaje="error" />

          <div class="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-2 border-t border-default bg-default/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <UButton v-if="editando && !editando.sistema" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
            <UButton type="submit" label="Guardar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </USlideover>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { CATALOGO_PERMISOS, NOMBRE_ALCANCE, PERMISOS, ROL_SUPERADMIN, type Alcance, type Permiso } from '#shared/permisos'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { rolCrearSchema, rolSchema, type RolCrearInput } from '#shared/schemas/rol'
import type { RolDto } from '~~/server/services/roles'

definePageMeta({ layout: 'plataforma', permiso: 'rol.administrar' })
useSeoMeta({ title: 'Roles y permisos' })

const api = useApi()
const toast = useToast()

const { data: roles, refresh } = await useAsyncData('roles', () => api<RolDto[]>('/api/roles'), { default: () => [] })

// Catálogo agrupado para la matriz.
const grupos = PERMISOS.reduce<Record<string, { clave: Permiso, descripcion: string, alcances: readonly Alcance[] }[]>>((acc, clave) => {
  const p = CATALOGO_PERMISOS[clave]
  ;(acc[p.grupo] ??= []).push({ clave, descripcion: p.descripcion, alcances: p.alcances })
  return acc
}, {})

const SIN = '__sin__'
const opcionesAlcance = (alcances: readonly Alcance[]) => [
  { label: 'Sin permiso', value: SIN },
  ...alcances.map(a => ({ label: NOMBRE_ALCANCE[a], value: a })),
]

const abierto = ref(false)
const editando = ref<RolDto>()
const esSuper = computed(() => editando.value?.clave === ROL_SUPERADMIN)
const estado = reactive<EstadoFormulario<RolCrearInput>>({ clave: '', nombre: '', descripcion: '', activo: true, permisos: [] })
const seleccion = reactive<Partial<Record<Permiso, Alcance>>>({})

function abrir(r?: RolDto) {
  editando.value = r
  Object.assign(estado, { clave: r?.clave ?? '', nombre: r?.nombre ?? '', descripcion: r?.descripcion ?? '', activo: r?.activo ?? true })
  for (const k of PERMISOS) delete seleccion[k]
  for (const p of r?.permisos ?? []) seleccion[p.permiso as Permiso] = p.alcance
  abierto.value = true
}

function asignar(permiso: Permiso, valor: string) {
  if (valor === SIN) delete seleccion[permiso]
  else seleccion[permiso] = valor as Alcance
}

watchEffect(() => {
  estado.permisos = (Object.entries(seleccion) as [Permiso, Alcance][]).map(([permiso, alcance]) => ({ permiso, alcance }))
})

const form = useTemplateRef<Form<RolCrearInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const { clave, ...resto } = estado
  const r = await enviar(() => editando.value
    ? api<unknown>(`/api/roles/${editando.value.id}`, { method: 'PUT', body: resto })
    : api<unknown>('/api/roles', { method: 'POST', body: { clave, ...resto } }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Rol guardado', description: 'Los permisos aplican de inmediato.', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}

async function eliminar() {
  if (!editando.value || !confirm(`¿Eliminar el rol "${editando.value.nombre}"?`)) return
  const r = await enviar(() => api(`/api/roles/${editando.value!.id}`, { method: 'DELETE' }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Rol eliminado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}
</script>
