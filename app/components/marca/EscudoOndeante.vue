<!-- Escudo de la FEACOMECH ondeando como bandera.
     El escudo se divide en franjas verticales; cada una sube y baja con un pequeño desfase, de
     modo que una onda lo recorre de izquierda a derecha. Como en una bandera, el lado del asta
     (izquierda) casi no se mueve y el extremo libre ondea un poco más. Encima pasa una franja de
     luz y sombra, recortada a la silueta del escudo, que da la sensación de tela.
     Funciona con CSS puro (también en Safari). Con «reducir movimiento» queda quieto. -->
<template>
  <div class="bandera relative aspect-[512/594]" :style="{ '--franjas': FRANJAS, '--duracion': `${DURACION_S}s` }" aria-hidden="true">
    <span
      v-for="i in FRANJAS"
      :key="i"
      class="bandera-franja absolute inset-y-0"
      :style="{
        left: `${((i - 1) / FRANJAS) * 100}%`,
        backgroundPosition: `${((i - 1) / (FRANJAS - 1)) * 100}% 0`,
        '--amplitud': `${(0.15 + 0.85 * (i - 1) / (FRANJAS - 1)) * AMPLITUD_PX}px`,
        animationDelay: `${-(i - 1) * (DURACION_S / FRANJAS) * 1.2}s`,
      }"
    />
    <!-- Luz y sombra de la tela, sólo sobre la silueta del escudo -->
    <span class="bandera-luz absolute inset-0" />
  </div>
</template>

<script setup lang="ts">
const FRANJAS = 48
// Movimiento suave: poca amplitud y una ondulación lenta.
const AMPLITUD_PX = 3
const DURACION_S = 5
</script>

<style scoped>
.bandera-franja {
  /* +1px de traslape para que no se vean líneas entre franjas */
  width: calc(100% / var(--franjas) + 1px);
  background-image: url('/img/marca/escudo-512.png');
  background-size: calc(var(--franjas) * 100%) 100%;
  background-repeat: no-repeat;
  /* curva senoidal: sin arranques ni frenos bruscos */
  animation: fea-ondear var(--duracion) cubic-bezier(0.37, 0, 0.63, 1) infinite;
  will-change: transform;
}
@keyframes fea-ondear {
  0%, 100% { transform: translateY(calc(var(--amplitud) * -1)); }
  50% { transform: translateY(var(--amplitud)); }
}

.bandera-luz {
  -webkit-mask: url('/img/marca/escudo-512.png') center / 100% 100% no-repeat;
  mask: url('/img/marca/escudo-512.png') center / 100% 100% no-repeat;
  background: repeating-linear-gradient(
    100deg,
    rgb(255 255 255 / 0) 0%,
    rgb(255 255 255 / 0.10) 12%,
    rgb(0 0 0 / 0) 24%,
    rgb(40 20 60 / 0.07) 36%,
    rgb(255 255 255 / 0) 48%
  );
  background-size: 200% 100%;
  animation: fea-ondear-luz calc(var(--duracion) * 1.6) linear infinite;
  mix-blend-mode: soft-light;
}
@keyframes fea-ondear-luz {
  from { background-position: 0% 0; }
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .bandera-franja { animation: none; transform: none; }
  .bandera-luz { animation: none; }
}
</style>
