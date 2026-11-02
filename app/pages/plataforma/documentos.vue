<template>
  <PanelPagina id="documentos" titulo="Documentos" tamano="lg">
    <div class="space-y-8">
      <EncabezadoPagina titulo="Biblioteca institucional">
        Estatutos, reglamentos, actas, convocatorias, convenios, documentos académicos y material de congresos.
        Cada documento indica quién puede consultarlo.
      </EncabezadoPagina>
      <DocumentosBiblioteca />
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Documentos' })
</script>
