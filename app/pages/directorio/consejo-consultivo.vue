<template>
  <div>
    <SitioEncabezado antetitulo="Directorio" titulo="Consejo consultivo" :descripcion="datos?.periodo ? `Periodo ${datos.periodo.nombre}` : undefined">
      <SitioNavDirectorio />
    </SitioEncabezado>

    <UContainer class="space-y-16 py-14">
      <EstadoVacio
        v-if="!datos?.organos.length"
        icono="i-lucide-scale"
        titulo="Información en validación"
        descripcion="La Federación publicará aquí a los integrantes del consejo consultivo una vez validados."
      />
      <section v-for="o in datos?.organos" :key="o.nombre" class="space-y-6">
        <p v-if="o.descripcion" class="max-w-3xl text-lg text-muted">
          {{ o.descripcion }}
        </p>
        <SitioOrganoPublico :organigrama="o.organigrama" />
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { EstructuraPublicaDto } from '~~/server/services/estructura'

useSeoMeta({ title: 'Consejo consultivo' })
const { data: datos } = await useFetch<EstructuraPublicaDto>('/api/publico/estructura', { query: { tipo: 'CONSEJO_CONSULTIVO' } })
</script>
