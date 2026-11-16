<!-- Texto capturado en el panel: párrafos separados por línea en blanco. Se interpola como
     texto (nunca como HTML), así que no hay riesgo de inyección. Las direcciones http(s) se
     convierten en enlaces y las palabras/URL largas se parten para no desbordar en el celular. -->
<template>
  <div class="space-y-4 text-[17px] leading-relaxed text-muted">
    <p v-for="(p, i) in parrafos" :key="i" class="whitespace-pre-line [overflow-wrap:anywhere]">
      <template v-for="(f, j) in p" :key="j">
        <a v-if="f.tipo === 'enlace'" :href="f.url" target="_blank" rel="noopener noreferrer nofollow" class="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">{{ f.valor }}</a>
        <template v-else>{{ f.valor }}</template>
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { fragmentarEnlaces } from '#shared/texto'

const props = defineProps<{ texto: string | null | undefined }>()
const parrafos = computed(() => (props.texto ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(fragmentarEnlaces))
</script>
