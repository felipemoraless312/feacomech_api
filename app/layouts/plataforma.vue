<!-- Plataforma privada: barra lateral con el menú según los permisos del usuario.
     La administración se agrupa en secciones plegables y todo se encuentra con Ctrl + K. -->
<template>
  <UDashboardGroup unit="rem" storage="local" class="portal">
    <UDashboardSidebar collapsible resizable :default-size="16" :ui="{ footer: 'border-t border-default py-3', body: 'gap-3' }">
      <template #header="{ collapsed }">
        <NuxtLink to="/plataforma" class="flex items-center">
          <MarcaLogo :compacto="collapsed" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" label="Buscar…" class="bg-default/70 ring-default" />

        <UNavigationMenu
          v-for="(grupo, i) in menu"
          :key="i"
          :items="grupo"
          :collapsed="collapsed"
          orientation="vertical"
          color="neutral"
          :ui="{
            link: 'px-2.5 py-1.5 text-[13px] transition-colors before:transition-all before:duration-200 hover:before:bg-white/70 data-active:font-semibold data-active:text-marca-700 data-active:before:bg-white data-active:before:shadow-tarjeta data-active:before:ring-1 data-active:before:ring-marca-100 dark:hover:before:bg-white/5 dark:data-active:text-marca-200 dark:data-active:before:bg-marca-900 dark:data-active:before:ring-white/10',
            linkLeadingIcon: 'transition-transform duration-200 group-hover:scale-110 group-data-active:text-marca-600 dark:group-data-active:text-marca-300',
            label: 'text-[11px] font-semibold uppercase tracking-wide text-dimmed',
            childList: 'ms-4 border-s border-default ps-1.5',
          }"
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

    <UDashboardSearch :groups="busqueda" placeholder="¿A dónde quiere ir?" :color-mode="false" />

    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, clear } = useUserSession()
const { acceso, limpiar } = usePermisos()
const { menu, busqueda } = useMenuPlataforma()
useSondeoNotificaciones()

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
    { label: 'Portal público', icon: 'i-lucide-globe', to: '/', target: '_blank' },
  ],
  [{ label: 'Cerrar sesión', icon: 'i-lucide-log-out', color: 'error', onSelect: salir }],
])
</script>
