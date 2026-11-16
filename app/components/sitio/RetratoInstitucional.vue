<!-- Retrato institucional como fotografía enmarcada: marco con paspartú blanco y, dentro, un
     fondo de estudio con los colores de la Federación y el escudo de la FEACOMECH, que se mueve
     suavemente detrás de la persona.
     - Con `recorte` (WebP/PNG sin fondo) la persona aparece delante del escudo.
     - Sin recorte, la fotografía original llena el cuadro y el escudo asoma en una esquina. -->
<template>
  <figure class="retrato group mx-auto w-full max-w-72">
    <!-- Marco: moldura con degradado de la marca + paspartú blanco -->
    <div class="rounded-[1.1rem] bg-gradient-to-br from-marca-700 via-marca-500 to-acento-500 p-[3px] shadow-flotante transition-transform duration-500 group-hover:-rotate-1">
      <div class="rounded-[0.95rem] bg-white p-2.5 dark:bg-marca-950">
        <!-- Lienzo de la fotografía -->
        <div class="relative isolate aspect-[4/5] overflow-hidden rounded-lg bg-gradient-to-b from-marca-100 via-marca-50 to-acento-50 ring-1 ring-black/5 dark:from-marca-800 dark:via-marca-900 dark:to-marca-950">
          <!-- Luz de estudio -->
          <div class="pointer-events-none absolute inset-0 -z-10 bg-radial-[at_50%_30%] from-white/90 via-white/30 to-transparent dark:from-white/10" aria-hidden="true" />

          <template v-if="recorte">
            <!-- Centrado con flex: la animación usa `translate`, que anularía un -translate-x-1/2 -->
            <div class="pointer-events-none absolute inset-x-0 top-[6%] -z-10 flex justify-center" aria-hidden="true">
              <img
                src="/img/marca/escudo-512.png"
                alt=""
                class="retrato-escudo w-[66%] select-none drop-shadow-[0_8px_18px_rgb(64_40_88/0.22)]"
                width="512"
                height="594"
              >
            </div>
            <img :src="recorte" :alt="alt" class="absolute inset-x-0 bottom-0 w-full drop-shadow-[0_10px_16px_rgb(64_40_88/0.35)]" width="560" height="700">
          </template>

          <template v-else>
            <img v-if="src" :src="src" :alt="alt" class="size-full object-cover" width="560" height="700">
            <div v-else class="flex size-full items-center justify-center font-display text-6xl font-bold text-marca-300">
              {{ iniciales }}
            </div>
            <img
              src="/img/marca/escudo-512.png"
              alt=""
              aria-hidden="true"
              class="retrato-escudo pointer-events-none absolute bottom-2 right-2 w-14 select-none drop-shadow-md"
              width="512"
              height="594"
            >
          </template>

          <!-- Brillo sutil de vidrio -->
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" aria-hidden="true" />
        </div>
      </div>
    </div>

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
/* El escudo se mece y respira despacio detrás de la persona. */
.retrato-escudo {
  animation: fea-retrato-escudo 8s ease-in-out infinite;
}
@keyframes fea-retrato-escudo {
  0%, 100% { translate: 0 0; rotate: -3deg; scale: 1; }
  50% { translate: 0 -8px; rotate: 3deg; scale: 1.03; }
}
@media (prefers-reduced-motion: reduce) {
  .retrato-escudo { animation: none; }
}
</style>
