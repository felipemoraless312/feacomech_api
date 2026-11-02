<!-- Grupo de datos al estilo de Ajustes de iOS: título pequeño y filas en una tarjeta -->
<template>
  <section class="space-y-2">
    <div v-if="titulo || $slots.acciones" class="flex items-end justify-between px-1">
      <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
        {{ titulo }}
      </h2>
      <slot name="acciones" />
    </div>
    <div class="divide-y divide-default overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ titulo?: string }>()
</script>
