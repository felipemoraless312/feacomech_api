<!-- Marca FEACOMECH: escudo oficial de la Federación (public/img/escudo-*.png, recortado de
     public/logo/logo.jpg) y siglas. Sobre fondos oscuros (`claro`) el escudo va en una placa blanca. -->
<template>
  <span class="inline-flex items-center gap-2.5 text-highlighted">
    <span class="shrink-0" :class="claro ? 'rounded-xl bg-white p-1 shadow-sm' : ''">
      <img src="/img/escudo-160.png" alt="" aria-hidden="true" class="w-auto" :class="tamano" width="138" height="160">
    </span>
    <span v-if="!compacto" class="flex flex-col leading-none">
      <span class="font-semibold tracking-[0.04em]" :class="texto">FEACOMECH</span>
      <span v-if="grande" class="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] opacity-70">Federación médica de Chiapas</span>
    </span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ compacto?: boolean, grande?: boolean, claro?: boolean }>(), { compacto: false, grande: false, claro: false })
const tamano = computed(() => (props.grande ? 'h-12' : 'h-9'))
const texto = computed(() => (props.grande ? 'text-xl' : 'text-[15px]'))
</script>
