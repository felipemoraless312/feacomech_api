<!-- Lista de documentos con vista previa (PDF e imágenes) y descarga. Sirve al portal y a la plataforma. -->
<template>
  <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default">
    <ul class="divide-y divide-default">
      <li v-for="d in documentos" :key="d.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4" :class="{ 'opacity-60': !d.vigente }">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-700 dark:bg-marca-950 dark:text-marca-200">
          <UIcon :name="icono(d.archivo.mime)" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-highlighted">
            {{ d.titulo }}
            <UBadge v-if="!d.vigente" label="No vigente" color="neutral" variant="soft" size="sm" class="ml-1 align-middle" />
          </p>
          <p class="text-sm text-muted">
            {{ [d.categoria.nombre, d.organizacion ? (d.organizacion.siglas || d.organizacion.nombre) : null, d.fechaDocumento ? fechaCorta(d.fechaDocumento) : null, `${extension(d.archivo.nombreOriginal)} · ${tamano(d.archivo.tamano)}`].filter(Boolean).join(' · ') }}
          </p>
          <p v-if="d.descripcion" class="mt-0.5 line-clamp-2 text-sm text-dimmed">
            {{ d.descripcion }}
          </p>
        </div>
        <UBadge v-if="mostrarNivel" :label="NIVEL_CORTO[d.nivelAcceso]" :color="d.nivelAcceso === 'PUBLICO' ? 'success' : d.nivelAcceso === 'RESTRINGIDO' ? 'error' : 'neutral'" variant="soft" size="sm" />
        <div class="flex gap-1">
          <UButton v-if="previsualizable(d.archivo.mime)" icon="i-lucide-eye" size="sm" color="neutral" variant="ghost" aria-label="Vista previa" @click="previa = d" />
          <UButton :to="`/api/documentos/${d.id}/archivo?descargar=1`" external icon="i-lucide-download" size="sm" color="neutral" variant="ghost" aria-label="Descargar" />
          <UButton v-if="'editable' in d && d.editable" icon="i-lucide-pencil" size="sm" color="neutral" variant="ghost" aria-label="Editar" @click="emit('editar', d)" />
        </div>
      </li>
    </ul>

    <UModal :open="!!previa" :title="previa?.titulo" fullscreen @update:open="v => !v && (previa = undefined)">
      <template #body>
        <div v-if="previa" class="h-full min-h-[70vh]">
          <img v-if="previa.archivo.mime.startsWith('image/')" :src="`/api/documentos/${previa.id}/archivo`" :alt="previa.titulo" class="mx-auto max-h-full object-contain">
          <iframe v-else :src="`/api/documentos/${previa.id}/archivo`" :title="previa.titulo" class="size-full min-h-[75vh] rounded-xl bg-muted" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts" generic="T extends DocumentoLista">
import type { DocumentoLista } from '~/types/documentos'

defineProps<{ documentos: T[], mostrarNivel?: boolean }>()
const emit = defineEmits<{ editar: [d: T] }>()
const previa = ref<T>()

const NIVEL_CORTO: Record<string, string> = { PUBLICO: 'Público', AFILIADOS: 'Afiliados', ORGANIZACION: 'Organización', RESTRINGIDO: 'Restringido' }
const previsualizable = (mime: string) => mime === 'application/pdf' || mime.startsWith('image/')
const icono = (mime: string) => mime === 'application/pdf' ? 'i-lucide-file-text' : mime.startsWith('image/') ? 'i-lucide-image' : mime.includes('sheet') || mime.includes('excel') ? 'i-lucide-file-spreadsheet' : mime.includes('presentation') ? 'i-lucide-presentation' : 'i-lucide-file'
const extension = (n: string) => (n.split('.').pop() ?? '').toUpperCase()
const tamano = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`)
</script>
