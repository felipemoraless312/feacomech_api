<!-- Representantes: usuarios con un rol ligado a esta organización -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted">
        Administran la información de la organización con los permisos de su rol, sólo sobre ella.
      </p>
      <UButton v-if="puedeAdministrar" icon="i-lucide-user-plus" label="Asignar representante" @click="abierto = true" />
    </div>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio v-if="!representantes.length" icono="i-lucide-user-round-cog" titulo="Sin representantes asignados" />
      <ul v-else class="divide-y divide-default">
        <li v-for="r in representantes" :key="r.id" class="flex items-center gap-4 px-5 py-3.5">
          <FotoPerfil :foto-id="r.usuario.perfil?.fotoId" :nombre="nombreCompleto(r.usuario)" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(r.usuario) }}
            </p>
            <p class="truncate text-sm text-muted">
              {{ r.rol.nombre }} · desde {{ formatoFecha(r.asignadoEn) }}
            </p>
          </div>
          <UButton v-if="puedeAdministrar" icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Quitar" @click="quitar(r.id)" />
        </li>
      </ul>
    </div>

    <UModal v-model:open="abierto" title="Asignar representante">
      <template #body>
        <UForm :schema="representanteSchema" :state="estado" class="space-y-4" @submit="asignar">
          <UFormField label="Usuario" name="usuarioId" required help="Debe tener cuenta en la plataforma.">
            <USelectMenu
              v-model="estado.usuarioId"
              v-model:search-term="busqueda"
              :items="opcionesUsuario"
              value-key="value"
              ignore-filter
              :loading="buscando"
              placeholder="Buscar por nombre o correo"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Rol" name="rolId" required>
            <USelect v-model="estado.rolId" :items="opcionesRol" value-key="value" placeholder="Elija un rol" class="w-full" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
            <UButton type="submit" label="Asignar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import { representanteSchema } from '#shared/schemas/organizacion'
import { formatoFecha, nombreCompleto } from '#shared/texto'
import type { OrganizacionDetalle } from '~~/server/services/organizaciones'
import type { RolDto } from '~~/server/services/roles'
import type { UsuarioDto } from '~~/server/services/usuarios'

const props = defineProps<{ organizacionId: string, representantes: OrganizacionDetalle['roles'] }>()
const emit = defineEmits<{ cambio: [] }>()

const api = useApi()
const toast = useToast()
const { puede } = usePermisos()
const puedeAdministrar = computed(() => puede('organizacion.administrar'))

const abierto = ref(false)
const estado = reactive({ usuarioId: undefined as string | undefined, rolId: undefined as string | undefined })
watch(abierto, a => a && Object.assign(estado, { usuarioId: undefined, rolId: undefined }))

// Roles con algún permiso de alcance "su organización" (los únicos que tienen sentido aquí).
const { data: roles } = await useAsyncData('roles', () => api<RolDto[]>('/api/roles'), { default: () => [], immediate: puedeAdministrar.value })
const opcionesRol = computed(() => roles.value
  .filter(r => r.activo && r.permisos.some(p => p.alcance === 'ORGANIZACION'))
  .map(r => ({ label: r.nombre, value: r.id })))

const busqueda = ref('')
const termino = refDebounced(busqueda, 300)
const { data: usuarios, status } = await useAsyncData(
  'usuarios-representante',
  () => api<Pagina<UsuarioDto>>('/api/usuarios', { query: { q: termino.value || undefined, activo: 'true', porPagina: 20 } }),
  { watch: [termino], immediate: false },
)
watch(abierto, a => a && !usuarios.value && refreshNuxtData('usuarios-representante'))
const buscando = computed(() => status.value === 'pending')
const opcionesUsuario = computed(() => (usuarios.value?.datos ?? []).map(u => ({ label: `${nombreCompleto(u)} · ${u.email}`, value: u.id })))

const { enviando, error, enviar } = useEnvio()
async function asignar() {
  const r = await enviar(() => api(`/api/organizaciones/${props.organizacionId}/representantes`, { method: 'POST', body: estado }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Representante asignado', color: 'success', icon: 'i-lucide-check' })
    emit('cambio')
  }
}

async function quitar(id: string) {
  if (!confirm('¿Quitar este rol en la organización?')) return
  try {
    await api(`/api/organizaciones/${props.organizacionId}/representantes/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Rol retirado', color: 'success', icon: 'i-lucide-check' })
    emit('cambio')
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
