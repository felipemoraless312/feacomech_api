<!-- Tarjeta de evento (portal y plataforma) -->
<template>
  <NuxtLink :to="to" class="group flex flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante">
    <div class="relative aspect-[16/8] overflow-hidden bg-marca-50 dark:bg-marca-950">
      <img v-if="evento.portadaId" :src="`/api/archivos/${evento.portadaId}`" alt="" class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy">
      <MarcaRed v-else class="absolute -right-10 -top-10 size-56 text-marca-200 dark:text-marca-800" />
      <EventosFecha :fecha="evento.inicio" class="absolute left-4 top-4 shadow-tarjeta" />
      <UBadge v-if="evento.estado === 'CANCELADO'" label="Cancelado" color="error" class="absolute right-4 top-4" />
    </div>
    <div class="flex flex-1 flex-col p-5">
      <p class="text-xs font-medium uppercase tracking-wide text-marca-700 dark:text-marca-300">
        {{ NOMBRE_TIPO_EVENTO[evento.tipo] }} · {{ NOMBRE_MODALIDAD[evento.modalidad] }}
      </p>
      <p class="mt-2 font-display text-lg font-semibold leading-snug text-highlighted group-hover:text-primary">
        {{ evento.titulo }}
      </p>
      <p class="mt-1 text-sm text-muted">
        {{ rangoEvento(evento.inicio, evento.fin) }}
      </p>
      <p v-if="evento.sede" class="text-sm text-muted">
        {{ evento.sede }}
      </p>
      <div class="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <slot>
          <UBadge v-if="evento.valorCurricular" :label="evento.valorCurricular" color="neutral" variant="soft" size="sm" />
          <UBadge v-if="evento.lugares === 0 && evento.estado !== 'CANCELADO'" label="Cupo lleno: lista de espera" color="warning" variant="soft" size="sm" />
          <UBadge v-else-if="evento.lugares != null && evento.estado !== 'CANCELADO'" :label="`${evento.lugares} lugares`" color="primary" variant="soft" size="sm" />
        </slot>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { NOMBRE_MODALIDAD, NOMBRE_TIPO_EVENTO, type MODALIDADES, type TIPOS_EVENTO } from '#shared/schemas/eventos'

defineProps<{
  to: string
  evento: {
    tipo: (typeof TIPOS_EVENTO)[number], modalidad: (typeof MODALIDADES)[number], titulo: string, inicio: string | Date, fin: string | Date
    sede: string | null, portadaId: string | null, estado: string, valorCurricular: string | null, lugares?: number | null
  }
}>()
</script>
