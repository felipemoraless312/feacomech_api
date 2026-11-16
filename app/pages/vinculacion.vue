<template>
  <div>
    <SitioEncabezado antetitulo="Vinculación institucional" titulo="Instituciones aliadas" descripcion="Dependencias de gobierno, instituciones y organismos con los que la Federación colabora mediante convenios y proyectos conjuntos." />

    <UContainer class="space-y-16 py-14">
      <EstadoVacio v-if="!vinculos?.length" icono="i-lucide-handshake" titulo="Información en preparación" descripcion="La Federación publicará aquí sus convenios y alianzas." />
      <!-- Una sola cuadrícula: cada tarjeta ya dice si es convenio, institución u organismo. -->
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SitioTarjetaInstitucion v-for="(v, n) in ordenados" :key="v.nombre" v-revelar.escala="n * 100" :vinculo="v" :indice="n" />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { TIPOS_VINCULO } from '#shared/schemas/portal'

useSeoMeta({ title: 'Vinculación institucional', description: 'Instituciones públicas, convenios y organismos con los que colabora la Federación.' })

interface Vinculo { tipo: (typeof TIPOS_VINCULO)[number], nombre: string, descripcion: string | null, sitioWeb: string | null, logoId: string | null, fechaFirma: string | null, vigenciaHasta: string | null }
const { data: vinculos } = await useFetch<Vinculo[]>('/api/publico/vinculos')

// Convenios primero, luego instituciones y organismos (el orden de TIPOS_VINCULO es otro).
const PRIORIDAD = { CONVENIO: 0, INSTITUCION: 1, ORGANISMO: 2 } as const
const ordenados = computed(() => [...(vinculos.value ?? [])].sort((a, b) => PRIORIDAD[a.tipo] - PRIORIDAD[b.tipo]))
</script>
