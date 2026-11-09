<!-- Verificación pública de constancias (destino del código QR) -->
<template>
  <div>
    <SitioEncabezado antetitulo="Verificación" titulo="Constancia de participación" />
    <UContainer class="max-w-2xl py-12">
      <div class="rounded-xl bg-default p-8 text-center shadow-tarjeta ring-1 ring-default">
        <template v-if="r?.valida">
          <span class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <UIcon name="i-lucide-badge-check" class="size-8" />
          </span>
          <p class="mt-4 font-display text-2xl font-semibold text-highlighted">
            Constancia válida
          </p>
        </template>
        <template v-else-if="r && 'revocada' in r && r.revocada">
          <span class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <UIcon name="i-lucide-shield-x" class="size-8" />
          </span>
          <p class="mt-4 font-display text-2xl font-semibold text-highlighted">
            Constancia revocada
          </p>
          <p class="mt-1 text-sm text-muted">
            La Federación anuló esta constancia; no tiene validez.
          </p>
        </template>
        <template v-else>
          <span class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <UIcon name="i-lucide-search-x" class="size-8" />
          </span>
          <p class="mt-4 font-display text-2xl font-semibold text-highlighted">
            No encontramos esta constancia
          </p>
          <p class="mt-1 text-sm text-muted">
            Revise el código impreso. Si la duda persiste, comuníquese con la Federación.
          </p>
        </template>

        <dl v-if="r && 'folio' in r" class="mt-8 space-y-3 text-left text-sm">
          <div class="flex justify-between gap-4 border-b border-default pb-3">
            <dt class="text-muted">
              Titular
            </dt><dd class="text-right font-medium text-highlighted">
              {{ r.titular }}
            </dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-default pb-3">
            <dt class="text-muted">
              Evento
            </dt><dd class="text-right text-highlighted">
              {{ r.evento.titulo }}
            </dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-default pb-3">
            <dt class="text-muted">
              Fecha
            </dt><dd class="text-right text-highlighted">
              {{ rangoEvento(r.evento.inicio, r.evento.fin) }}
            </dd>
          </div>
          <div v-if="r.evento.valorCurricular" class="flex justify-between gap-4 border-b border-default pb-3">
            <dt class="text-muted">
              Valor curricular
            </dt><dd class="text-right text-highlighted">
              {{ r.evento.valorCurricular }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              Folio
            </dt><dd class="font-mono text-highlighted">
              {{ r.folio }}
            </dd>
          </div>
        </dl>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Verificación de constancia', robots: 'noindex' })
const route = useRoute()
type Resultado = { valida: false } | { valida: boolean, revocada: boolean, folio: string, emitidaEn: string, titular: string, evento: { titulo: string, inicio: string, fin: string, valorCurricular: string | null } }
const { data: r } = await useFetch<Resultado>(`/api/publico/constancias/${encodeURIComponent(String(route.params.codigo))}`)
</script>
