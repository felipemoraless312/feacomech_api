<template>
  <div>
    <SitioEncabezado antetitulo="Colaboradores" titulo="Colaboradores de la Federación" descripcion="Empresas, instituciones y organismos que colaboran con la Federación." />

    <UContainer class="space-y-16 py-14">
      <EstadoVacio v-if="!vinculos?.length" icono="i-lucide-handshake" titulo="Información en preparación" descripcion="La Federación publicará aquí sus convenios y alianzas." />
      <section v-for="t in grupos" :key="t.tipo" class="space-y-6">
        <h2 v-revelar class="font-display text-2xl font-semibold tracking-tight text-highlighted">
          {{ t.titulo }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <article v-for="v in t.lista" :key="v.nombre" v-revelar class="flex gap-4 rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
            <LogoOrganizacion :logo-id="v.logoId" :nombre="v.nombre" tamano="lg" />
            <div class="min-w-0 space-y-1">
              <p class="font-medium text-highlighted">
                {{ v.nombre }}
              </p>
              <p v-if="v.fechaFirma" class="text-xs text-dimmed">
                Firmado el {{ fechaCorta(v.fechaFirma) }}<template v-if="v.vigenciaHasta">
                  · vigente hasta {{ fechaCorta(v.vigenciaHasta) }}
                </template>
              </p>
              <p v-if="v.descripcion" class="text-sm leading-relaxed text-muted">
                {{ v.descripcion }}
              </p>
              <a v-if="v.sitioWeb" :href="v.sitioWeb" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Sitio web <UIcon name="i-lucide-external-link" class="size-3.5" />
              </a>
            </div>
          </article>
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { TIPOS_VINCULO } from '#shared/schemas/portal'

useSeoMeta({ title: 'Colaboradores', description: 'Convenios, instituciones colaboradoras y organismos relacionados con la Federación.' })

interface Vinculo { tipo: (typeof TIPOS_VINCULO)[number], nombre: string, descripcion: string | null, sitioWeb: string | null, logoId: string | null, fechaFirma: string | null, vigenciaHasta: string | null }
const { data: vinculos } = await useFetch<Vinculo[]>('/api/publico/vinculos')

const TITULOS = { INSTITUCION: 'Instituciones colaboradoras', CONVENIO: 'Convenios', ORGANISMO: 'Organismos relacionados' } as const
const grupos = computed(() => TIPOS_VINCULO
  .map(tipo => ({ tipo, titulo: TITULOS[tipo], lista: (vinculos.value ?? []).filter(v => v.tipo === tipo) }))
  .filter(g => g.lista.length))
</script>
