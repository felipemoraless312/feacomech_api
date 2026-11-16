<!-- Recorta una foto antes de subirla: arrastrar para encuadrar, acercar/alejar (rueda, pellizco
     o deslizador) y girar. Entrega un JPEG cuadrado listo para la foto de perfil. -->
<template>
  <UModal v-model:open="abierto" :title="titulo" description="Arrastre la imagen para encuadrarla y use el deslizador para acercar o alejar." :ui="{ content: 'sm:max-w-md' }">
    <template #body>
      <div class="space-y-5">
        <div
          ref="marco"
          class="relative mx-auto aspect-square w-full max-w-80 cursor-grab touch-none select-none overflow-hidden rounded-xl bg-neutral-900 active:cursor-grabbing"
          @pointerdown="alPresionar"
          @pointermove="alMover"
          @pointerup="alSoltar"
          @pointercancel="alSoltar"
          @wheel.prevent="alRueda"
        >
          <canvas ref="lienzo" class="absolute inset-0 size-full" />
          <!-- Guía circular: así se verá la foto en los avatares -->
          <div class="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgb(0_0_0/0.55)] ring-2 ring-white/80" />
          <div v-if="!imagen" class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-white/70" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <UButton icon="i-lucide-zoom-out" color="neutral" variant="ghost" size="sm" aria-label="Alejar" @click="cambiarZoom(zoom / 1.15)" />
          <USlider v-model="zoom" :min="1" :max="ZOOM_MAX" :step="0.01" class="flex-1" aria-label="Acercamiento" />
          <UButton icon="i-lucide-zoom-in" color="neutral" variant="ghost" size="sm" aria-label="Acercar" @click="cambiarZoom(zoom * 1.15)" />
          <UButton icon="i-lucide-rotate-cw" color="neutral" variant="ghost" size="sm" aria-label="Girar" @click="girar" />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
        <UButton label="Usar foto" icon="i-lucide-check" :disabled="!imagen" :loading="ocupado" @click="confirmar" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

const props = withDefaults(defineProps<{
  /** Imagen elegida por el usuario (o la foto actual, para reencuadrarla). */
  archivo: Blob | null
  titulo?: string
  /** Lado en píxeles de la imagen resultante. */
  tamano?: number
}>(), { titulo: 'Ajustar foto', tamano: 800 })

const emit = defineEmits<{ listo: [foto: File] }>()
const abierto = defineModel<boolean>('open', { default: false })

const ZOOM_MAX = 5
const marco = useTemplateRef<HTMLDivElement>('marco')
const lienzo = useTemplateRef<HTMLCanvasElement>('lienzo')

const imagen = shallowRef<HTMLImageElement>()
const zoom = ref(1)
const giro = ref(0) // en cuartos de vuelta
const desplazamiento = reactive({ x: 0, y: 0 }) // centro de la imagen respecto al centro del marco (px de pantalla)
const ocupado = ref(false)
let url: string | undefined

function liberar() {
  if (url) URL.revokeObjectURL(url)
  url = undefined
}

watch([abierto, () => props.archivo], ([open, archivo]) => {
  if (!open || !archivo) return
  imagen.value = undefined
  zoom.value = 1
  giro.value = 0
  desplazamiento.x = desplazamiento.y = 0
  liberar()
  url = URL.createObjectURL(archivo)
  const img = new Image()
  img.onload = async () => {
    imagen.value = img
    await nextTick()
    dibujar()
  }
  img.onerror = () => {
    abierto.value = false
    useToast().add({ title: 'No se pudo abrir la imagen', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  img.src = url
}, { immediate: true })

onBeforeUnmount(liberar)

/** Dimensiones de la imagen ya girada. */
function dimensiones(img: HTMLImageElement) {
  const ancho = img.naturalWidth
  const alto = img.naturalHeight
  return giro.value % 2 ? { ancho: alto, alto: ancho } : { ancho, alto }
}

/** Escala (px de pantalla por px de imagen) para un marco de lado `lado`. */
function escala(img: HTMLImageElement, lado: number) {
  const { ancho, alto } = dimensiones(img)
  return (lado / Math.min(ancho, alto)) * zoom.value
}

/** Evita que queden huecos: la imagen siempre cubre todo el marco. */
function limitar() {
  const img = imagen.value
  const lado = marco.value?.clientWidth
  if (!img || !lado) return
  const s = escala(img, lado)
  const { ancho, alto } = dimensiones(img)
  const maxX = Math.max(0, (ancho * s - lado) / 2)
  const maxY = Math.max(0, (alto * s - lado) / 2)
  desplazamiento.x = Math.min(maxX, Math.max(-maxX, desplazamiento.x))
  desplazamiento.y = Math.min(maxY, Math.max(-maxY, desplazamiento.y))
}

/** Pinta el encuadre en `ctx`, de lado `lado` (px), con el marco en pantalla de lado `ladoMarco`. */
function pintar(ctx: CanvasRenderingContext2D, lado: number, ladoMarco: number) {
  const img = imagen.value!
  const k = lado / ladoMarco
  const s = escala(img, ladoMarco) * k
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, lado, lado)
  ctx.translate(lado / 2 + desplazamiento.x * k, lado / 2 + desplazamiento.y * k)
  ctx.rotate((giro.value * Math.PI) / 2)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, (-img.naturalWidth * s) / 2, (-img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s)
  ctx.restore()
}

function dibujar() {
  const c = lienzo.value
  const lado = marco.value?.clientWidth
  if (!c || !lado || !imagen.value) return
  const px = Math.round(lado * (window.devicePixelRatio || 1))
  if (c.width !== px) c.width = c.height = px
  pintar(c.getContext('2d')!, px, lado)
}

watch([zoom, giro], () => {
  limitar()
  dibujar()
})
useResizeObserver(marco, () => {
  limitar()
  dibujar()
})

function cambiarZoom(z: number) {
  zoom.value = Math.min(ZOOM_MAX, Math.max(1, z))
}

function girar() {
  giro.value = (giro.value + 1) % 4
  desplazamiento.x = desplazamiento.y = 0
}

// --- Arrastre y pellizco
const punteros = new Map<number, { x: number, y: number }>()
let distanciaInicial = 0
let zoomInicial = 1

function distancia() {
  const [a, b] = [...punteros.values()]
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
}

function alPresionar(e: PointerEvent) {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (punteros.size === 2) {
    distanciaInicial = distancia()
    zoomInicial = zoom.value
  }
}

function alMover(e: PointerEvent) {
  const previo = punteros.get(e.pointerId)
  if (!previo) return
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (punteros.size >= 2) {
    if (distanciaInicial) cambiarZoom(zoomInicial * (distancia() / distanciaInicial))
    return
  }
  desplazamiento.x += e.clientX - previo.x
  desplazamiento.y += e.clientY - previo.y
  limitar()
  dibujar()
}

function alSoltar(e: PointerEvent) {
  punteros.delete(e.pointerId)
  if (punteros.size < 2) distanciaInicial = 0
}

function alRueda(e: WheelEvent) {
  cambiarZoom(zoom.value * Math.exp(-e.deltaY * 0.0015))
}

async function confirmar() {
  const lado = marco.value?.clientWidth
  if (!imagen.value || !lado) return
  ocupado.value = true
  try {
    const c = document.createElement('canvas')
    c.width = c.height = props.tamano
    pintar(c.getContext('2d')!, props.tamano, lado)
    const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/jpeg', 0.9))
    if (!blob) throw new Error('No se pudo generar la imagen')
    emit('listo', new File([blob], 'foto.jpg', { type: 'image/jpeg' }))
    abierto.value = false
  }
  catch {
    useToast().add({ title: 'No se pudo procesar la imagen', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    ocupado.value = false
  }
}
</script>
