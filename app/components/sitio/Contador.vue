<!-- Cifra que «cuenta» hasta su valor al entrar en pantalla. Acepta texto como «800+» o «1978». -->
<template>
  <span ref="el" class="tabular-nums">{{ mostrado }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ valor: string }>()

const partes = computed(() => {
  const m = props.valor.match(/^(\D*)([\d.,]+)(.*)$/)
  if (!m) return null
  const n = Number(m[2]!.replace(/,/g, ''))
  return Number.isFinite(n) ? { prefijo: m[1]!, n, sufijo: m[3]!, conMiles: m[2]!.includes(',') } : null
})
const formato = (n: number) => {
  const p = partes.value!
  const esAnio = p.n >= 1900 && p.n <= 2100 && !p.conMiles
  return `${p.prefijo}${esAnio ? String(Math.round(n)) : Math.round(n).toLocaleString('es-MX')}${p.sufijo}`
}

const mostrado = ref(props.valor)
const el = ref<HTMLElement>()
let obs: IntersectionObserver | undefined
onBeforeUnmount(() => obs?.disconnect())

onMounted(() => {
  const p = partes.value
  if (!p || !el.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Los años arrancan cerca de su valor; las cantidades, desde cero.
  const desde = p.n >= 1900 && p.n <= 2100 ? p.n - 60 : 0
  mostrado.value = formato(desde)
  obs = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    obs?.disconnect()
    const t0 = performance.now()
    const dur = 1400
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      const suave = 1 - (1 - k) ** 3
      mostrado.value = formato(desde + (p.n - desde) * suave)
      if (k < 1) requestAnimationFrame(paso)
    }
    requestAnimationFrame(paso)
  }, { threshold: 0.4 })
  obs.observe(el.value)
})
</script>
