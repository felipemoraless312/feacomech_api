<!-- Encabezado de las páginas internas del portal -->
<template>
  <section class="relative isolate overflow-hidden bg-gradient-to-b from-marca-50 to-default dark:from-marca-950/40">
    <MarcaRed class="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] text-marca-200 dark:text-marca-900" />
    <UContainer class="py-14 sm:py-20">
      <p v-if="antetitulo" class="entrada text-sm font-semibold uppercase tracking-[0.16em] text-marca-700 dark:text-marca-300">
        {{ antetitulo }}
      </p>
      <h1 class="entrada mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-highlighted text-balance sm:text-5xl" style="--retraso: 80ms">
        {{ titulo }}
      </h1>
      <p v-if="descripcion" class="entrada mt-4 max-w-2xl text-lg text-muted" style="--retraso: 160ms">
        {{ descripcion }}
      </p>
      <div v-if="$slots.default" class="entrada mt-8" style="--retraso: 220ms">
        <slot />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
defineProps<{ titulo: string, antetitulo?: string, descripcion?: string }>()
</script>
