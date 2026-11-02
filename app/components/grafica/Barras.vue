<template>
  <figure class="space-y-3">
    <figcaption v-if="titulo" class="flex items-baseline justify-between gap-3">
      <span class="text-sm font-medium text-highlighted">{{ titulo }}</span>
      <UButton
        v-if="barras.length"
        :label="verTabla ? 'Ver gráfica' : 'Ver tabla'"
        size="xs"
        color="neutral"
        variant="link"
        @click="verTabla = !verTabla"
      />
    </figcaption>

    <p v-if="!barras.length" class="py-6 text-center text-sm text-muted">
      {{ vacio }}
    </p>

    <table v-else-if="verTabla" class="w-full text-sm">
      <thead class="sr-only">
        <tr><th>Categoría</th><th>Valor</th></tr>
      </thead>
      <tbody class="divide-y divide-default">
        <tr v-for="b in barras" :key="b.etiqueta">
          <td class="py-1.5 pr-3 text-toned">
            {{ b.etiqueta }}
          </td>
          <td class="py-1.5 text-right tabular-nums text-highlighted">
            {{ formato(b.valor) }}
          </td>
        </tr>
      </tbody>
    </table>

    <ul v-else class="space-y-2.5" role="list">
      <li
        v-for="(b, i) in barras"
        :key="b.etiqueta"
        class="grupo-barra group relative"
        :title="`${b.etiqueta}: ${formato(b.valor)}`"
      >
        <div class="mb-1 flex items-baseline justify-between gap-3 text-sm">
          <span class="truncate text-toned group-hover:text-highlighted">{{ b.etiqueta }}</span>
          <span class="shrink-0 tabular-nums font-medium text-highlighted">{{ formato(b.valor) }}</span>
        </div>
        <div class="h-2.5 w-full rounded-r-[4px] bg-transparent">
          <div
            class="barra h-full rounded-r-[4px] transition-[width,opacity] duration-700 ease-out group-hover:opacity-85"
            :class="b.etiqueta.startsWith('Otros') || b.etiqueta.startsWith('Sin ') ? 'bg-neutral-300 dark:bg-neutral-600' : 'bg-marca-600 dark:bg-marca-300'"
            :style="{ width: visible ? `${Math.max(1.5, (b.valor / maximo) * 100)}%` : '0%', transitionDelay: `${i * 40}ms` }"
          />
        </div>
      </li>
    </ul>
    <p v-if="nota" class="text-xs text-muted">
      {{ nota }}
    </p>
  </figure>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  barras: { etiqueta: string, valor: number }[]
  titulo?: string
  nota?: string
  vacio?: string
}>(), { titulo: '', nota: '', vacio: 'Sin datos para mostrar.' })

const verTabla = ref(false)
const maximo = computed(() => Math.max(1, ...props.barras.map(b => b.valor)))
const nf = new Intl.NumberFormat('es-MX')
const formato = (n: number) => nf.format(n)

// Las barras crecen al montarse (respeta «reducir movimiento» vía CSS).
const visible = ref(false)
onMounted(() => requestAnimationFrame(() => { visible.value = true }))
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .barra { transition: none; }
}
</style>
