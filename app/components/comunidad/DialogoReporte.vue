<!-- Reportar una publicación o un comentario a la moderación -->
<template>
  <UModal v-model:open="abierto" title="Reportar contenido">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-muted">
          La moderación revisará el reporte. Quien publicó no sabrá quién lo reportó.
        </p>
        <URadioGroup v-model="motivo" :items="opciones" value-key="value" />
        <UFormField label="Detalle (opcional)">
          <UTextarea v-model="detalle" :rows="2" autoresize class="w-full" />
        </UFormField>
        <AlertaError :mensaje="error" />
      </div>
    </template>
    <template #footer>
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
      <UButton label="Enviar reporte" color="error" :loading="enviando" @click="enviarReporte" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { MOTIVOS_REPORTE, NOMBRE_MOTIVO } from '#shared/schemas/comunidad'

const props = defineProps<{ url?: string }>()
const abierto = defineModel<boolean>('open', { default: false })
const api = useApi()
const toast = useToast()

const opciones = MOTIVOS_REPORTE.map(m => ({ label: NOMBRE_MOTIVO[m], value: m }))
const motivo = ref<(typeof MOTIVOS_REPORTE)[number]>('INAPROPIADO')
const detalle = ref('')
watch(abierto, a => a && (motivo.value = 'INAPROPIADO', detalle.value = ''))

const { enviando, error, enviar } = useEnvio()
async function enviarReporte() {
  const r = await enviar(() => api(props.url!, { method: 'POST', body: { motivo: motivo.value, detalle: detalle.value } }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Reporte enviado', description: 'Gracias por ayudar a cuidar la comunidad.', color: 'success', icon: 'i-lucide-check' })
  }
}
</script>
