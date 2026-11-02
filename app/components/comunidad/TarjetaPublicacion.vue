<!-- Publicación en la lista de actividad -->
<template>
  <article class="rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
    <header class="flex items-start gap-3">
      <FotoPerfil :foto-id="p.autor.perfil?.fotoId" :nombre="nombreCompleto(p.autor)" />
      <div class="min-w-0 flex-1">
        <p class="text-sm">
          <span class="font-medium text-highlighted">{{ nombreCompleto(p.autor) }}</span>
          <span v-if="p.autor.perfil?.especialidad" class="text-muted"> · {{ p.autor.perfil.especialidad.nombre }}</span>
        </p>
        <p class="text-xs text-dimmed">
          <NuxtLink v-if="mostrarGrupo" :to="`/plataforma/comunidad/${p.grupo.slug}`" class="hover:text-primary">{{ p.grupo.nombre }}</NuxtLink><template v-if="mostrarGrupo">
            ·
          </template>{{ formatoFechaHora(p.creadaEn) }}<template v-if="p.editadaEn">
            · editada
          </template>
        </p>
      </div>
      <UBadge v-if="p.fijada" icon="i-lucide-pin" label="Fijada" color="primary" variant="soft" size="sm" />
    </header>

    <NuxtLink :to="`/plataforma/comunidad/publicacion/${p.id}`" class="mt-3 block">
      <p v-if="p.titulo" class="font-display text-lg font-semibold leading-snug text-highlighted hover:text-primary">
        {{ p.titulo }}
      </p>
      <p class="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-muted">
        {{ p.contenido }}
      </p>
      <span v-if="p.recortado" class="text-sm font-medium text-primary">Seguir leyendo</span>
    </NuxtLink>

    <ComunidadAdjuntos :adjuntos="p.adjuntos" class="mt-3" />

    <footer class="mt-3 flex flex-wrap items-center gap-2 border-t border-default pt-3">
      <ComunidadReacciones :resumen="p.reacciones" :url="`/api/comunidad/publicaciones/${p.id}/reaccion`" />
      <UButton :to="`/plataforma/comunidad/publicacion/${p.id}`" icon="i-lucide-message-circle" :label="`${p.comentarios}`" size="xs" color="neutral" variant="ghost" aria-label="Comentarios" />
      <UButton v-if="!p.propia" icon="i-lucide-flag" size="xs" color="neutral" variant="ghost" class="ml-auto" aria-label="Reportar" @click="emit('reportar', p.id)" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { PublicacionFila } from '~~/server/services/comunidad'

defineProps<{ p: PublicacionFila, mostrarGrupo?: boolean }>()
const emit = defineEmits<{ reportar: [id: string] }>()
</script>
