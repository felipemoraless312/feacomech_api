<!-- Grupos visibles, agrupados por tipo -->
<template>
  <nav class="space-y-5" aria-label="Grupos de la comunidad">
    <div v-for="t in tipos" :key="t.tipo" class="space-y-1">
      <p class="px-2 text-[11px] font-semibold uppercase tracking-wide text-dimmed">
        {{ t.titulo }}
      </p>
      <NuxtLink
        v-for="g in t.grupos"
        :key="g.id"
        :to="`/plataforma/comunidad/${g.slug}`"
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
        :class="activo === g.slug ? 'bg-marca-50 font-medium text-marca-800 dark:bg-marca-950 dark:text-marca-200' : 'text-muted hover:bg-muted hover:text-highlighted'"
      >
        <UIcon :name="ICONO[g.tipo]" class="size-4 shrink-0" />
        <span class="min-w-0 flex-1 truncate">{{ g.nombre }}</span>
        <UIcon v-if="g.privacidad === 'PRIVADO'" name="i-lucide-lock" class="size-3 shrink-0 text-dimmed" />
        <UBadge v-if="g.solicitudes" :label="String(g.solicitudes)" color="warning" size="sm" />
        <span v-else-if="g.acceso.miembro && g.tipo !== 'GENERAL'" class="size-1.5 shrink-0 rounded-full bg-primary" title="Es miembro" />
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { GrupoDto } from '~~/server/services/comunidad'

const props = defineProps<{ grupos: GrupoDto[], activo?: string }>()
const ICONO: Record<string, string> = { GENERAL: 'i-lucide-messages-square', ESPECIALIDAD: 'i-lucide-stethoscope', ORGANIZACION: 'i-lucide-landmark', DEBATE: 'i-lucide-graduation-cap' }
const TITULOS = { GENERAL: 'General', DEBATE: 'Debates académicos', ORGANIZACION: 'Mis organizaciones', ESPECIALIDAD: 'Especialidades' } as const
const tipos = computed(() => (['GENERAL', 'DEBATE', 'ORGANIZACION', 'ESPECIALIDAD'] as const)
  .map(tipo => ({ tipo, titulo: TITULOS[tipo], grupos: props.grupos.filter(g => g.tipo === tipo && g.activo) }))
  .filter(t => t.grupos.length))
</script>
