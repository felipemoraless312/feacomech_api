<!-- Programa académico interactivo de las Jornadas 2026: días, búsqueda, filtros y
     sesión en curso. Datos en shared/jornadas2026-programa.ts (temario oficial). -->
<template>
  <div class="space-y-8">
    <!-- Días -->
    <div class="grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Días del programa">
      <button
        v-for="(d, i) in PROGRAMA_2026"
        :key="d.fecha"
        type="button"
        role="tab"
        :aria-selected="!buscando && dia === i"
        class="group relative overflow-hidden rounded-lg p-5 text-left ring-1 transition-colors"
        :class="!buscando && dia === i ? `${ESTILO[i]!.activo} ring-transparent text-white` : 'bg-default ring-default hover:ring-accented'"
        @click="elegirDia(i)"
      >
        <span class="absolute inset-x-0 top-0 h-1" :class="ESTILO[i]!.barra" />
        <span class="flex items-baseline justify-between gap-3">
          <span class="font-display text-xs font-bold uppercase tracking-[0.2em]" :class="!buscando && dia === i ? 'text-white/70' : 'text-dimmed'">{{ d.etiqueta }}</span>
          <span v-if="hoyIndice === i" class="rounded-sm bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Hoy</span>
        </span>
        <span class="mt-1 block font-display text-2xl font-bold" :class="!buscando && dia === i ? '' : 'text-highlighted'">{{ d.dia }} de noviembre</span>
        <span class="mt-1 block text-sm" :class="!buscando && dia === i ? 'text-white/80' : 'text-muted'">
          {{ d.tema }} · {{ ponenciasDe(d).length }} conferencias
        </span>
      </button>
    </div>

    <!-- Búsqueda y filtros -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Buscar tema, ponente o colegio…" class="w-full sm:max-w-sm" :ui="{ base: 'bg-default ring-1 ring-default' }">
        <template v-if="busqueda" #trailing>
          <UButton icon="i-lucide-x" color="neutral" variant="link" size="sm" aria-label="Limpiar búsqueda" @click="busqueda = ''" />
        </template>
      </UInput>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="f in FILTROS"
          :key="f.v"
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium ring-1 transition-colors"
          :class="filtro === f.v ? 'bg-marca-800 text-white ring-marca-800' : 'bg-default text-muted ring-default hover:text-highlighted'"
          @click="filtro = f.v"
        >
          {{ f.t }}
        </button>
      </div>
    </div>

    <!-- En curso -->
    <div v-if="enCurso || siguiente" class="flex flex-col gap-3 rounded-lg bg-emerald-50 p-4 ring-1 ring-emerald-200 sm:flex-row sm:items-center dark:bg-emerald-950/30 dark:ring-emerald-900">
      <span class="relative flex size-3 shrink-0">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
        <span class="relative inline-flex size-3 rounded-full bg-emerald-500" />
      </span>
      <p v-if="enCurso" class="text-sm">
        <strong class="text-emerald-800 dark:text-emerald-300">En curso ({{ enCurso.inicio }}–{{ enCurso.fin }}):</strong>
        <span class="text-highlighted"> {{ enCurso.titulo }}</span>
      </p>
      <p v-if="siguiente" class="text-sm text-muted sm:ml-auto">
        A continuación, {{ siguiente.inicio }}: <span class="text-highlighted">{{ siguiente.titulo }}</span>
      </p>
    </div>

    <!-- Resultados de búsqueda: agrupados por día -->
    <div v-if="!secciones.length" class="rounded-lg bg-muted px-6 py-12 text-center">
      <UIcon name="i-lucide-search-x" class="mx-auto size-8 text-dimmed" />
      <p class="mt-3 font-medium text-highlighted">Sin resultados para «{{ busqueda }}»</p>
      <UButton label="Ver programa completo" color="neutral" variant="link" @click="limpiar" />
    </div>

    <div v-for="s in secciones" :key="s.dia.fecha" class="space-y-3">
      <p v-if="buscando" class="font-display text-sm font-bold uppercase tracking-[0.18em] text-dimmed">
        {{ s.dia.etiqueta }} · {{ s.dia.dia }} de noviembre
      </p>

      <ol class="relative">
        <template v-for="(g, gi) in s.grupos" :key="`${s.dia.fecha}-${gi}`">
          <!-- Pausas y actos: fila delgada -->
          <li v-if="g.tipo === 'pausa'" class="flex items-center gap-4 px-5 py-2">
            <span class="flex flex-1 items-center gap-3 text-sm font-medium" :class="g.items[0]!.tipo === 'acto' ? 'text-marca-700 dark:text-marca-300' : 'text-dimmed'">
              <UIcon :name="ICONO[g.items[0]!.tipo]" class="size-4 shrink-0" />
              {{ g.items[0]!.titulo }}
              <span class="h-px flex-1 border-t border-dashed border-default" />
              <span class="font-mono text-xs tabular-nums">{{ g.items[0]!.inicio }}–{{ g.items[0]!.fin }}</span>
            </span>
          </li>

          <!-- Talleres y cena: tarjeta destacada -->
          <li v-else-if="g.tipo === 'especial'" class="py-3">
            <article class="rounded-lg p-5 sm:p-6" :class="g.items[0]!.tipo === 'social' ? 'bg-marca-950 text-white' : 'bg-acento-50 ring-1 ring-acento-200 dark:bg-acento-950/40 dark:ring-acento-900'">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" :class="g.items[0]!.tipo === 'social' ? 'bg-acento-500 text-white' : 'bg-acento-600 text-white'">
                  {{ g.items[0]!.tipo === 'social' ? 'Evento social' : 'Taller' }}
                </span>
                <span class="text-xs" :class="g.items[0]!.tipo === 'social' ? 'text-white/70' : 'text-acento-800 dark:text-acento-200'">
                  {{ g.items[0]!.fin ? `${g.items[0]!.inicio}–${g.items[0]!.fin} h` : `${g.items[0]!.inicio} h` }} · {{ g.items[0]!.lugar }}
                </span>
              </div>
              <h4 class="mt-2 font-display text-xl font-bold sm:text-2xl" :class="g.items[0]!.tipo === 'social' ? '' : 'text-highlighted'">{{ g.items[0]!.titulo }}</h4>
              <p v-if="g.items[0]!.ponente" class="mt-1 text-sm">
                <span class="font-semibold" :class="g.items[0]!.tipo === 'social' ? '' : 'text-highlighted'">{{ g.items[0]!.ponente }}</span>
                <span :class="g.items[0]!.tipo === 'social' ? 'text-white/70' : 'text-muted'"> · {{ g.items[0]!.perfil }}</span>
              </p>
              <p v-if="g.items[0]!.costo" class="mt-3 font-display text-lg font-bold" :class="g.items[0]!.tipo === 'social' ? 'text-acento-300' : 'text-acento-700 dark:text-acento-300'">
                {{ pesos(g.items[0]!.costo) }} MXN{{ g.items[0]!.tipo === 'social' ? ' por persona' : '' }}
              </p>
            </article>
          </li>

          <!-- Bloque de un colegio con sus ponencias -->
          <li v-else class="py-3">
            <div class="overflow-hidden rounded-lg bg-default ring-1 ring-default">
              <div v-if="g.bloque || g.coordina" class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-l-4 bg-muted/70 px-5 py-2.5" :class="ESTILO[s.indice]!.borde">
                <p class="font-display text-sm font-bold uppercase tracking-[0.1em] text-highlighted">{{ g.bloque ?? 'Conferencia invitada' }}</p>
                <p v-if="g.coordina" class="text-xs text-muted">Coordina: {{ g.coordina }}</p>
              </div>
              <ul class="divide-y divide-default">
                <li
                  v-for="a in g.items"
                  :key="a.inicio + a.titulo"
                  class="relative grid grid-cols-1 gap-1 px-5 py-4 transition-colors sm:grid-cols-[6.5rem_1fr] sm:gap-5"
                  :class="esEnCurso(s.dia, a) ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''"
                >
                  <span class="font-mono text-xs font-semibold tabular-nums text-muted sm:pt-1 sm:text-right sm:text-sm sm:text-highlighted">
                    {{ a.inicio }}<span class="text-dimmed">–{{ a.fin }}</span>
                  </span>
                  <div>
                    <div class="flex items-start gap-2">
                      <h4 class="font-semibold leading-snug text-highlighted" v-html="resaltar(a.titulo)" />
                      <span v-if="esEnCurso(s.dia, a)" class="mt-0.5 shrink-0 rounded-sm bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">En curso</span>
                    </div>
                    <p v-if="a.ponente" class="mt-1 text-sm">
                      <span class="font-medium text-marca-800 dark:text-marca-200" v-html="resaltar(a.ponente)" />
                      <span v-if="a.perfil" class="text-muted"> · {{ a.perfil }}</span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </template>
      </ol>
    </div>

    <p class="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-default pt-5 text-sm text-muted">
      <span><strong class="text-highlighted">{{ totales.ponencias }}</strong> conferencias</span>
      <span><strong class="text-highlighted">{{ totales.ponentes }}</strong> ponentes</span>
      <span><strong class="text-highlighted">{{ totales.bloques }}</strong> colegios y mesas</span>
      <span><strong class="text-highlighted">2</strong> talleres</span>
      <span class="sm:ml-auto">Concurso de carteles científicos durante las Jornadas · horario del centro de México</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PROGRAMA_2026, ponenciasDe, type Actividad, type DiaPrograma, type TipoActividad } from '#shared/jornadas2026-programa'
import { pesos } from '#shared/jornadas2026'

const ESTILO = [
  { activo: 'bg-marca-800', barra: 'bg-marca-700', borde: 'border-marca-700' },
  { activo: 'bg-acento-600', barra: 'bg-acento-500', borde: 'border-acento-500' },
  { activo: 'bg-teal-700', barra: 'bg-teal-600', borde: 'border-teal-600' },
]
const ICONO: Record<TipoActividad, string> = {
  ponencia: 'i-lucide-mic', registro: 'i-lucide-clipboard-check', receso: 'i-lucide-coffee', acto: 'i-lucide-flag', taller: 'i-lucide-hand', social: 'i-lucide-wine',
}
const FILTROS = [
  { v: 'todo', t: 'Todo' },
  { v: 'ponencia', t: 'Conferencias' },
  { v: 'taller', t: 'Talleres' },
  { v: 'social', t: 'Cena de gala' },
] as const

const busqueda = ref('')
const filtro = ref<(typeof FILTROS)[number]['v']>('todo')
const buscando = computed(() => busqueda.value.trim().length >= 2)

// Reloj compartido con la página (mismo valor en servidor y navegador al hidratar).
const ahora = useState('jornadas-ahora', () => Date.now())
const ms = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00-06:00`).getTime()

const hoyIndice = computed(() => {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date(ahora.value))
  return PROGRAMA_2026.findIndex(d => d.fecha === hoy)
})
const dia = ref(hoyIndice.value >= 0 ? hoyIndice.value : 0)

function elegirDia(i: number) {
  dia.value = i
  busqueda.value = ''
}
function limpiar() {
  busqueda.value = ''
  filtro.value = 'todo'
}

const esEnCurso = (d: DiaPrograma, a: Actividad) => !!a.fin && ahora.value >= ms(d.fecha, a.inicio) && ahora.value < ms(d.fecha, a.fin)
const diaHoy = computed(() => (hoyIndice.value >= 0 ? PROGRAMA_2026[hoyIndice.value]! : null))
const enCurso = computed(() => diaHoy.value?.actividades.find(a => esEnCurso(diaHoy.value!, a)) ?? null)
const siguiente = computed(() => diaHoy.value?.actividades.find(a => ms(diaHoy.value!.fecha, a.inicio) > ahora.value) ?? null)

// Normaliza para buscar sin acentos ni mayúsculas.
const normal = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const coincide = (a: Actividad) => {
  if (filtro.value !== 'todo' && a.tipo !== filtro.value) return false
  if (!buscando.value) return true
  const q = normal(busqueda.value.trim())
  return [a.titulo, a.ponente, a.perfil, a.bloque, a.coordina].some(v => v && normal(v).includes(q))
}

type Grupo = { tipo: 'pausa' | 'especial' | 'bloque', bloque?: string, coordina?: string, items: Actividad[] }
function agrupar(actividades: Actividad[]): Grupo[] {
  const grupos: Grupo[] = []
  for (const a of actividades) {
    if (a.tipo === 'receso' || a.tipo === 'registro' || a.tipo === 'acto') grupos.push({ tipo: 'pausa', items: [a] })
    else if (a.tipo === 'taller' || a.tipo === 'social') grupos.push({ tipo: 'especial', items: [a] })
    else {
      const ultimo = grupos.at(-1)
      if (ultimo?.tipo === 'bloque' && ultimo.bloque === a.bloque && ultimo.coordina === a.coordina && a.bloque) ultimo.items.push(a)
      else grupos.push({ tipo: 'bloque', bloque: a.bloque, coordina: a.coordina, items: [a] })
    }
  }
  return grupos
}

const secciones = computed(() => {
  const dias = buscando.value ? PROGRAMA_2026.map((d, i) => ({ d, i })) : [{ d: PROGRAMA_2026[dia.value]!, i: dia.value }]
  return dias
    .map(({ d, i }) => {
      const visibles = d.actividades.filter(a => coincide(a) || (!buscando.value && filtro.value === 'todo'))
      return { dia: d, indice: i, grupos: agrupar(visibles) }
    })
    .filter(s => s.grupos.length)
})

// Resalta lo buscado (texto propio, escapado antes de marcar).
const escapar = (t: string) => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)
function resaltar(texto: string) {
  const seguro = escapar(texto)
  if (!buscando.value) return seguro
  const q = normal(busqueda.value.trim())
  const base = normal(texto)
  const i = base.indexOf(q)
  if (i < 0) return seguro
  const antes = escapar(texto.slice(0, i))
  const medio = escapar(texto.slice(i, i + q.length))
  const despues = escapar(texto.slice(i + q.length))
  return `${antes}<mark class="rounded-sm bg-acento-200 px-0.5 text-inherit dark:bg-acento-800">${medio}</mark>${despues}`
}

const totales = computed(() => {
  const ponencias = PROGRAMA_2026.flatMap(ponenciasDe)
  return {
    ponencias: ponencias.length,
    ponentes: new Set(ponencias.map(p => p.ponente)).size,
    bloques: new Set(ponencias.map(p => p.bloque).filter(Boolean)).size,
  }
})
</script>
