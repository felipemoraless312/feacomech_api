<!-- Galería de fotos de una noticia en el editor: subir varias a la vez (se reducen en el
     navegador), pie de foto, ordenar y eliminar. Las fotos se ven en el portal debajo del texto. -->
<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-bold text-highlighted">Galería de fotos</h2>
        <p class="text-xs text-dimmed">
          {{ fotos.length }} de {{ MAXIMO }} · se muestran en el portal debajo del texto. Las fotos se reducen y se les quita la ubicación al subirlas.
        </p>
      </div>
      <UButton
        v-if="editable"
        icon="i-lucide-image-plus"
        :label="subiendo ? `Subiendo ${progreso.hechas}/${progreso.total}…` : 'Agregar fotos'"
        :loading="subiendo"
        :disabled="fotos.length >= MAXIMO"
        @click="selector?.click()"
      />
      <input ref="selector" type="file" accept="image/*" multiple class="hidden" @change="elegir">
    </div>

    <div
      v-if="!fotos.length"
      class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-default px-4 py-10 text-center"
      :class="editable ? 'cursor-pointer hover:border-marca-300 hover:bg-marca-50/50 dark:hover:bg-white/5' : ''"
      @click="editable && selector?.click()"
      @dragover.prevent
      @drop.prevent="soltar"
    >
      <UIcon name="i-lucide-images" class="size-9 text-dimmed" />
      <p class="text-sm font-medium text-highlighted">{{ editable ? 'Agregue fotos del evento o la actividad' : 'Esta noticia no tiene galería' }}</p>
      <p v-if="editable" class="text-xs text-muted">Puede elegir varias a la vez o arrastrarlas aquí.</p>
    </div>

    <TransitionGroup v-else tag="div" name="foto" class="grid grid-cols-2 gap-3 sm:grid-cols-3" @dragover.prevent @drop.prevent="soltar">
      <figure v-for="(f, i) in fotos" :key="f.id" class="overflow-hidden rounded-xl bg-default shadow-tarjeta ring-1 ring-default">
        <div class="group relative aspect-[4/3] bg-muted">
          <img :src="`/api/archivos/${f.archivoId}`" :alt="f.pie ?? ''" loading="lazy" class="size-full object-cover">
          <span class="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">{{ i + 1 }}</span>
          <div v-if="editable" class="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-6 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
            <div class="flex gap-1">
              <UButton icon="i-lucide-arrow-left" size="xs" color="neutral" variant="solid" :disabled="i === 0 || ordenando" aria-label="Mover antes" @click="mover(i, -1)" />
              <UButton icon="i-lucide-arrow-right" size="xs" color="neutral" variant="solid" :disabled="i === fotos.length - 1 || ordenando" aria-label="Mover después" @click="mover(i, 1)" />
            </div>
            <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="solid" aria-label="Eliminar foto" @click="eliminar(f)" />
          </div>
        </div>
        <figcaption class="p-2">
          <input
            v-if="editable"
            v-model="f.pie"
            maxlength="200"
            placeholder="Pie de foto (opcional)"
            class="w-full rounded-md bg-transparent px-1.5 py-1 text-xs text-highlighted outline-none placeholder:text-dimmed focus:bg-muted"
            @change="guardarPie(f)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          >
          <p v-else class="px-1.5 py-1 text-xs text-muted">{{ f.pie || 'Sin pie de foto' }}</p>
        </figcaption>
      </figure>
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
interface Foto { id: string, archivoId: string, pie: string | null }

const props = defineProps<{ noticiaId: string, fotosIniciales: Foto[], editable: boolean }>()

const MAXIMO = 40
const api = useApi()
const toast = useToast()
const selector = useTemplateRef<HTMLInputElement>('selector')
const fotos = ref<Foto[]>(props.fotosIniciales.map(f => ({ ...f })))
watch(() => props.fotosIniciales, (v) => { fotos.value = v.map(f => ({ ...f })) })

const subiendo = ref(false)
const ordenando = ref(false)
const progreso = reactive({ hechas: 0, total: 0 })

function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) subir([...input.files])
  input.value = ''
}
function soltar(e: DragEvent) {
  if (props.editable && e.dataTransfer?.files) subir([...e.dataTransfer.files])
}

async function subir(archivos: File[]) {
  const imagenes = archivos.filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
  const cupo = MAXIMO - fotos.value.length
  if (imagenes.length > cupo) toast.add({ title: `Sólo caben ${cupo} foto(s) más`, color: 'warning' })
  const cola = imagenes.slice(0, Math.max(0, cupo))
  if (!cola.length) return
  subiendo.value = true
  progreso.hechas = 0
  progreso.total = cola.length
  let fallidas = 0
  for (const archivo of cola) {
    try {
      const reducida = await reducirImagen(archivo)
      const datos = new FormData()
      datos.append('foto', reducida, archivo.name.replace(/\.[^.]+$/, '') + '.jpg')
      const f = await api<Foto>(`/api/noticias/${props.noticiaId}/fotos`, { method: 'POST', body: datos })
      fotos.value.push(f)
    }
    catch (err) {
      fallidas++
      toast.add({ title: `${archivo.name}: ${err instanceof Error && !('statusCode' in err) ? err.message : errorDeApi(err).mensaje}`, color: 'error' })
    }
    progreso.hechas++
  }
  subiendo.value = false
  const hechas = cola.length - fallidas
  if (hechas) toast.add({ title: `${hechas} foto(s) agregada(s)`, color: 'success', icon: 'i-lucide-check' })
}

async function guardarPie(f: Foto) {
  try {
    await api(`/api/noticias/${props.noticiaId}/fotos/${f.id}`, { method: 'PATCH', body: { pie: f.pie?.trim() || null } })
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error' })
  }
}

async function mover(i: number, delta: number) {
  const lista = [...fotos.value]
  const [f] = lista.splice(i, 1)
  lista.splice(i + delta, 0, f!)
  fotos.value = lista
  ordenando.value = true
  try {
    await api(`/api/noticias/${props.noticiaId}/fotos/orden`, { method: 'PUT', body: { ids: lista.map(x => x.id) } })
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error' })
  }
  finally {
    ordenando.value = false
  }
}

async function eliminar(f: Foto) {
  if (!confirm('¿Eliminar esta foto de la galería?')) return
  try {
    await api(`/api/noticias/${props.noticiaId}/fotos/${f.id}`, { method: 'DELETE' })
    fotos.value = fotos.value.filter(x => x.id !== f.id)
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error' })
  }
}
</script>

<style scoped>
.foto-move, .foto-enter-active, .foto-leave-active { transition: all 0.3s ease; }
.foto-enter-from, .foto-leave-to { opacity: 0; transform: scale(0.9); }
.foto-leave-active { position: absolute; }
</style>
