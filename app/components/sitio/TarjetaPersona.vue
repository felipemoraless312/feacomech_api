<!-- Integrante de un órgano con su reseña curricular desplegable -->
<template>
  <article class="flex flex-col rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default">
    <div class="flex items-center gap-4">
      <FotoPerfil :nombre="nombreSinTitulo" tamano="3xl" class="size-16 shrink-0 text-xl" />
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-marca-700 dark:text-marca-300">
          {{ cargo }}
        </p>
        <p class="mt-0.5 font-display text-lg font-semibold leading-snug text-highlighted">
          {{ nombre }}
        </p>
      </div>
    </div>
    <details class="group mt-4 border-t border-default pt-3">
      <summary class="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-primary">
        Reseña curricular
        <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        {{ resena || 'Reseña curricular en preparación.' }}
      </p>
    </details>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{ cargo: string, nombre: string, resena?: string }>()
// Las iniciales del avatar no deben salir de «Dr.», «Dra.», «QFB.», «Ing.»…
const nombreSinTitulo = computed(() => props.nombre.split(' ').filter(p => !p.endsWith('.') && p !== 'Biomédico').join(' '))
</script>
