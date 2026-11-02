<template>
  <li class="nodo">
    <div class="w-full rounded-2xl bg-default p-4 shadow-tarjeta ring-1 ring-default md:w-56">
      <p class="text-xs font-semibold uppercase tracking-wide text-marca-700 dark:text-marca-300">
        {{ nodo.cargo.nombre }}
      </p>
      <ul v-if="nodo.cargo.personas.length" class="mt-3 space-y-2.5">
        <li v-for="(p, i) in nodo.cargo.personas" :key="i" class="flex items-center gap-2.5">
          <FotoPerfil :foto-id="p.fotoId" :nombre="p.nombre" tamano="md" />
          <div class="min-w-0">
            <p class="text-sm font-medium leading-tight text-highlighted">
              {{ p.nombre }}
            </p>
            <p v-if="p.procedencia || p.sinPublicar" class="text-xs text-muted">
              {{ p.procedencia }}<UBadge v-if="p.sinPublicar" label="Sin publicar" color="warning" variant="soft" size="sm" :class="{ 'ml-1': p.procedencia }" />
            </p>
          </div>
        </li>
      </ul>
      <p v-else class="mt-2 text-sm text-dimmed">
        Sin titular registrado
      </p>
    </div>
    <ul v-if="nodo.hijos.length" class="nivel">
      <EstructuraNodoOrganigrama v-for="h in nodo.hijos" :key="h.cargo.id" :nodo="h" />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { NodoCargo } from '#shared/estructura'
import type { CargoOrganigrama } from '~/types/organigrama'

defineProps<{ nodo: NodoCargo<CargoOrganigrama> }>()
</script>
