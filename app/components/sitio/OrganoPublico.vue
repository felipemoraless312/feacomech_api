<!-- Integrantes vigentes de un órgano (mesa directiva o consejo), como tarjetas -->
<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article v-for="(p, i) in personas" :key="`${p.cargo}-${i}`" v-revelar="(i % 6) * 60" class="flex flex-col items-center rounded-2xl bg-default p-6 text-center shadow-tarjeta ring-1 ring-default">
      <FotoPerfil :foto-id="p.fotoId" :nombre="p.nombre" tamano="3xl" class="size-24 text-2xl" />
      <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-marca-700 dark:text-marca-300">
        {{ p.cargo }}
      </p>
      <p class="mt-1 font-display text-lg font-semibold text-highlighted">
        {{ p.nombre }}
      </p>
      <p v-if="p.procedencia" class="text-sm text-muted">
        {{ p.procedencia }}
      </p>
      <p v-if="p.descripcion" class="mt-3 text-sm leading-relaxed text-muted">
        {{ p.descripcion }}
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { NodoCargo } from '#shared/estructura'
import type { EstructuraPublicaDto } from '~~/server/services/estructura'

type Cargo = EstructuraPublicaDto['organos'][number]['organigrama'][number]['cargo']
const props = defineProps<{ organigrama: NodoCargo<Cargo>[] }>()

// Recorre el árbol en orden jerárquico (de arriba abajo).
const personas = computed(() => {
  const lista: (Cargo['personas'][number] & { cargo: string })[] = []
  const recorrer = (nodos: NodoCargo<Cargo>[]) => {
    for (const n of nodos) lista.push(...n.cargo.personas.map(p => ({ ...p, cargo: n.cargo.nombre })))
    for (const n of nodos) recorrer(n.hijos)
  }
  recorrer(props.organigrama)
  return lista
})
</script>
