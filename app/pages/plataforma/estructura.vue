<template>
  <PanelPagina id="estructura" :titulo="consejo ? 'Consejo consultivo' : 'Estructura y mesa directiva'" tamano="xl">
    <div class="space-y-8">
      <EncabezadoPagina titulo="Estructura de la Federación">
        Órganos, cargos, periodos de gestión y nombramientos. Sólo los nombramientos publicados
        aparecen en el portal; publíquelos una vez validados por la Federación.
      </EncabezadoPagina>
      <EstructuraPanel :key="String(route.query.organo)" :organizacion-id="null" />
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plataforma', permiso: 'estructura.administrar' })
const route = useRoute()
const consejo = computed(() => route.query.organo === 'CONSEJO_CONSULTIVO')
useSeoMeta({ title: () => (consejo.value ? 'Consejo consultivo' : 'Estructura y mesa directiva') })
</script>
