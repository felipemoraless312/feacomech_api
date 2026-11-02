<!-- Línea de tiempo: en móvil, una columna; en escritorio, hitos alternados a ambos lados. -->
<template>
  <ol class="relative mx-auto max-w-5xl">
    <span aria-hidden="true" class="absolute bottom-2 left-[1.15rem] top-2 w-px bg-gradient-to-b from-marca-300 via-marca-500 to-marca-800 md:left-1/2 dark:from-marca-700 dark:via-marca-500 dark:to-marca-300" />
    <li
      v-for="(h, i) in hitos"
      :key="`${h.anio}-${h.titulo}`"
      v-revelar="(i % 3) * 80"
      class="relative grid gap-2 pb-12 pl-12 last:pb-0 md:w-1/2 md:pl-0"
      :class="i % 2 ? 'md:ml-auto md:pl-12' : 'md:pr-12 md:text-right'"
    >
      <span
        aria-hidden="true"
        class="absolute left-2 top-1 flex size-[1.15rem] items-center justify-center rounded-full bg-default ring-4 ring-marca-500/25"
        :class="i % 2 ? 'md:-left-[0.575rem]' : 'md:left-auto md:-right-[0.575rem]'"
      >
        <span class="size-2 rounded-full bg-marca-600 dark:bg-marca-300" />
      </span>
      <p class="font-display text-3xl font-semibold tabular-nums tracking-tight text-marca-700 dark:text-marca-300">
        {{ h.anio }}
      </p>
      <h3 class="font-display text-lg font-semibold text-highlighted">
        {{ h.titulo }}
      </h3>
      <p v-if="h.texto" class="text-[15px] leading-relaxed text-muted">
        {{ h.texto }}
      </p>
    </li>
  </ol>
</template>

<script setup lang="ts">
defineProps<{ hitos: { anio: string, titulo: string, texto: string }[] }>()
</script>
