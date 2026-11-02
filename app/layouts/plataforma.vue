<!-- Plataforma privada: barra lateral con el menú según los permisos del usuario -->
<template>
  <UDashboardGroup unit="rem" storage="local" class="portal">
    <UDashboardSidebar collapsible resizable :default-size="16" :ui="{ footer: 'border-t border-default py-3' }">
      <template #header="{ collapsed }">
        <NuxtLink to="/plataforma" class="flex items-center">
          <MarcaLogo :compacto="collapsed" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          v-for="(grupo, i) in menu"
          :key="i"
          :items="grupo"
          :collapsed="collapsed"
          orientation="vertical"
          color="neutral"
          :ui="{ link: 'px-2.5 py-1.5 text-[13px] transition-colors data-active:font-semibold data-active:text-marca-700 data-active:before:bg-marca-50 dark:data-active:text-marca-300 dark:data-active:before:bg-marca-950', linkLeadingIcon: 'group-data-active:text-marca-600', label: 'text-[11px] font-semibold uppercase tracking-wide text-dimmed' }"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu :items="menuUsuario" :content="{ align: 'center', collisionPadding: 12 }" class="w-full">
          <UButton
            :avatar="{ alt: user?.nombre, size: 'xs' }"
            :label="collapsed ? undefined : user?.nombre"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            trailing-icon="i-lucide-chevrons-up-down"
            class="text-[13px]"
            :ui="{ trailingIcon: 'text-dimmed size-4' }"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'
import type { Permiso } from '#shared/permisos'

const { user, clear } = useUserSession()
const { puede, acceso, limpiar } = usePermisos()
const { noLeidas } = useNotificaciones()
useSondeoNotificaciones()

type Opcion = NavigationMenuItem & { permiso?: Permiso, algunPermiso?: Permiso[], proximamente?: boolean, notificaciones?: boolean }

// Las opciones "proximamente" se muestran deshabilitadas (sin enlace) hasta que su fase
// esté implementada; ver docs/DIAGNOSTICO.md §10.
const OPCIONES: Opcion[][] = [
  [
    { label: 'Resumen', icon: 'i-lucide-layout-dashboard', to: '/plataforma', exact: true },
  ],
  [
    { label: 'Comunidad', type: 'label' },
    { label: 'Comunidad médica', icon: 'i-lucide-messages-square', to: '/plataforma/comunidad' },
    { label: 'Eventos', icon: 'i-lucide-calendar-days', to: '/plataforma/eventos', exact: true },
    { label: 'Documentos', icon: 'i-lucide-library', to: '/plataforma/documentos' },
    { label: 'Directorio', icon: 'i-lucide-building-2', to: '/directorio', target: '_blank' },
  ],
  [
    { label: 'Mi cuenta', type: 'label' },
    { label: 'Mi perfil', icon: 'i-lucide-id-card', to: '/plataforma/cuenta/perfil' },
    { label: 'Notificaciones', icon: 'i-lucide-bell', to: '/plataforma/notificaciones', notificaciones: true },
    { label: 'Seguridad', icon: 'i-lucide-shield-check', to: '/plataforma/cuenta/seguridad' },
    { label: 'Credencial digital', icon: 'i-lucide-badge-check', proximamente: true },
  ],
  [
    { label: 'Administración', type: 'label' },
    { label: 'Usuarios', icon: 'i-lucide-user-cog', permiso: 'usuario.ver', to: '/plataforma/usuarios' },
    { label: 'Profesionales', icon: 'i-lucide-stethoscope', permiso: 'profesional.ver', to: '/plataforma/profesionales' },
    { label: 'Colegios y asociaciones', icon: 'i-lucide-landmark', permiso: 'organizacion.ver', to: '/plataforma/organizaciones' },
    { label: 'Mesa directiva', icon: 'i-lucide-users-round', permiso: 'estructura.administrar', to: '/plataforma/estructura', exact: true, exactQuery: true },
    { label: 'Consejo consultivo', icon: 'i-lucide-scale', permiso: 'estructura.administrar', to: '/plataforma/estructura?organo=CONSEJO_CONSULTIVO', exactQuery: true },
    { label: 'Afiliaciones', icon: 'i-lucide-file-check-2', algunPermiso: ['afiliacion.solicitar', 'afiliacion.validar', 'organizacion.administrar'], to: '/plataforma/afiliaciones' },
    { label: 'Comunidad y foro', icon: 'i-lucide-shield-check', algunPermiso: ['comunidad.moderar', 'grupo.administrar'], to: '/plataforma/moderacion' },
    { label: 'Noticias', icon: 'i-lucide-newspaper', algunPermiso: ['noticia.publicar', 'noticia.administrar'], to: '/plataforma/noticias' },
    { label: 'Vinculación', icon: 'i-lucide-handshake', permiso: 'contenido.administrar', to: '/plataforma/vinculacion' },
    { label: 'Mensajes de contacto', icon: 'i-lucide-mail', permiso: 'contacto.ver', to: '/plataforma/mensajes' },
    { label: 'Gestión de eventos', icon: 'i-lucide-calendar-cog', permiso: 'evento.gestionar', to: '/plataforma/eventos/gestion' },
    { label: 'Censo médico', icon: 'i-lucide-chart-pie', permiso: 'censo.ver', to: '/plataforma/censo' },
    { label: 'Reportes', icon: 'i-lucide-chart-column', permiso: 'reporte.ver', to: '/plataforma/reportes' },
    { label: 'Configuración', icon: 'i-lucide-settings', algunPermiso: ['config.administrar', 'rol.administrar', 'auditoria.ver', 'contenido.administrar'], to: '/plataforma/configuracion' },
  ],
]

const menu = computed(() =>
  OPCIONES.map(grupo =>
    grupo
      .filter(o => (!o.permiso || puede(o.permiso)) && (!o.algunPermiso || o.algunPermiso.some(p => puede(p))))
      .map(({ permiso: _p, algunPermiso: _a, proximamente, notificaciones, ...o }) =>
        proximamente
          ? { ...o, disabled: true, badge: { label: 'Pronto', color: 'neutral' as const, variant: 'soft' as const, size: 'sm' as const } }
          : notificaciones && noLeidas.value
            ? { ...o, badge: { label: String(noLeidas.value), color: 'primary' as const, variant: 'solid' as const, size: 'sm' as const } }
            : o,
      ),
  ).filter(g => g.some(o => o.type !== 'label')),
)

async function salir() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  limpiar()
  await clear()
  await navigateTo('/plataforma/login')
}

const menuUsuario = computed<DropdownMenuItem[][]>(() => [
  [{
    type: 'label',
    label: user.value?.nombre,
    description: acceso.value?.roles.map(r => r.nombre).join(', ') || user.value?.email,
  }],
  [
    { label: 'Mi perfil', icon: 'i-lucide-id-card', to: '/plataforma/cuenta/perfil' },
    { label: 'Seguridad', icon: 'i-lucide-shield-check', to: '/plataforma/cuenta/seguridad' },
    { label: 'Portal público', icon: 'i-lucide-globe', to: '/' },
  ],
  [{ label: 'Cerrar sesión', icon: 'i-lucide-log-out', color: 'error', onSelect: salir }],
])
</script>
