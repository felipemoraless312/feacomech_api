<!-- Línea de tiempo horizontal: los años van sobre una línea y, al elegir uno, su hito se muestra
     debajo (con «anterior / siguiente» y flechas del teclado). La línea se rellena hasta el año
     elegido. Todos los paneles comparten la misma celda de la cuadrícula, así que la tarjeta
     toma la altura del hito más largo y no brinca al cambiar. -->
<template>
  <div class="mx-auto max-w-4xl">
    <!-- Años sobre la línea -->
    <div class="relative">
      <span aria-hidden="true" class="absolute inset-x-[calc(100%/var(--n)/2)] top-[0.6875rem] h-0.5 rounded-full bg-marca-100 dark:bg-marca-900" :style="{ '--n': hitos.length }" />
      <span
        aria-hidden="true"
        class="absolute left-[calc(100%/var(--n)/2)] top-[0.6875rem] h-0.5 rounded-full bg-gradient-to-r from-marca-500 to-acento-500 transition-[width] duration-500 ease-out"
        :style="{ '--n': hitos.length, width: `calc((100% - 100% / ${hitos.length}) * ${hitos.length > 1 ? activo / (hitos.length - 1) : 0})` }"
      />
      <div
        role="tablist"
        aria-label="Años de la trayectoria"
        class="relative grid"
        :style="{ gridTemplateColumns: `repeat(${hitos.length}, minmax(0, 1fr))` }"
        @keydown.right.prevent="mover(1)"
        @keydown.left.prevent="mover(-1)"
        @keydown.home.prevent="elegir(0)"
        @keydown.end.prevent="elegir(hitos.length - 1)"
      >
        <button
          v-for="(h, i) in hitos"
          :id="`hito-tab-${i}`"
          :key="`${h.anio}-${h.titulo}`"
          ref="botones"
          type="button"
          role="tab"
          :aria-selected="i === activo"
          :aria-controls="`hito-panel-${i}`"
          :tabindex="i === activo ? 0 : -1"
          class="group flex flex-col items-center gap-2 rounded-lg pb-1 outline-none focus-visible:ring-2 focus-visible:ring-marca-500"
          @click="elegir(i)"
        >
          <span
            class="flex size-6 items-center justify-center rounded-full transition duration-300"
            :class="i <= activo ? 'bg-marca-600 ring-4 ring-marca-500/25 dark:bg-marca-400' : 'bg-default ring-2 ring-marca-200 group-hover:ring-marca-400 dark:ring-marca-800'"
          >
            <span class="rounded-full transition-all duration-300" :class="i === activo ? 'size-2.5 bg-white' : i < activo ? 'size-1.5 bg-white/80' : 'size-1.5 bg-marca-300 dark:bg-marca-700'" />
          </span>
          <span
            class="font-display text-xs font-semibold tabular-nums tracking-tight transition-colors sm:text-base"
            :class="i === activo ? 'text-marca-700 dark:text-marca-200' : 'text-muted group-hover:text-highlighted'"
          >
            {{ h.anio }}
          </span>
        </button>
      </div>
    </div>

    <!-- Hito elegido -->
    <div class="relative mt-5 rounded-2xl border border-default bg-default p-5 shadow-sm sm:p-7">
      <!-- Pestaña que apunta al año elegido -->
      <span
        aria-hidden="true"
        class="absolute -top-[7px] size-3 rotate-45 border-l border-t border-default bg-default transition-[left] duration-500 ease-out"
        :style="{ left: `calc(${((activo + 0.5) / hitos.length) * 100}% - 6px)` }"
      />
      <div class="grid">
        <div
          v-for="(h, i) in hitos"
          :id="`hito-panel-${i}`"
          :key="`${h.anio}-${h.titulo}`"
          role="tabpanel"
          :aria-labelledby="`hito-tab-${i}`"
          :aria-hidden="i !== activo"
          class="col-start-1 row-start-1 transition duration-300"
          :class="i === activo ? 'opacity-100' : 'pointer-events-none invisible translate-y-1 opacity-0'"
        >
          <p class="font-display text-3xl font-semibold tabular-nums tracking-tight text-marca-700 dark:text-marca-300">
            {{ h.anio }}
          </p>
          <h3 class="mt-1 font-display text-lg font-semibold text-highlighted sm:text-xl">
            {{ h.titulo }}
          </h3>
          <p v-if="h.texto" class="mt-2 text-[15px] leading-relaxed text-muted">
            {{ h.texto }}
          </p>
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between border-t border-default pt-4">
        <UButton icon="i-lucide-chevron-left" label="Anterior" color="neutral" variant="ghost" size="sm" :disabled="activo === 0" @click="mover(-1)" />
        <span class="text-xs tabular-nums text-dimmed">{{ activo + 1 }} de {{ hitos.length }}</span>
        <UButton trailing-icon="i-lucide-chevron-right" label="Siguiente" color="neutral" variant="ghost" size="sm" :disabled="activo === hitos.length - 1" @click="mover(1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ hitos: { anio: string, titulo: string, texto: string }[] }>()

const activo = ref(0)
const botones = useTemplateRef<HTMLButtonElement[]>('botones')

function elegir(i: number) {
  activo.value = Math.min(Math.max(i, 0), props.hitos.length - 1)
}

function mover(d: number) {
  elegir(activo.value + d)
  // Con el teclado, el foco acompaña al año elegido
  if (botones.value?.some(b => b === document.activeElement)) botones.value[activo.value]?.focus()
}
</script>
