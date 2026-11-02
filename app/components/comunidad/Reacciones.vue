<!-- Reacciones de una publicación o comentario: una por persona; tocar la propia la quita -->
<template>
  <div class="flex flex-wrap items-center gap-1">
    <UButton
      v-for="(r, tipo) in REACCIONES"
      :key="tipo"
      :icon="r.icono"
      :label="String(conteo[tipo] ?? 0)"
      size="xs"
      :color="mia === tipo ? 'primary' : 'neutral'"
      :variant="mia === tipo ? 'soft' : 'ghost'"
      :aria-label="r.etiqueta"
      :title="r.etiqueta"
      :disabled="desactivado"
      @click="reaccionar(tipo)"
    />
  </div>
</template>

<script setup lang="ts">
import { REACCIONES, type TIPOS_REACCION } from '#shared/schemas/comunidad'

type Tipo = (typeof TIPOS_REACCION)[number]
const props = defineProps<{ resumen: { conteo: Partial<Record<Tipo, number>>, mia: Tipo | null }, url: string, desactivado?: boolean }>()
const api = useApi()
const toast = useToast()

// Estado local optimista: la interfaz responde de inmediato.
const conteo = ref({ ...props.resumen.conteo })
const mia = ref(props.resumen.mia)
watch(() => props.resumen, (r) => {
  conteo.value = { ...r.conteo }
  mia.value = r.mia
})

async function reaccionar(tipo: Tipo) {
  const antes = { conteo: { ...conteo.value }, mia: mia.value }
  const nueva = mia.value === tipo ? null : tipo
  if (mia.value) conteo.value[mia.value] = Math.max(0, (conteo.value[mia.value] ?? 1) - 1)
  if (nueva) conteo.value[nueva] = (conteo.value[nueva] ?? 0) + 1
  mia.value = nueva
  try {
    await api(props.url, { method: 'POST', body: { tipo: nueva } })
  }
  catch (e) {
    conteo.value = antes.conteo
    mia.value = antes.mia
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
