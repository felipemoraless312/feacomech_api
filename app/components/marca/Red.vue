<!-- Motivo gráfico de FEACOMECH: una red de nodos unidos (la Federación como red de
     colegios y asociaciones). Decorativo: hereda el color de `currentColor`.
     Las posiciones son deterministas (mismo resultado en servidor y navegador). -->
<template>
  <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <line v-for="(l, i) in LINEAS" :key="`l${i}`" :x1="l[0]" :y1="l[1]" :x2="l[2]" :y2="l[3]" />
    </g>
    <g fill="currentColor">
      <circle v-for="(n, i) in NODOS" :key="`n${i}`" :cx="n.x" :cy="n.y" :r="n.r" />
    </g>
  </svg>
</template>

<script setup lang="ts">
// Generador pseudoaleatorio con semilla fija (mulberry32).
function azar(semilla: number) {
  let a = semilla
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r = azar(1957)
const NODOS = Array.from({ length: 34 }, () => ({
  x: +(20 + r() * 360).toFixed(1),
  y: +(20 + r() * 360).toFixed(1),
  r: +(1.6 + r() * 3.2).toFixed(1),
}))

// Cada nodo se une con sus vecinos cercanos.
const LINEAS = NODOS.flatMap((a, i) =>
  NODOS.slice(i + 1)
    .filter(b => Math.hypot(a.x - b.x, a.y - b.y) < 95)
    .map(b => [a.x, a.y, b.x, b.y] as const),
)
</script>
