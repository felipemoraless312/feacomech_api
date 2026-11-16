<!-- Encabezado de las páginas internas del portal: banda lavanda con aurora, ruta de navegación
     y rótulo en versalitas con filete cobre, como la papelería de la Federación. -->
<template>
  <section class="relative isolate overflow-hidden text-marca-950 dark:text-white">
    <div class="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-marca-100 via-marca-50 to-acento-50 dark:from-marca-900 dark:via-marca-950 dark:to-marca-950" />
    <div class="aurora [--aurora-opacidad:0.6]" />
    <div class="puntos pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_80%_20%,black,transparent_65%)]" />
    <MarcaRed class="girar-lento pointer-events-none absolute -right-24 -top-28 -z-10 size-[30rem] text-marca-300/35 dark:text-white/[0.08]" />
    <img src="/img/escudo-512.png" alt="" aria-hidden="true" class="flotar pointer-events-none absolute -bottom-16 right-[8%] -z-10 hidden w-64 rotate-[-8deg] opacity-[0.09] lg:block">

    <UContainer class="py-10 sm:py-14">
      <nav class="entrada flex items-center gap-1.5 text-[13px] text-muted" aria-label="Ruta">
        <NuxtLink to="/" class="transition-colors hover:text-marca-700 dark:hover:text-white">
          Inicio
        </NuxtLink>
        <template v-if="antetitulo">
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <span class="font-medium text-marca-700 dark:text-white/85">{{ antetitulo }}</span>
        </template>
      </nav>
      <h1 class="entrada mt-5 max-w-3xl font-display text-marca-900 dark:text-white text-4xl font-bold leading-[1.08] tracking-[-0.01em] text-balance sm:text-5xl" style="--retraso: 80ms">
        {{ titulo }}
      </h1>
      <div class="entrada mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-acento-500 to-acento-300" style="--retraso: 120ms" />
      <p v-if="descripcion" class="entrada mt-4 max-w-2xl text-lg leading-relaxed text-gris-700 dark:text-white/80" style="--retraso: 160ms">
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
