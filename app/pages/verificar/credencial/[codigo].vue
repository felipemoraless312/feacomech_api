<!-- Verificación pública de la credencial digital (destino del QR del reverso). Muestra sólo
     lo indispensable para comprobarla: nombre, especialidad, colegio y vigencia. -->
<template>
  <div>
    <SitioEncabezado antetitulo="Verificación" titulo="Credencial de afiliado" />
    <UContainer class="max-w-xl py-12">
      <div v-revelar.escala class="overflow-hidden rounded-2xl bg-default shadow-flotante ring-1 ring-default">
        <div class="h-1.5" :class="tono.barra" />
        <div class="p-8 text-center">
          <span class="sello mx-auto flex size-16 items-center justify-center rounded-2xl" :class="tono.sello">
            <UIcon :name="tono.icono" class="size-9" />
          </span>
          <p class="mt-4 font-display text-2xl font-semibold text-highlighted">
            {{ tono.titulo }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ tono.texto }}
          </p>

          <template v-if="r?.encontrada">
            <div class="mt-8 flex flex-col items-center gap-3">
              <FotoPerfil :foto-id="r.fotoId" :nombre="r.nombre" tamano="3xl" class="size-24 text-2xl ring-4 ring-marca-100" />
              <p class="font-display text-xl font-bold text-highlighted">
                {{ r.nombre }}
              </p>
              <p v-if="r.profesion || r.especialidad" class="-mt-2 text-sm text-muted">
                {{ [r.profesion, r.especialidad].filter(Boolean).join(' · ') }}
              </p>
            </div>

            <dl class="mt-8 space-y-3 text-left text-sm">
              <div v-if="r.organizaciones.length" class="flex justify-between gap-4 border-b border-default pb-3">
                <dt class="shrink-0 text-muted">
                  Afiliado a
                </dt>
                <dd class="text-right text-highlighted">
                  <span v-for="o in r.organizaciones" :key="o" class="block">{{ o }}</span>
                </dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-default pb-3">
                <dt class="text-muted">
                  Folio
                </dt>
                <dd class="font-mono text-highlighted">
                  {{ r.folio }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-muted">
                  Consultada
                </dt>
                <dd class="text-right text-highlighted">
                  {{ formatoFechaHora(r.consultadaEn) }}
                </dd>
              </div>
            </dl>
          </template>
        </div>
      </div>
      <p class="mt-6 text-center text-xs text-dimmed">
        La vigencia se consulta en tiempo real en la plataforma de la FEACOMECH.
      </p>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { formatoFechaHora } from '#shared/texto'
import type { VerificacionCredencialDto } from '~~/server/services/credencial'

const route = useRoute()
const { data: r } = await useFetch<VerificacionCredencialDto>(`/api/publico/credencial/${encodeURIComponent(String(route.params.codigo))}`)

useSeoMeta({ title: 'Verificación de credencial', robots: 'noindex, nofollow' })

const tono = computed(() => {
  if (r.value?.encontrada && r.value.vigente) {
    return { titulo: 'Credencial vigente', texto: 'La persona es médico afiliado a la Federación.', icono: 'i-lucide-badge-check', sello: 'bg-success/10 text-success', barra: 'bg-gradient-to-r from-success/70 to-success' }
  }
  if (r.value?.encontrada) {
    return { titulo: 'Credencial no vigente', texto: 'La afiliación o la validación de su perfil no están vigentes en este momento.', icono: 'i-lucide-shield-alert', sello: 'bg-warning/10 text-warning', barra: 'bg-gradient-to-r from-warning/70 to-warning' }
  }
  return { titulo: 'No encontramos esta credencial', texto: 'El código no es válido. Si la duda persiste, comuníquese con la Federación.', icono: 'i-lucide-search-x', sello: 'bg-error/10 text-error', barra: 'bg-gradient-to-r from-error/70 to-error' }
})
</script>

<style scoped>
.sello {
  animation: sello 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}
@keyframes sello {
  from { opacity: 0; transform: scale(0.4) rotate(-12deg); }
}
@media (prefers-reduced-motion: reduce) {
  .sello { animation: none; }
}
</style>
