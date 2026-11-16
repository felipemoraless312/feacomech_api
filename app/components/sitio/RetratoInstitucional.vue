<!-- Retrato con la identidad de la Federación: el escudo de la FEACOMECH asoma por detrás.
     - Con `recorte` (PNG/WebP con fondo transparente) la persona aparece recortada sobre un
       círculo de color y el escudo grande al fondo.
     - Sin recorte, la fotografía va en un marco de arco y el escudo asoma detrás del marco. -->
<template>
  <figure class="retrato relative isolate mx-auto w-full max-w-72">
    <!-- Escudo de la Federación por detrás -->
    <img
      src="/img/marca/escudo-512.png"
      alt=""
      aria-hidden="true"
      class="retrato-escudo pointer-events-none absolute -z-10 select-none"
      :class="recorte ? 'inset-x-[6%] top-[2%] w-[88%] opacity-[0.16]' : '-right-10 -top-8 w-44 rotate-[10deg] opacity-[0.22] sm:-right-12'"
      width="512"
      height="594"
    >

    <template v-if="recorte">
      <div class="absolute inset-x-[8%] bottom-0 top-[18%] -z-10 rounded-t-full bg-gradient-to-b from-marca-200 via-marca-100 to-acento-100 dark:from-marca-800 dark:via-marca-900 dark:to-marca-950" />
      <img :src="recorte" :alt="alt" class="relative w-full drop-shadow-[0_18px_24px_rgb(64_40_88/0.25)]" width="560" height="700">
      <div class="h-1.5 rounded-full bg-gradient-to-r from-marca-600 via-marca-400 to-acento-500" />
    </template>

    <template v-else>
      <!-- Marco de arco con filete de la marca -->
      <div class="rounded-t-[999px] rounded-b-2xl bg-gradient-to-br from-marca-500 via-marca-400 to-acento-400 p-1.5 shadow-flotante">
        <div class="overflow-hidden rounded-t-[999px] rounded-b-[0.85rem] bg-marca-50 dark:bg-marca-950">
          <img v-if="src" :src="src" :alt="alt" class="aspect-[4/5] w-full object-cover" width="560" height="700">
          <div v-else class="flex aspect-[4/5] items-center justify-center font-display text-6xl font-bold text-marca-300">
            {{ iniciales }}
          </div>
        </div>
      </div>
    </template>

    <figcaption v-if="$slots.default" class="mt-4 text-center sm:text-left">
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
const props = defineProps<{ src?: string, recorte?: string, alt: string }>()
const iniciales = computed(() => props.alt.replace(/^Fotografía de /, '').split(' ').filter(x => !x.endsWith('.')).slice(0, 2).map(x => x[0]).join(''))
</script>

<style scoped>
/* El escudo flota muy despacio detrás del retrato. */
.retrato-escudo {
  animation: fea-retrato-escudo 9s ease-in-out infinite;
}
@keyframes fea-retrato-escudo {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -6px; }
}
@media (prefers-reduced-motion: reduce) {
  .retrato-escudo { animation: none; }
}
</style>
