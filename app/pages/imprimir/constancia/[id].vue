<!-- Constancia de participación, tamaño carta horizontal. Se imprime o se guarda como PDF desde el navegador. -->
<template>
  <div v-if="c" class="hoja mx-auto bg-white text-[#2c2c2e] shadow-flotante print:shadow-none">
    <div class="relative flex h-full flex-col overflow-hidden px-16 py-12">
      <div class="absolute inset-3 rounded-xl border-2 border-[#3f2759]/70" />
      <div class="absolute inset-5 rounded-lg border border-[#3f2759]/25" />

      <header class="relative flex items-center gap-5">
        <img src="/img/escudo-512.png" alt="" class="h-24 w-auto">
        <div>
          <p class="font-display text-xl font-semibold leading-snug text-[#3f2759]">
            Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, A.C.
          </p>
          <p class="text-sm italic text-[#6e6e73]">
            Por la dignificación y unión profesional
          </p>
        </div>
      </header>

      <main class="relative flex flex-1 flex-col items-center justify-center text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-[#6e6e73]">
          Otorga la presente
        </p>
        <p class="mt-2 font-display text-5xl font-semibold tracking-tight text-[#3f2759]">
          Constancia
        </p>
        <p class="mt-6 text-base text-[#6e6e73]">
          a
        </p>
        <p class="mt-2 font-display text-4xl font-semibold text-[#1d1d1f]">
          {{ nombreCompleto(c.inscripcion.usuario) }}
        </p>
        <p v-if="c.inscripcion.usuario.perfil?.cedulaProfesional" class="mt-1 text-sm text-[#6e6e73]">
          Cédula profesional {{ c.inscripcion.usuario.perfil.cedulaProfesional }}
        </p>
        <p class="mt-6 max-w-3xl text-lg leading-relaxed">
          por su participación en {{ articulo }} {{ NOMBRE_TIPO_EVENTO[c.inscripcion.evento.tipo].toLowerCase() }}
          <strong class="text-[#1d1d1f]">«{{ c.inscripcion.evento.titulo }}»</strong>,
          {{ fechas }}{{ c.inscripcion.evento.sede ? `, en ${c.inscripcion.evento.sede}` : c.inscripcion.evento.modalidad === 'VIRTUAL' ? ', en modalidad virtual' : '' }}.
        </p>
        <p v-if="c.inscripcion.evento.valorCurricular" class="mt-3 text-base font-medium text-[#3f2759]">
          Valor curricular: {{ c.inscripcion.evento.valorCurricular }}
        </p>
        <p v-if="c.inscripcion.evento.organizacion" class="mt-2 text-sm text-[#6e6e73]">
          Organizado por {{ c.inscripcion.evento.organizacion.nombre }}
        </p>
      </main>

      <footer class="relative flex items-end justify-between gap-6">
        <div class="text-xs text-[#6e6e73]">
          <p>Folio <strong class="text-[#1d1d1f]">{{ c.folio }}</strong></p>
          <p>Emitida el {{ formatoFecha(c.emitidaEn) }}</p>
          <p class="mt-1 max-w-xs">
            Verifique su autenticidad en {{ c.urlVerificacion.replace(/^https?:\/\//, '') }}
          </p>
        </div>
        <!-- SVG generado en el servidor por la librería qrcode (sólo trazos, sin scripts). -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="size-28 shrink-0" v-html="c.qr" />
      </footer>

      <div v-if="c.revocadaEn" class="absolute inset-0 flex items-center justify-center">
        <p class="-rotate-12 rounded-2xl border-4 border-red-600 px-8 py-3 text-5xl font-bold uppercase text-red-600/80">
          Revocada
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NOMBRE_TIPO_EVENTO } from '#shared/schemas/eventos'
import { formatoFecha, nombreCompleto, ZONA_HORARIA } from '#shared/texto'
import type { ConstanciaDto } from '~~/server/services/eventos'

definePageMeta({ layout: 'impresion' })
useSeoMeta({ title: 'Constancia' })

const route = useRoute()
const api = useApi()
const { data: c } = await useAsyncData(`constancia-${route.params.id}`, () => api<ConstanciaDto & { qr: string, urlVerificacion: string }>(`/api/constancias/${route.params.id}`))

const FEMENINOS = ['CONFERENCIA', 'JORNADA']
const articulo = computed(() => (c.value && FEMENINOS.includes(c.value.inscripcion.evento.tipo) ? 'la' : 'el'))
const fechas = computed(() => {
  const e = c.value?.inscripcion.evento
  if (!e) return ''
  const f = (d: string | Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-MX', { ...o, timeZone: ZONA_HORARIA }).format(new Date(d))
  const i = f(e.inicio, { day: 'numeric', month: 'long', year: 'numeric' })
  const fin = f(e.fin, { day: 'numeric', month: 'long', year: 'numeric' })
  return i === fin ? `el ${i}` : `del ${f(e.inicio, { day: 'numeric', month: 'long' })} al ${fin}`
})
</script>

<style scoped>
.hoja { width: 11in; height: 8.5in; }
@media print {
  @page { size: letter landscape; margin: 0; }
  .hoja { width: 11in; height: 8.5in; }
}
</style>
