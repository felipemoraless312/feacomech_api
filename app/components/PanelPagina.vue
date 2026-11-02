<!-- Página de la plataforma: barra superior con título y acciones, barra de herramientas
     opcional (filtros) y contenido centrado con ancho máximo. -->
<template>
  <UDashboardPanel :id="id">
    <template #header>
      <UDashboardNavbar :title="titulo">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <slot name="acciones" />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar v-if="$slots.herramientas" :ui="{ root: 'gap-2 overflow-x-auto' }">
        <slot name="herramientas" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="mx-auto w-full py-2 sm:py-6" :class="ancho">
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ id: string, titulo: string, tamano?: 'sm' | 'md' | 'lg' | 'xl' }>(), { tamano: 'lg' })
const ancho = computed(() => ({ sm: 'max-w-2xl', md: 'max-w-3xl', lg: 'max-w-5xl', xl: 'max-w-7xl' })[props.tamano])
</script>
