<!-- Organigrama dinámico: árbol de cargos con las personas en funciones.
     En pantallas grandes se dibuja horizontal con conectores; en el celular, como lista
     escalonada. Sirve para el portal y para el panel. -->
<template>
  <div class="organigrama overflow-x-auto pb-2">
    <ul v-if="nodos.length" class="nivel raiz">
      <EstructuraNodoOrganigrama v-for="n in nodos" :key="n.cargo.id" :nodo="n" />
    </ul>
    <p v-else class="py-6 text-center text-sm text-muted">
      Sin cargos registrados.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { NodoCargo } from '#shared/estructura'
import type { CargoOrganigrama } from '~/types/organigrama'

defineProps<{ nodos: NodoCargo<CargoOrganigrama>[] }>()
</script>

<style>
/* Lista escalonada (celular) */
.organigrama .nivel { display: flex; flex-direction: column; gap: 0.75rem; }
.organigrama .nivel .nivel { margin-top: 0.75rem; padding-left: 1.25rem; border-left: 1px solid var(--ui-border-accented); }

/* Árbol horizontal (pantallas medianas en adelante) */
@media (min-width: 768px) {
  .organigrama .nivel { flex-direction: row; justify-content: center; gap: 0; }
  .organigrama .nivel .nivel { margin-top: 0; padding-left: 0; padding-top: 1.5rem; border-left: 0; position: relative; }
  .organigrama .nivel .nivel::before { content: ''; position: absolute; top: 0; left: 50%; height: 1.5rem; border-left: 1px solid var(--ui-border-accented); }
  .organigrama .nodo { position: relative; padding: 1.5rem 0.5rem 0; display: flex; flex-direction: column; align-items: center; }
  .organigrama .raiz > .nodo { padding-top: 0; }
  /* Conectores entre hermanos */
  .organigrama .nivel .nivel > .nodo::before,
  .organigrama .nivel .nivel > .nodo::after { content: ''; position: absolute; top: 0; width: 50%; height: 1.5rem; border-top: 1px solid var(--ui-border-accented); }
  .organigrama .nivel .nivel > .nodo::before { right: 50%; }
  .organigrama .nivel .nivel > .nodo::after { left: 50%; border-left: 1px solid var(--ui-border-accented); }
  .organigrama .nivel .nivel > .nodo:first-child::before,
  .organigrama .nivel .nivel > .nodo:last-child::after { border-top: 0; }
  .organigrama .nivel .nivel > .nodo:only-child::after { border-top: 0; }
  .organigrama .nivel .nivel > .nodo:last-child::before { border-right: 1px solid var(--ui-border-accented); }
  .organigrama .nivel .nivel > .nodo:only-child::before { display: none; }
}
</style>
