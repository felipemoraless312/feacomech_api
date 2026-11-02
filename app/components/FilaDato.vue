<template>
  <div class="flex items-baseline justify-between gap-6 px-5 py-3 text-[15px]">
    <span class="shrink-0 text-muted">{{ etiqueta }}</span>
    <span class="min-w-0 text-right text-highlighted" :class="{ 'text-dimmed': vacio }">
      <slot>{{ vacio ? '—' : valor }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ etiqueta: string, valor?: string | number | null }>()
const slots = useSlots()
const vacio = computed(() => !slots.default && (props.valor === null || props.valor === undefined || props.valor === ''))
</script>
