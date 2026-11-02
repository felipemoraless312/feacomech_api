<template>
  <div v-if="e">
    <section class="relative isolate overflow-hidden bg-gradient-to-br from-marca-800 to-marca-950 text-white">
      <img v-if="e.portadaId" :src="`/api/archivos/${e.portadaId}`" alt="" class="absolute inset-0 -z-20 size-full object-cover opacity-30">
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-marca-950 via-marca-950/70 to-transparent" />
      <UContainer class="py-14 sm:py-20">
        <NuxtLink to="/eventos" class="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
          <UIcon name="i-lucide-arrow-left" class="size-4" /> Eventos
        </NuxtLink>
        <p class="entrada mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-marca-200">
          {{ NOMBRE_TIPO_EVENTO[e.tipo] }} · {{ NOMBRE_MODALIDAD[e.modalidad] }}
        </p>
        <h1 class="entrada mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-5xl" style="--retraso: 80ms">
          {{ e.titulo }}
        </h1>
        <p class="entrada mt-4 text-lg text-white/85" style="--retraso: 140ms">
          {{ rangoEvento(e.inicio, e.fin) }}<template v-if="e.sede">
            · {{ e.sede }}
          </template>
        </p>
        <UBadge v-if="e.estado === 'CANCELADO'" label="Evento cancelado" color="error" size="lg" class="mt-4" />
      </UContainer>
    </section>

    <UContainer class="grid gap-12 py-12 lg:grid-cols-[1fr_20rem]">
      <EventosDetalle :evento="e" />
      <aside class="h-fit space-y-4 rounded-2xl bg-muted p-6 lg:sticky lg:top-24">
        <dl class="space-y-3 text-sm">
          <div v-if="e.direccion">
            <dt class="text-dimmed">
              Dirección
            </dt>
            <dd class="text-highlighted">
              {{ e.direccion }}
            </dd>
          </div>
          <div v-if="e.organizacion || e.organizador">
            <dt class="text-dimmed">
              Organiza
            </dt>
            <dd class="text-highlighted">
              <NuxtLink v-if="e.organizacion?.slug" :to="`/directorio/${e.organizacion.slug}`" class="hover:text-primary">
                {{ e.organizacion.nombre }}
              </NuxtLink>
              <template v-else>
                {{ e.organizacion?.nombre ?? e.organizador }}
              </template>
            </dd>
          </div>
          <div v-if="e.valorCurricular">
            <dt class="text-dimmed">
              Valor curricular
            </dt>
            <dd class="text-highlighted">
              {{ e.valorCurricular }}
            </dd>
          </div>
          <div v-if="e.lugares != null && e.estado === 'PUBLICADO'">
            <dt class="text-dimmed">
              Cupo
            </dt>
            <dd class="text-highlighted">
              {{ e.lugares > 0 ? `${e.lugares} lugares disponibles` : 'Lleno (lista de espera)' }}
            </dd>
          </div>
        </dl>
        <template v-if="e.estado === 'PUBLICADO' && !finalizado && e.inscripcionAbierta">
          <UButton :to="`/plataforma/eventos/${e.id}`" icon="i-lucide-ticket" label="Inscribirme" size="lg" block />
          <p class="text-xs text-muted">
            La inscripción se hace desde la plataforma con su cuenta de afiliado.
          </p>
        </template>
        <p v-else-if="finalizado" class="text-sm text-muted">
          Este evento ya concluyó.
        </p>
      </aside>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { NOMBRE_MODALIDAD, NOMBRE_TIPO_EVENTO, type MODALIDADES, type TIPOS_EVENTO } from '#shared/schemas/eventos'

const route = useRoute()
interface Actividad { id: string, inicio: string, fin: string | null, titulo: string, descripcion: string | null, ponentes: string | null, lugar: string | null }
interface Evento {
  id: string, slug: string, tipo: (typeof TIPOS_EVENTO)[number], modalidad: (typeof MODALIDADES)[number], titulo: string, descripcion: string, requisitos: string | null
  inicio: string, fin: string, sede: string | null, direccion: string | null, portadaId: string | null, estado: string, inscripcionAbierta: boolean
  valorCurricular: string | null, organizador: string | null, lugares: number | null, organizacion: { nombre: string, slug: string | null } | null
  programa: Actividad[], ponentes: { id: string, nombre: string, semblanza: string | null }[]
}
const { data: e, error } = await useFetch<Evento>(`/api/publico/eventos/${route.params.slug}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Evento no encontrado', fatal: true })
const finalizado = computed(() => !!e.value && new Date(e.value.fin) < new Date())

useSeoMeta({ title: () => e.value?.titulo ?? 'Evento', description: () => e.value?.descripcion.slice(0, 160) })
</script>
