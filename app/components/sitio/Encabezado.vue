<!-- Encabezado de las páginas internas del portal: banda morada del escudo, ruta de navegación
     y rótulo en versalitas con filete cobre, como la papelería de la Federación. -->
<template>
  <section class="relative isolate overflow-hidden bg-marca-900 text-white">
    <MarcaRed class="pointer-events-none absolute -right-24 -top-28 -z-10 size-[30rem] text-white/[0.08]" />
    <img src="/img/escudo-512.png" alt="" aria-hidden="true" class="pointer-events-none absolute -bottom-20 right-[8%] -z-10 hidden w-64 rotate-[-8deg] opacity-[0.07] lg:block">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-marca-800 via-marca-900 to-marca-950" />

    <UContainer class="py-10 sm:py-14">
      <nav class="entrada flex items-center gap-1.5 text-[13px] text-white/60" aria-label="Ruta">
        <NuxtLink to="/" class="hover:text-white">
          Inicio
        </NuxtLink>
        <template v-if="antetitulo">
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <span class="text-white/85">{{ antetitulo }}</span>
        </template>
      </nav>
      <h1 class="entrada mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-[-0.01em] text-balance sm:text-5xl" style="--retraso: 80ms">
        {{ titulo }}
      </h1>
      <div class="entrada mt-4 h-1 w-16 bg-acento-500" style="--retraso: 120ms" />
      <p v-if="descripcion" class="entrada mt-4 max-w-2xl text-lg leading-relaxed text-white/80" style="--retraso: 160ms">
        {{ descripcion }}
      </p>
      <div v-if="$slots.default" class="entrada mt-8 [--ui-bg-elevated:rgb(255_255_255/0.1)] [--ui-border:rgb(255_255_255/0.15)] [--ui-text-highlighted:#fff] [--ui-text-muted:rgb(255_255_255/0.75)]" style="--retraso: 220ms">
        <slot />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
defineProps<{ titulo: string, antetitulo?: string, descripcion?: string }>()
</script>
