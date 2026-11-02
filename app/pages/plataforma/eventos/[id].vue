<template>
  <PanelPagina id="evento" :titulo="e?.titulo ?? 'Evento'" tamano="lg">
    <template #acciones>
      <UButton to="/plataforma/eventos" icon="i-lucide-arrow-left" label="Eventos" color="neutral" variant="ghost" class="hidden sm:inline-flex" />
    </template>

    <div v-if="e" class="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div class="min-w-0 space-y-8">
        <img v-if="e.portadaId" :src="`/api/archivos/${e.portadaId}`" alt="" class="aspect-[16/7] w-full rounded-3xl object-cover shadow-tarjeta">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-marca-700 dark:text-marca-300">
            {{ NOMBRE_TIPO_EVENTO[e.tipo] }} · {{ NOMBRE_MODALIDAD[e.modalidad] }}
          </p>
          <h1 class="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-highlighted">
            {{ e.titulo }}
          </h1>
        </div>
        <EventosDetalle :evento="e" />
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-6">
        <div class="space-y-4 rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <UAlert v-if="e.estado === 'CANCELADO'" color="error" variant="subtle" icon="i-lucide-ban" title="Este evento fue cancelado" />
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-dimmed">
                Fecha
              </dt>
              <dd class="text-highlighted">
                {{ rangoEvento(e.inicio, e.fin) }}
              </dd>
            </div>
            <div v-if="e.sede">
              <dt class="text-dimmed">
                Sede
              </dt>
              <dd class="text-highlighted">
                {{ e.sede }}<template v-if="e.direccion">
                  <br><span class="text-muted">{{ e.direccion }}</span>
                </template>
              </dd>
            </div>
            <div v-if="e.organizacion || e.organizador">
              <dt class="text-dimmed">
                Organiza
              </dt>
              <dd class="text-highlighted">
                {{ e.organizacion ? (e.organizacion.siglas || e.organizacion.nombre) : e.organizador }}
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
            <div v-if="e.lugares != null">
              <dt class="text-dimmed">
                Cupo
              </dt>
              <dd class="text-highlighted">
                {{ e.lugares > 0 ? `${e.lugares} lugares disponibles` : 'Lleno: las nuevas inscripciones pasan a lista de espera' }}
              </dd>
            </div>
          </dl>

          <template v-if="e.miInscripcion">
            <EstadoPunto :texto="`Inscripción: ${NOMBRE_INSCRIPCION[e.miInscripcion.estado]}`" :tono="e.miInscripcion.estado === 'CONFIRMADA' ? 'exito' : 'alerta'" class="font-medium" />
            <UButton v-if="e.enlaceVirtual" :to="e.enlaceVirtual" external target="_blank" icon="i-lucide-video" label="Entrar a la sesión virtual" block />
            <UButton v-if="e.miInscripcion.constancia && !e.miInscripcion.constancia.revocadaEn" :to="`/imprimir/constancia/${e.miInscripcion.constancia.id}`" icon="i-lucide-award" label="Ver mi constancia" block />
            <UButton v-else-if="!finalizado && e.estado === 'PUBLICADO'" label="Cancelar inscripción" color="neutral" variant="ghost" block :loading="enviando" @click="cancelar" />
          </template>
          <template v-else-if="e.estado === 'PUBLICADO' && !finalizado">
            <UButton v-if="e.inscripcionAbierta" :label="e.lugares === 0 ? 'Entrar a la lista de espera' : 'Inscribirme'" icon="i-lucide-ticket" size="lg" block :loading="enviando" @click="inscribirse" />
            <p v-else class="text-sm text-muted">
              La inscripción está cerrada.
            </p>
          </template>
          <p v-else-if="finalizado" class="text-sm text-muted">
            Este evento ya concluyó.
          </p>
          <AlertaError :mensaje="error" />
        </div>
      </aside>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NOMBRE_INSCRIPCION, NOMBRE_MODALIDAD, NOMBRE_TIPO_EVENTO } from '#shared/schemas/eventos'
import type { EventoUsuarioDto } from '~~/server/services/eventos'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Evento' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const id = String(route.params.id)
const { data: e, refresh } = await useAsyncData(`evento-${id}`, () => api<EventoUsuarioDto>(`/api/eventos/${id}`))
const finalizado = computed(() => !!e.value && new Date(e.value.fin) < new Date())

const { enviando, error, enviar } = useEnvio()
async function inscribirse() {
  const r = await enviar(() => api<{ estado: string }>(`/api/eventos/${id}/inscripcion`, { method: 'POST' }))
  if (r.ok) {
    toast.add({ title: r.valor.estado === 'CONFIRMADA' ? 'Inscripción confirmada' : 'Quedó en lista de espera', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}
async function cancelar() {
  if (!confirm('¿Cancelar su inscripción? Su lugar se asignará a la lista de espera.')) return
  const r = await enviar(() => api(`/api/eventos/${id}/inscripcion`, { method: 'DELETE' }))
  if (r.ok) {
    toast.add({ title: 'Inscripción cancelada', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}
</script>
