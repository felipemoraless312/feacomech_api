<!-- Confirmación que exige escribir un motivo (bajas, rechazos, desactivaciones) -->
<template>
  <UModal v-model:open="abierto" :title="titulo">
    <template #body>
      <div class="space-y-4">
        <p v-if="descripcion" class="text-sm">
          {{ descripcion }}
        </p>
        <slot />
        <UFormField :label="etiqueta" required>
          <UTextarea v-model="motivo" :rows="3" autoresize class="w-full" />
        </UFormField>
        <AlertaError :mensaje="error" />
      </div>
    </template>
    <template #footer>
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
      <UButton :label="confirmar" :color="color" :loading="enviando" :disabled="motivo.trim().length < 3" @click="aceptar" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  titulo: string
  descripcion?: string
  etiqueta?: string
  confirmar?: string
  color?: 'error' | 'warning' | 'primary'
  /** Acción a ejecutar con el motivo; si falla, se muestra el error y el diálogo sigue abierto. */
  accion: (motivo: string) => Promise<unknown>
}>(), { etiqueta: 'Motivo', confirmar: 'Confirmar', color: 'error' })
const emit = defineEmits<{ hecho: [] }>()
const abierto = defineModel<boolean>('open', { default: false })

const motivo = ref('')
watch(abierto, (a) => {
  if (a) motivo.value = ''
})
const { enviando, error, enviar } = useEnvio()

async function aceptar() {
  const r = await enviar(() => props.accion(motivo.value.trim()))
  if (r.ok) {
    abierto.value = false
    emit('hecho')
  }
}
</script>
