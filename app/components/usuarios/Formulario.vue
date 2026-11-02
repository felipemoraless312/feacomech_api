<!-- Alta y edición de usuarios (identidad y roles). Los datos profesionales los captura
     cada usuario en "Mi perfil". -->
<template>
  <UForm ref="form" :schema="usuarioAdminSchema" :state="estado" class="space-y-6" @submit="guardar">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Nombre(s)" name="nombre" required>
        <UInput v-model="estado.nombre" class="w-full" />
      </UFormField>
      <UFormField label="Apellido paterno" name="apellidoPaterno" required>
        <UInput v-model="estado.apellidoPaterno" class="w-full" />
      </UFormField>
      <UFormField label="Apellido materno" name="apellidoMaterno">
        <UInput v-model="estado.apellidoMaterno" class="w-full" />
      </UFormField>
      <UFormField label="Teléfono" name="telefono">
        <UInput v-model="estado.telefono" type="tel" class="w-full" />
      </UFormField>
      <UFormField label="Correo electrónico" name="email" required class="sm:col-span-2" :help="usuario ? undefined : 'Recibirá un enlace para activar su cuenta y definir su contraseña.'">
        <UInput v-model="estado.email" type="email" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="Roles" name="rolIds" help="Puede asignar varios. Sin roles, el usuario sólo ve su perfil.">
      <div class="mt-1 divide-y divide-default overflow-hidden rounded-xl ring-1 ring-default">
        <label v-for="r in rolesDisponibles" :key="r.id" class="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-muted/50" :class="{ 'cursor-not-allowed opacity-50': r.bloqueado }">
          <UCheckbox :model-value="estado.rolIds!.includes(r.id)" :disabled="r.bloqueado" class="mt-0.5" @update:model-value="alternar(r.id, !!$event)" />
          <span class="min-w-0">
            <span class="block text-sm font-medium text-highlighted">{{ r.nombre }}</span>
            <span v-if="r.descripcion" class="block text-xs text-muted">{{ r.descripcion }}</span>
          </span>
        </label>
      </div>
    </UFormField>

    <div v-if="usuario?.rolesEnOrganizaciones.length" class="space-y-2">
      <p class="text-[13px] font-medium text-muted">
        Roles en organizaciones
      </p>
      <ul class="divide-y divide-default overflow-hidden rounded-xl bg-muted/50 ring-1 ring-default">
        <li v-for="r in usuario.rolesEnOrganizaciones" :key="`${r.id}-${r.organizacion.id}`" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <span class="text-highlighted">{{ r.nombre }}</span>
          <NuxtLink :to="`/plataforma/organizaciones/${r.organizacion.id}?p=representantes`" class="truncate text-primary hover:underline">
            {{ r.organizacion.nombre }}
          </NuxtLink>
        </li>
      </ul>
      <p class="text-xs text-dimmed">
        Se asignan y retiran desde la pestaña Representantes de cada organización.
      </p>
    </div>

    <AlertaError :mensaje="error" />

    <div class="flex justify-end gap-2">
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cancelar')" />
      <UButton type="submit" :label="usuario ? 'Guardar cambios' : 'Crear e invitar'" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { ROL_SUPERADMIN } from '#shared/permisos'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { usuarioAdminSchema, type UsuarioAdminInput } from '#shared/schemas/usuario'
import type { UsuarioDto } from '~~/server/services/usuarios'
import type { RolDto } from '~~/server/services/roles'

const props = defineProps<{ usuario?: UsuarioDto, roles: RolDto[], soySuperadmin: boolean }>()
const emit = defineEmits<{
  cancelar: []
  guardado: [r: { usuario: UsuarioDto, invitacion?: { enviado: boolean, enlace?: string } }]
}>()

const api = useApi()

const estado = reactive<EstadoFormulario<UsuarioAdminInput>>({
  email: props.usuario?.email ?? '',
  nombre: props.usuario?.nombre ?? '',
  apellidoPaterno: props.usuario?.apellidoPaterno ?? '',
  apellidoMaterno: props.usuario?.apellidoMaterno ?? '',
  telefono: props.usuario?.telefono ?? '',
  rolIds: props.usuario?.roles.map(r => r.id) ?? [],
})

// Roles activos (y los inactivos que ya tenga, para poder quitárselos). Sólo un
// superadministrador asigna o quita el rol de superadministrador.
const rolesDisponibles = computed(() => props.roles
  .filter(r => r.activo || estado.rolIds!.includes(r.id))
  .map(r => ({ ...r, bloqueado: r.clave === ROL_SUPERADMIN && !props.soySuperadmin })))

function alternar(id: string, marcado: boolean) {
  estado.rolIds = marcado ? [...estado.rolIds!, id] : estado.rolIds!.filter(x => x !== id)
}

const form = useTemplateRef<Form<UsuarioAdminInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const r = props.usuario
    ? await enviar(async () => ({ usuario: await api<UsuarioDto>(`/api/usuarios/${props.usuario!.id}`, { method: 'PATCH', body: estado }) }))
    : await enviar(() => api<{ usuario: UsuarioDto, invitacion: { enviado: boolean, enlace?: string } }>('/api/usuarios', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado', r.valor)
}
</script>
