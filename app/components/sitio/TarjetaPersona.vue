<!-- Integrante de un órgano. Si tiene reseña curricular, toda la tarjeta lleva a su página
     (/organizacion/<slug>), donde se lee completa; si no, se indica que está en preparación. -->
<template>
  <component
    :is="enlace ? NuxtLink : 'article'"
    :to="enlace"
    class="group flex flex-col rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default"
    :class="{ 'elevar hover:ring-marca-200 dark:hover:ring-marca-800': enlace }"
  >
    <div class="flex items-center gap-4">
      <FotoPerfil :src="foto" :nombre="nombreSinTitulo" tamano="3xl" class="size-16 shrink-0 text-xl transition-transform duration-500 group-hover:scale-105" />
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-marca-700 dark:text-marca-300">
          {{ cargo }}
        </p>
        <p class="mt-0.5 font-display text-lg font-semibold leading-snug text-highlighted">
          {{ nombre }}
        </p>
      </div>
    </div>
    <div class="mt-4 border-t border-default pt-3">
      <p v-if="enlace" class="line-clamp-2 text-sm leading-relaxed text-muted">
        {{ extracto }}
      </p>
      <p class="text-sm" :class="enlace ? 'mt-3 inline-flex items-center gap-1 font-medium text-primary' : 'text-dimmed'">
        {{ enlace ? 'Leer reseña completa' : 'Reseña curricular en preparación.' }}
        <UIcon v-if="enlace" name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
      </p>
    </div>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

const props = defineProps<{ cargo: string, nombre: string, resena?: string, foto?: string, slug?: string }>()
// Las iniciales del avatar no deben salir de «Dr.», «Dra.», «QFB.», «Ing.»…
const nombreSinTitulo = computed(() => props.nombre.split(' ').filter(p => !p.endsWith('.')).join(' '))
const enlace = computed(() => (props.resena && props.slug ? `/organizacion/${props.slug}` : undefined))
// Primer párrafo como adelanto.
const extracto = computed(() => props.resena?.split(/\n\s*\n/)[0])
</script>
