<!-- Descarga de constancias de las Jornadas 2026: búsqueda por correo o folio, sin cuenta. -->
<template>
  <div>
    <section class="relative isolate overflow-hidden bg-marca-950 text-white">
      <div class="cartel-fondo absolute inset-0 -z-10 opacity-90" />
      <svg class="pointer-events-none absolute -right-10 bottom-0 -z-10 h-48 w-[34rem] text-white/15" viewBox="0 0 520 180" fill="none" aria-hidden="true">
        <path v-for="k in 10" :key="k" :d="`M0 ${20 + k * 15} C 120 ${-10 + k * 15}, 230 ${60 + k * 15}, 350 ${20 + k * 15} S 500 ${k * 15}, 540 ${20 + k * 15}`" stroke="currentColor" stroke-width="1.2" />
      </svg>
      <UContainer class="py-12 sm:py-16">
        <NuxtLink to="/jornadas-2026" class="inline-flex items-center gap-1 text-sm text-white/75 hover:text-white">
          <UIcon name="i-lucide-arrow-left" class="size-4" /> Jornadas 2026
        </NuxtLink>
        <p class="mt-6 font-display text-sm font-bold uppercase tracking-[0.24em] text-acento-200">{{ J.edicion }} Jornadas Académicas FEACOMECH</p>
        <h1 class="mt-2 font-display text-4xl font-bold uppercase tracking-[0.06em] sm:text-5xl">Constancias</h1>
        <p class="mt-3 max-w-xl text-lg text-white/85">
          Descargue su constancia de asistencia, taller, cartel científico o reconocimiento como ponente, con validez verificable por código QR.
        </p>

        <!-- Buscador -->
        <form class="mt-8 max-w-2xl rounded-lg bg-white p-2 text-marca-950 shadow-flotante sm:flex sm:items-center sm:gap-2" @submit.prevent="buscar">
          <UInput
            v-model="consulta"
            icon="i-lucide-search"
            size="xl"
            variant="none"
            placeholder="Correo de registro o folio (p. ej. JAF-26-0001)"
            class="flex-1"
            autocomplete="email"
            aria-label="Correo de registro o folio"
          />
          <UButton type="submit" label="Buscar mi constancia" size="xl" :loading="cargando" class="mt-2 w-full justify-center bg-acento-500 text-white hover:bg-acento-600 sm:mt-0 sm:w-auto" />
        </form>
        <p class="mt-3 text-sm text-white/70">Use el correo con el que se inscribió. Por su privacidad, la búsqueda sólo acepta el correo o el folio completos.</p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <!-- Resultados -->
      <div v-if="error" class="mx-auto max-w-2xl">
        <UAlert color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />
      </div>

      <div v-else-if="resultados" class="mx-auto max-w-3xl space-y-4">
        <template v-if="resultados.length">
          <p class="text-sm text-muted">{{ resultados.length === 1 ? 'Encontramos 1 constancia' : `Encontramos ${resultados.length} constancias` }} para <strong class="text-highlighted">{{ ultimaConsulta }}</strong>.</p>
          <article
            v-for="(r, i) in resultados"
            :key="r.codigo"
            v-revelar="i * 60"
            class="flex flex-col gap-4 rounded-lg bg-default p-5 ring-1 ring-default sm:flex-row sm:items-center"
          >
            <span class="flex size-12 shrink-0 items-center justify-center rounded-md text-white" :class="r.tipo === 'PONENTE' || r.tipo === 'COORDINADOR' ? 'bg-acento-500' : 'bg-marca-800'">
              <UIcon :name="PARTICIPACION[r.tipo].icono" class="size-6" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-acento-700 dark:text-acento-300">
                {{ PARTICIPACION[r.tipo].documento }} · {{ PARTICIPACION[r.tipo].etiqueta }}
              </p>
              <p class="font-display text-lg font-bold text-highlighted">{{ r.nombre }}</p>
              <p v-if="r.detalle" class="truncate text-sm text-muted">«{{ r.detalle }}»</p>
              <p class="text-xs text-dimmed">Folio {{ r.folio }}</p>
            </div>
            <UBadge v-if="r.revocada" label="Revocada" color="error" variant="subtle" />
            <UButton v-else :to="`/jornadas-2026/constancia/${r.codigo}`" icon="i-lucide-download" label="Ver y descargar" class="justify-center" />
          </article>
        </template>
        <div v-else class="rounded-lg bg-muted px-6 py-12 text-center">
          <UIcon name="i-lucide-file-search" class="mx-auto size-10 text-dimmed" />
          <p class="mt-3 font-display text-lg font-bold text-highlighted">No encontramos constancias para «{{ ultimaConsulta }}»</p>
          <p class="mx-auto mt-1 max-w-md text-sm text-muted">
            Revise que sea el mismo correo con el que se registró. Si asistió y no aparece, escríbanos por WhatsApp al {{ J.contacto.telefono }}.
          </p>
          <UButton :to="J.contacto.whatsapp" target="_blank" icon="i-lucide-message-circle" label="Solicitar aclaración" class="mt-5" color="neutral" variant="outline" />
        </div>
      </div>

      <!-- Cómo funciona -->
      <div v-else class="grid gap-6 md:grid-cols-3">
        <div v-for="(p, i) in pasos" :key="p.t" v-revelar="i * 80" class="rounded-lg bg-muted p-6">
          <span class="flex size-10 items-center justify-center rounded-md bg-marca-800 font-display text-lg font-bold text-white">{{ i + 1 }}</span>
          <p class="mt-4 font-display text-lg font-bold text-highlighted">{{ p.t }}</p>
          <p class="mt-1 text-sm text-muted">{{ p.d }}</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { PARTICIPACION, type TipoParticipacion } from '#shared/constancias-jornadas'

useSeoMeta({
  title: 'Constancias · Jornadas 2026',
  description: 'Descargue su constancia de participación en las VII Jornadas Académicas FEACOMECH y Simposio de Dermatología 2026.',
})

interface Resultado { codigo: string, folio: string, tipo: TipoParticipacion, nombre: string, detalle: string | null, revocada: boolean }

const route = useRoute()
const consulta = ref(String(route.query.q ?? ''))
const ultimaConsulta = ref('')
const resultados = ref<Resultado[] | null>(null)
const error = ref('')
const cargando = ref(false)

async function buscar() {
  const q = consulta.value.trim()
  if (!q) return
  cargando.value = true
  error.value = ''
  try {
    resultados.value = await $fetch<Resultado[]>('/api/publico/jornadas/constancias', { query: { q } })
    ultimaConsulta.value = q
  }
  catch (e: unknown) {
    resultados.value = null
    error.value = (e as { data?: { message?: string } }).data?.message ?? 'No fue posible buscar en este momento. Intente de nuevo.'
  }
  finally {
    cargando.value = false
  }
}
onMounted(() => { if (consulta.value) buscar() })

const pasos = [
  { t: 'Escriba su correo', d: 'El mismo con el que se inscribió a las Jornadas, o el folio impreso en su constancia.' },
  { t: 'Elija su constancia', d: 'Aparecen todas las que le corresponden: asistencia, talleres, cartel o ponencia.' },
  { t: 'Descárguela en PDF', d: 'Lista para imprimir en tamaño carta, con código QR que cualquiera puede verificar.' },
]
</script>

<style scoped>
.cartel-fondo {
  background: linear-gradient(120deg, #1f2a6b 0%, #2b3a8f 35%, #6b4f7a 70%, #d96a22 115%);
}
</style>
