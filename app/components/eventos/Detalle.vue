<!-- Contenido de un evento (descripción, programa, ponentes, sede): portal y plataforma -->
<template>
  <div class="space-y-12">
    <section class="space-y-4">
      <SitioTexto :texto="evento.descripcion" />
      <div v-if="evento.requisitos" class="rounded-2xl bg-muted p-5">
        <p class="text-sm font-semibold text-highlighted">
          Requisitos de inscripción
        </p>
        <p class="mt-1 whitespace-pre-line text-sm text-muted">
          {{ evento.requisitos }}
        </p>
      </div>
    </section>

    <section v-if="evento.programa.length" class="space-y-4">
      <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        Programa
      </h2>
      <div v-for="(actividades, dia) in programaPorDia" :key="dia" class="space-y-2">
        <h3 class="text-sm font-semibold capitalize text-dimmed">
          {{ dia }}
        </h3>
        <ol class="divide-y divide-default overflow-hidden rounded-2xl bg-default shadow-tarjeta ring-1 ring-default">
          <li v-for="a in actividades" :key="a.id" class="flex gap-4 px-5 py-3.5">
            <span class="w-24 shrink-0 text-sm font-medium tabular-nums text-marca-700 dark:text-marca-300">{{ horaEvento(a.inicio) }}{{ a.fin ? `–${horaEvento(a.fin)}` : '' }}</span>
            <div class="min-w-0">
              <p class="font-medium text-highlighted">
                {{ a.titulo }}
              </p>
              <p v-if="a.ponentes || a.lugar" class="text-sm text-muted">
                {{ [a.ponentes, a.lugar].filter(Boolean).join(' · ') }}
              </p>
              <p v-if="a.descripcion" class="mt-1 text-sm text-muted">
                {{ a.descripcion }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="evento.ponentes.length" class="space-y-4">
      <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        Ponentes
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <article v-for="p in evento.ponentes" :key="p.id" class="flex gap-4 rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <FotoPerfil :nombre="p.nombre" tamano="lg" />
          <div class="min-w-0">
            <p class="font-medium text-highlighted">
              {{ p.nombre }}
            </p>
            <p v-if="p.semblanza" class="mt-1 text-sm leading-relaxed text-muted">
              {{ p.semblanza }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Actividad { id: string, inicio: string | Date, fin: string | Date | null, titulo: string, descripcion: string | null, ponentes: string | null, lugar: string | null }
const props = defineProps<{ evento: { descripcion: string, requisitos: string | null, programa: Actividad[], ponentes: { id: string, nombre: string, semblanza: string | null }[] } }>()

const programaPorDia = computed(() => props.evento.programa.reduce<Record<string, Actividad[]>>((acc, a) => {
  (acc[diaEvento(a.inicio)] ??= []).push(a)
  return acc
}, {}))
</script>
