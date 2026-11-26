<!-- Institución aliada (vinculación): logotipo grande sobre panel blanco —los logos oficiales se
     diseñan para fondo claro, también en modo oscuro—, tipo de vínculo y nombre.
     Movimiento sobrio: un destello recorre el logo de vez en cuando (alternado entre tarjetas con
     `indice`) y, al pasar el cursor, la tarjeta se eleva, el logo se acerca y se dibuja el filete
     de la marca. Todo se desactiva con «reducir movimiento». -->
<template>
  <component
    :is="vinculo.sitioWeb ? 'a' : 'div'"
    :href="vinculo.sitioWeb ?? undefined"
    :target="vinculo.sitioWeb ? '_blank' : undefined"
    :rel="vinculo.sitioWeb ? 'noopener' : undefined"
    class="institucion group relative isolate flex flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default"
    :style="{ '--retraso-brillo': `${2 + indice * 1.6}s` }"
    :aria-label="vinculo.sitioWeb ? `${vinculo.nombre} (sitio oficial, se abre en otra pestaña)` : undefined"
  >
    <div class="institucion-panel relative flex items-center justify-center bg-white px-8" :class="compacto ? 'h-36' : 'h-44'">
      <!-- Halo de color detrás del logo al pasar el cursor -->
      <span class="pointer-events-none absolute inset-0 bg-radial from-marca-100/80 via-white/0 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <img
        v-if="imagen"
        :src="imagen"
        :alt="`Logotipo de ${vinculo.nombre}`"
        class="institucion-logo relative max-h-full w-auto max-w-full object-contain py-5"
        loading="lazy"
        decoding="async"
      >
      <span v-else class="relative font-display text-3xl font-bold tracking-wide text-marca-700">{{ iniciales }}</span>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 border-t border-default p-5">
      <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-marca-600 dark:text-marca-300">
        {{ NOMBRE_VINCULO[vinculo.tipo] }}<template v-if="anio">
          · desde {{ anio }}
        </template><template v-if="!compacto && vigencia">
          · vigente hasta {{ vigencia }}
        </template>
      </p>
      <p class="font-display text-lg font-semibold leading-snug text-highlighted">
        {{ vinculo.nombre }}
      </p>
      <p v-if="!compacto && vinculo.descripcion" class="justificado text-sm leading-relaxed text-muted">
        {{ vinculo.descripcion }}
      </p>
      <span v-if="vinculo.sitioWeb" class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
        Sitio oficial
        <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </div>

    <!-- Filete de la marca que se dibuja al pasar el cursor -->
    <span class="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-marca-600 via-marca-400 to-acento-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />
  </component>
</template>

<script setup lang="ts">
import { logoVinculo } from '#shared/organizacion'
import { NOMBRE_VINCULO, type TIPOS_VINCULO } from '#shared/schemas/portal'

export interface InstitucionVinculada {
  tipo: (typeof TIPOS_VINCULO)[number]
  nombre: string
  descripcion?: string | null
  sitioWeb: string | null
  logoId: string | null
  fechaFirma?: string | null
  vigenciaHasta?: string | null
}

const props = withDefaults(defineProps<{ vinculo: InstitucionVinculada, indice?: number, compacto?: boolean }>(), { indice: 0, compacto: false })

// El logo subido desde la plataforma manda; si no hay, el del repositorio (versión ancha si existe).
const imagen = computed(() => props.vinculo.logoId ? `/api/archivos/${props.vinculo.logoId}` : logoVinculo(props.vinculo.nombre, 'horizontal'))
const anio = computed(() => props.vinculo.fechaFirma?.slice(0, 4))
const vigencia = computed(() => props.vinculo.vigenciaHasta?.slice(0, 4))
const iniciales = computed(() => props.vinculo.nombre.split(/\s+/).filter(p => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p)).slice(0, 3).map(p => p[0]).join('').toUpperCase())
</script>

<style scoped>
.institucion {
  transition: transform 0.4s var(--curva-salida), box-shadow 0.4s var(--curva-salida);
}
.institucion-logo {
  transition: transform 0.6s var(--curva-salida), filter 0.6s;
}
/* Destello que cruza el panel del logo cada pocos segundos (alternado por tarjeta). */
.institucion-panel {
  overflow: hidden;
}
.institucion-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 38%, rgb(255 255 255 / 0.85) 50%, transparent 62%);
  transform: translateX(-130%);
  animation: fea-institucion-brillo 7s ease-in-out var(--retraso-brillo, 2s) infinite;
  pointer-events: none;
}
@keyframes fea-institucion-brillo {
  0%, 78% { transform: translateX(-130%); }
  100% { transform: translateX(130%); }
}
@media (hover: hover) {
  .institucion:hover {
    transform: translateY(-6px);
    box-shadow: var(--sombra-flotante);
  }
  .institucion:hover .institucion-logo {
    transform: scale(1.06);
  }
}
.institucion:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .institucion, .institucion-logo { transition: none; }
  .institucion:hover, .institucion:hover .institucion-logo { transform: none; }
  .institucion-panel::after { animation: none; }
}
</style>
