<template>
  <UAlert v-if="mensaje" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="mensaje" />
</template>

<script setup lang="ts">
defineProps<{ mensaje?: string }>()
</script>
