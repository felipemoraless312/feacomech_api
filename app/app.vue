<template>
  <UApp :locale="es">
    <NuxtLoadingIndicator color="linear-gradient(90deg, var(--color-marca-400), var(--color-acento-400))" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { es } from '@nuxt/ui/locale'
</script>
