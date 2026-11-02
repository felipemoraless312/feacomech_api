<!-- Vistas para imprimir o guardar en PDF (constancias): fondo gris en pantalla, hoja carta al imprimir. -->
<template>
  <div class="min-h-svh bg-muted py-8 print:bg-white print:py-0">
    <div class="mx-auto mb-6 flex max-w-[11in] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
      <UButton icon="i-lucide-arrow-left" label="Volver" color="neutral" variant="ghost" @click="volver" />
      <UButton icon="i-lucide-printer" label="Imprimir o guardar como PDF" @click="imprimir" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const volver = () => (window.history.length > 1 ? router.back() : navigateTo('/plataforma/eventos'))
const imprimir = () => window.print()
</script>
