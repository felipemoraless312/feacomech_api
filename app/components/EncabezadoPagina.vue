<!-- Título grande de página dentro del Portal del Personal -->
<template>
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <p v-if="antetitulo || $slots.antetitulo" class="text-[15px] text-muted">
        <slot name="antetitulo">
          {{ antetitulo }}
        </slot>
      </p>
      <h1 class="mt-1 truncate font-display text-3xl font-medium tracking-[-0.015em] text-highlighted sm:text-4xl">
        {{ titulo }}
      </h1>
      <div v-if="$slots.default" class="mt-2 text-[15px] text-muted">
        <slot />
      </div>
    </div>
    <div v-if="$slots.acciones" class="flex flex-wrap gap-2">
      <slot name="acciones" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ titulo: string, antetitulo?: string }>()
</script>
