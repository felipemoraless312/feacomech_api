<!-- Texto capturado en el panel: párrafos separados por línea en blanco. Se interpola como
     texto (nunca como HTML), así que no hay riesgo de inyección. -->
<template>
  <div class="space-y-4 text-[17px] leading-relaxed text-muted">
    <p v-for="(p, i) in parrafos" :key="i" class="whitespace-pre-line">
      {{ p }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ texto: string | null | undefined }>()
const parrafos = computed(() => (props.texto ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean))
</script>
