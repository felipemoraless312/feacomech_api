<template>
  <figure class="space-y-3">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="text-sm font-medium text-highlighted">{{ titulo }}</span>
      <UButton :label="verTabla ? 'Ver gráfica' : 'Ver tabla'" size="xs" color="neutral" variant="link" @click="verTabla = !verTabla" />
    </figcaption>

    <table v-if="verTabla" class="w-full text-sm">
      <thead>
        <tr class="text-left text-xs text-muted">
          <th class="py-1 font-normal">
            Mes
          </th>
          <th class="py-1 text-right font-normal">
            Nuevos
          </th>
          <th class="py-1 text-right font-normal">
            Acumulado
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-default">
        <tr v-for="p in puntos" :key="p.mes">
          <td class="py-1.5 text-toned">
            {{ mesLargo(p.mes) }}
          </td>
          <td class="py-1.5 text-right tabular-nums">
            {{ p.nuevos }}
          </td>
          <td class="py-1.5 text-right tabular-nums text-highlighted">
            {{ p.acumulado }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="relative" @pointerleave="activo = null">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-auto w-full overflow-visible" role="img" :aria-label="`${titulo}: ${resumen}`">
        <!-- rejilla -->
        <g class="text-neutral-200 dark:text-neutral-800">
          <line v-for="t in marcas" :key="t" :x1="M.l" :x2="W - M.r" :y1="y(t)" :y2="y(t)" stroke="currentColor" stroke-width="1" />
        </g>
        <g class="fill-current text-[10px] text-neutral-500">
          <text v-for="t in marcas" :key="`t${t}`" :x="M.l - 6" :y="y(t) + 3" text-anchor="end">{{ t }}</text>
          <text v-for="(p, i) in puntos" v-show="i % 2 === 0 || i === puntos.length - 1" :key="`m${p.mes}`" :x="x(i)" :y="H - 4" text-anchor="middle">{{ mesCorto(p.mes) }}</text>
        </g>
        <!-- área y línea del acumulado -->
        <path :d="area" class="fill-marca-600/10 dark:fill-marca-300/10" />
        <path :d="linea" fill="none" class="stroke-marca-600 dark:stroke-marca-300 linea" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <!-- cursor -->
        <g v-if="activo !== null">
          <line :x1="x(activo)" :x2="x(activo)" :y1="M.t" :y2="H - M.b" class="stroke-neutral-300 dark:stroke-neutral-600" stroke-width="1" />
          <circle :cx="x(activo)" :cy="y(puntos[activo]!.acumulado)" r="4.5" class="fill-marca-600 dark:fill-marca-300" style="stroke: var(--ui-bg)" stroke-width="2" />
        </g>
        <circle :cx="x(puntos.length - 1)" :cy="y(ultimo)" r="4.5" class="fill-marca-600 dark:fill-marca-300" style="stroke: var(--ui-bg)" stroke-width="2" />
        <!-- zonas de interacción -->
        <rect
          v-for="(p, i) in puntos"
          :key="`h${p.mes}`"
          :x="x(i) - paso / 2"
          :y="M.t"
          :width="paso"
          :height="H - M.t - M.b"
          fill="transparent"
          @pointerenter="activo = i"
          @pointerdown="activo = i"
        />
      </svg>
      <div
        v-if="activo !== null"
        class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-inverted px-2.5 py-1.5 text-xs text-inverted shadow-lg"
        :style="{ left: `${(x(activo) / W) * 100}%` }"
      >
        <p class="font-medium">
          {{ mesLargo(puntos[activo]!.mes) }}
        </p>
        <p>{{ puntos[activo]!.acumulado }} en total · +{{ puntos[activo]!.nuevos }} nuevos</p>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
const props = defineProps<{ puntos: { mes: string, nuevos: number, acumulado: number }[], titulo: string }>()

const W = 600
const H = 200
const M = { t: 12, r: 12, b: 22, l: 34 }
const verTabla = ref(false)
const activo = ref<number | null>(null)

const ultimo = computed(() => props.puntos.at(-1)?.acumulado ?? 0)
const tope = computed(() => {
  const m = Math.max(1, ...props.puntos.map(p => p.acumulado))
  const paso = 10 ** Math.floor(Math.log10(m))
  return Math.ceil(m / paso) * paso
})
const marcas = computed(() => [0, tope.value / 2, tope.value].map(v => Math.round(v)))
const paso = computed(() => (W - M.l - M.r) / Math.max(1, props.puntos.length - 1))
const x = (i: number) => M.l + i * paso.value
const y = (v: number) => H - M.b - (v / tope.value) * (H - M.t - M.b)
const linea = computed(() => props.puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.acumulado)}`).join(''))
const area = computed(() => `${linea.value}L${x(props.puntos.length - 1)},${y(0)}L${x(0)},${y(0)}Z`)

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const mesCorto = (m: string) => MESES[Number(m.slice(5, 7)) - 1]!
const mesLargo = (m: string) => new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${m}-15T12:00:00Z`))
const resumen = computed(() => `${ultimo.value} registros acumulados al cierre de ${props.puntos.length ? mesLargo(props.puntos.at(-1)!.mes) : ''}`)
</script>

<style scoped>
.linea {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: trazar 1.4s ease-out forwards;
}
@keyframes trazar { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .linea { animation: none; stroke-dashoffset: 0; }
}
</style>
