<template>
  <div>
    <SitioEncabezado
      antetitulo="Directorio"
      titulo="Mesa directiva"
      :descripcion="datos?.periodo ? `Periodo ${datos.periodo.nombre}` : 'Integrantes de la mesa directiva de la Federación.'"
    >
      <SitioNavDirectorio />
    </SitioEncabezado>

    <UContainer class="space-y-16 py-14">
      <EstadoVacio
        v-if="!datos?.organos.length"
        icono="i-lucide-users-round"
        titulo="Información en validación"
        descripcion="La Federación publicará aquí a los integrantes de su mesa directiva una vez validados."
      />
      <section v-for="o in datos?.organos" :key="o.nombre" class="space-y-6">
        <h2 v-if="(datos?.organos.length ?? 0) > 1" class="font-display text-2xl font-semibold text-highlighted">
          {{ o.nombre }}
        </h2>
        <SitioOrganoPublico :organigrama="o.organigrama" />
      </section>

      <section v-if="historial?.length" class="space-y-6">
        <h2 v-revelar class="font-display text-2xl font-semibold tracking-tight text-highlighted">
          Mesas directivas anteriores
        </h2>
        <div class="space-y-3">
          <details v-for="p in historial" :key="p.nombre" class="group rounded-2xl bg-default shadow-tarjeta ring-1 ring-default">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
              <span class="font-medium text-highlighted">{{ p.nombre }}</span>
              <span class="flex items-center gap-3 text-sm text-muted">
                {{ fechaCorta(p.inicio) }} – {{ fechaCorta(p.fin) }}
                <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <ul class="divide-y divide-default border-t border-default">
              <li v-for="(i, n) in p.integrantes" :key="n" class="flex items-center gap-3 px-5 py-3">
                <FotoPerfil :foto-id="i.fotoId" :nombre="i.nombre" tamano="sm" />
                <span class="min-w-0 flex-1 text-sm text-highlighted">{{ i.nombre }}</span>
                <span class="text-sm text-muted">{{ i.cargo }}</span>
              </li>
            </ul>
          </details>
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { EstructuraPublicaDto } from '~~/server/services/estructura'

useSeoMeta({ title: 'Mesa directiva', description: 'Mesa directiva de la Federación de Asociaciones y Colegios Médicos del Estado de Chiapas.' })

const { data: datos } = await useFetch<EstructuraPublicaDto>('/api/publico/estructura', { query: { tipo: 'MESA_DIRECTIVA' } })
interface Periodo { nombre: string, inicio: string, fin: string, integrantes: { cargo: string, nombre: string, fotoId: string | null }[] }
const { data: historial } = await useFetch<Periodo[]>('/api/publico/estructura/historial')
</script>
