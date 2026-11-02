<!-- Imágenes y documentos adjuntos de una publicación (servidos con control de acceso) -->
<template>
  <div v-if="adjuntos.length" class="space-y-2">
    <div v-if="imagenes.length" class="grid gap-2" :class="imagenes.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'">
      <a v-for="a in imagenes" :key="a.id" :href="`/api/comunidad/adjuntos/${a.id}`" target="_blank" rel="noopener" class="group relative block overflow-hidden rounded-xl bg-muted">
        <img :src="`/api/comunidad/adjuntos/${a.id}`" :alt="a.archivo.nombreOriginal" class="w-full object-cover transition-transform group-hover:scale-[1.02]" :class="imagenes.length === 1 ? 'max-h-[28rem]' : 'aspect-square'" loading="lazy">
        <UButton v-if="editable" icon="i-lucide-x" size="xs" color="neutral" class="absolute right-2 top-2" aria-label="Quitar" @click.prevent="emit('quitar', a.id)" />
      </a>
    </div>
    <ul v-if="documentos.length" class="space-y-1.5">
      <li v-for="a in documentos" :key="a.id" class="flex items-center gap-3 rounded-xl bg-muted px-3 py-2 text-sm">
        <UIcon name="i-lucide-file-text" class="size-5 shrink-0 text-marca-600" />
        <a :href="`/api/comunidad/adjuntos/${a.id}`" target="_blank" rel="noopener" class="min-w-0 flex-1 truncate text-highlighted hover:text-primary">{{ a.archivo.nombreOriginal }}</a>
        <span class="text-xs text-dimmed">{{ Math.ceil(a.archivo.tamano / 1024) }} KB</span>
        <UButton :to="`/api/comunidad/adjuntos/${a.id}?descargar=1`" external icon="i-lucide-download" size="xs" color="neutral" variant="ghost" aria-label="Descargar" />
        <UButton v-if="editable" icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Quitar" @click="emit('quitar', a.id)" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Adjunto { id: string, archivo: { mime: string, nombreOriginal: string, tamano: number } }
const props = defineProps<{ adjuntos: Adjunto[], editable?: boolean }>()
const emit = defineEmits<{ quitar: [id: string] }>()
const imagenes = computed(() => props.adjuntos.filter(a => a.archivo.mime.startsWith('image/')))
const documentos = computed(() => props.adjuntos.filter(a => !a.archivo.mime.startsWith('image/')))
</script>
