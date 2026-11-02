<!-- Estado vacío: ícono, título, descripción y una acción opcional -->
<template>
  <div class="flex flex-col items-center px-6 py-14 text-center">
    <span class="flex size-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600 dark:bg-marca-950 dark:text-marca-300">
      <UIcon :name="icono" class="size-6" />
    </span>
    <p class="mt-4 font-medium text-highlighted">
      {{ titulo }}
    </p>
    <p v-if="descripcion" class="mt-1 max-w-sm text-sm text-muted">
      {{ descripcion }}
    </p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ titulo: string, descripcion?: string, icono?: string }>(), { icono: 'i-lucide-inbox' })
</script>
