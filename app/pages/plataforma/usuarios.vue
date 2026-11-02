<template>
  <PanelPagina id="usuarios" titulo="Usuarios" tamano="xl">
    <template #acciones>
      <UButton v-if="puede('usuario.administrar')" icon="i-lucide-user-plus" label="Nuevo usuario" @click="abrirFormulario()" />
    </template>
    <template #herramientas>
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar por nombre o correo" class="w-full min-w-48 max-w-sm" />
      <USelect v-model="filtroRol" :items="opcionesRol" class="w-48 shrink-0" />
      <USelect v-model="filtroActivo" :items="opcionesActivo" class="w-32 shrink-0" />
    </template>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <UTable :data="pagina?.datos ?? []" :columns="columnas" :loading="status === 'pending'">
        <template #empty>
          <EstadoVacio icono="i-lucide-users" titulo="No hay usuarios que coincidan" descripcion="Cambie los filtros o registre un usuario nuevo." />
        </template>
      </UTable>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>{{ pagina?.total ?? 0 }} usuario(s)</span>
      <UPagination v-if="(pagina?.total ?? 0) > POR_PAGINA" v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <UModal v-model:open="formularioAbierto" :title="editando ? 'Editar usuario' : 'Nuevo usuario'" :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <UsuariosFormulario
          :key="editando?.id ?? 'nuevo'"
          :usuario="editando"
          :roles="roles"
          :soy-superadmin="soySuperadmin"
          @cancelar="formularioAbierto = false"
          @guardado="alGuardar"
        />
      </template>
    </UModal>

    <UModal v-model:open="enlaceAbierto" title="Enlace de acceso" :dismissible="false">
      <template #body>
        <div class="space-y-4 text-sm">
          <UAlert color="warning" variant="subtle" icon="i-lucide-mail-x" title="No se pudo enviar el correo" description="El servidor de correo no está configurado. Entregue este enlace personalmente al usuario; es de un solo uso y vence en 72 horas." />
          <div class="flex items-center gap-2 rounded-lg bg-elevated p-3">
            <code class="min-w-0 flex-1 break-all text-xs">{{ enlace }}</code>
            <UButton icon="i-lucide-copy" color="neutral" variant="ghost" aria-label="Copiar" @click="copiar(enlace)" />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton label="Listo" @click="enlaceAbierto = false" />
      </template>
    </UModal>

    <UModal v-model:open="desactivarAbierto" title="Desactivar usuario">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm">
            <strong>{{ desactivando && nombreCompleto(desactivando) }}</strong> ya no podrá entrar a la plataforma y se
            cerrarán sus sesiones abiertas. Su historial se conserva.
          </p>
          <UFormField label="Motivo" required>
            <UTextarea v-model="motivoDesactivar" class="w-full" :rows="2" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <UButton label="Cancelar" color="neutral" variant="ghost" @click="desactivarAbierto = false" />
        <UButton label="Desactivar" color="error" :disabled="motivoDesactivar.trim().length < 3" @click="confirmarDesactivar" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { refDebounced } from '@vueuse/core'
import { ROL_SUPERADMIN } from '#shared/permisos'
import type { Pagina } from '#shared/schemas/comunes'
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { UsuarioDto } from '~~/server/services/usuarios'
import type { RolDto } from '~~/server/services/roles'

definePageMeta({ layout: 'plataforma', permiso: 'usuario.ver' })
useSeoMeta({ title: 'Usuarios' })

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const EstadoPunto = resolveComponent('EstadoPunto')
const FotoPerfil = resolveComponent('FotoPerfil')

const api = useApi()
const toast = useToast()
const { user } = useUserSession()
const { puede, acceso } = usePermisos()
const soySuperadmin = computed(() => !!acceso.value?.roles.some(r => r.clave === ROL_SUPERADMIN))

const POR_PAGINA = 25
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const filtroActivo = ref<'true' | 'false' | 'todos'>('true')
const filtroRol = ref<string>('todos')
const numeroPagina = ref(1)
watch([q, filtroActivo, filtroRol], () => (numeroPagina.value = 1))

const opcionesActivo = [
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
  { label: 'Todos', value: 'todos' },
]

const { data: roles } = await useAsyncData('roles', () => api<RolDto[]>('/api/roles'), { default: () => [] })
const opcionesRol = computed(() => [{ label: 'Todos los roles', value: 'todos' }, ...roles.value.map(r => ({ label: r.nombre, value: r.id }))])

const { data: pagina, status, refresh } = await useAsyncData(
  'usuarios',
  () => api<Pagina<UsuarioDto>>('/api/usuarios', {
    query: {
      q: q.value || undefined,
      activo: filtroActivo.value === 'todos' ? undefined : filtroActivo.value,
      rolId: filtroRol.value === 'todos' ? undefined : filtroRol.value,
      pagina: numeroPagina.value,
      porPagina: POR_PAGINA,
    },
  }),
  { watch: [q, filtroActivo, filtroRol, numeroPagina] },
)

function estadoDe(u: UsuarioDto) {
  if (!u.activo) return { texto: 'Inactivo', tono: 'neutro' as const }
  if (u.bloqueadoHasta && new Date(u.bloqueadoHasta) > new Date()) return { texto: 'Bloqueado', tono: 'alerta' as const }
  if (u.sinActivar) return { texto: 'Sin activar', tono: 'info' as const }
  return { texto: 'Activo', tono: 'exito' as const }
}

const columnas: TableColumn<UsuarioDto>[] = [
  {
    accessorKey: 'nombre',
    header: 'Usuario',
    cell: ({ row }) => {
      const u = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h(FotoPerfil, { fotoId: u.fotoId, nombre: nombreCompleto(u), tamano: 'md' }),
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'font-medium text-highlighted' }, nombreCompleto(u)),
          h('p', { class: 'truncate text-xs text-muted' }, u.email),
        ]),
      ])
    },
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => row.original.roles.length
      ? h('div', { class: 'flex flex-wrap gap-1' }, row.original.roles.map(r => h(UBadge, { label: r.nombre, color: 'neutral', variant: 'soft', size: 'sm' })))
      : h('span', { class: 'text-dimmed' }, 'Sin roles'),
  },
  {
    id: 'especialidad',
    header: 'Especialidad',
    cell: ({ row }) => row.original.especialidad ?? h('span', { class: 'text-dimmed' }, '—'),
  },
  {
    accessorKey: 'ultimoAcceso',
    header: 'Último acceso',
    cell: ({ row }) => (row.original.ultimoAcceso ? formatoFechaHora(row.original.ultimoAcceso) : h('span', { class: 'text-dimmed' }, 'Nunca')),
  },
  {
    id: 'estado',
    header: 'Estado',
    cell: ({ row }) => h(EstadoPunto, estadoDe(row.original)),
  },
  {
    id: 'acciones',
    cell: ({ row }) => puede('usuario.administrar')
      ? h('div', { class: 'text-right' }, h(UDropdownMenu, { items: accionesDe(row.original), content: { align: 'end' } }, () =>
          h(UButton, { 'icon': 'i-lucide-ellipsis-vertical', 'color': 'neutral', 'variant': 'ghost', 'aria-label': 'Acciones' })))
      : null,
  },
]

function accionesDe(u: UsuarioDto): DropdownMenuItem[][] {
  const propio = u.id === user.value?.id
  return [
    [
      { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => abrirFormulario(u) },
      ...(u.activo
        ? [{ label: u.sinActivar ? 'Reenviar invitación' : 'Enviar enlace de contraseña', icon: 'i-lucide-send', onSelect: () => invitar(u) }]
        : []),
    ],
    [
      u.activo
        ? { label: 'Desactivar', icon: 'i-lucide-user-x', color: 'error' as const, disabled: propio, onSelect: () => pedirDesactivar(u) }
        : { label: 'Reactivar', icon: 'i-lucide-user-check', onSelect: () => reactivar(u) },
    ],
  ]
}

// --- Alta / edición
const formularioAbierto = ref(false)
const editando = ref<UsuarioDto>()

function abrirFormulario(u?: UsuarioDto) {
  editando.value = u
  formularioAbierto.value = true
}

function alGuardar({ invitacion }: { usuario: UsuarioDto, invitacion?: { enviado: boolean, enlace?: string } }) {
  formularioAbierto.value = false
  refresh()
  if (!invitacion) toast.add({ title: 'Usuario actualizado', color: 'success', icon: 'i-lucide-check' })
  else mostrarResultadoInvitacion(invitacion)
}

// --- Invitación / enlace de contraseña
const enlaceAbierto = ref(false)
const enlace = ref('')

function mostrarResultadoInvitacion(r: { enviado: boolean, enlace?: string }) {
  if (r.enviado) {
    toast.add({ title: 'Enlace enviado por correo', color: 'success', icon: 'i-lucide-mail-check' })
    return
  }
  enlace.value = r.enlace ?? ''
  enlaceAbierto.value = true
}

async function invitar(u: UsuarioDto) {
  try {
    mostrarResultadoInvitacion(await api<{ enviado: boolean, enlace?: string }>(`/api/usuarios/${u.id}/invitacion`, { method: 'POST' }))
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

async function copiar(texto: string) {
  await navigator.clipboard.writeText(texto)
  toast.add({ title: 'Copiado al portapapeles', icon: 'i-lucide-copy' })
}

// --- Activación
const desactivarAbierto = ref(false)
const desactivando = ref<UsuarioDto>()
const motivoDesactivar = ref('')

function pedirDesactivar(u: UsuarioDto) {
  desactivando.value = u
  motivoDesactivar.value = ''
  desactivarAbierto.value = true
}

async function confirmarDesactivar() {
  try {
    await api(`/api/usuarios/${desactivando.value!.id}/desactivar`, { method: 'POST', body: { motivo: motivoDesactivar.value } })
    desactivarAbierto.value = false
    toast.add({ title: 'Usuario desactivado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

async function reactivar(u: UsuarioDto) {
  try {
    await api(`/api/usuarios/${u.id}/reactivar`, { method: 'POST' })
    toast.add({ title: 'Usuario reactivado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
