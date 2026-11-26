<!-- Rifa de las Jornadas 2026 (sólo superadministrador): ruleta entre quienes marcaron su
     ingreso del día. El servidor elige a los ganadores; la ruleta sólo los anima.
     La zona de la ruleta se puede proyectar en pantalla completa (barra espaciadora para girar). -->
<template>
  <PanelPagina id="rifa-jornadas" titulo="Rifa · Jornadas 2026" tamano="xl">
    <template #acciones>
      <UButton icon="i-lucide-maximize-2" label="Proyectar ruleta" color="neutral" variant="outline" @click="alternarPantalla" />
    </template>

    <div class="space-y-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex gap-1 rounded-xl bg-muted p-1">
          <UButton
            v-for="d in DIAS_JORNADAS"
            :key="d.fecha"
            :label="d.fecha === hoy ? `${d.etiqueta} · hoy` : d.etiqueta"
            size="sm"
            :color="fecha === d.fecha ? 'primary' : 'neutral'"
            :variant="fecha === d.fecha ? 'solid' : 'ghost'"
            :disabled="girando"
            @click="fecha = d.fecha"
          />
        </div>
        <p class="text-sm text-muted">
          {{ nf(elegibles) }} participantes por sortear · {{ nf(vigentes) }} ganadores
          <span class="text-dimmed">(asistentes con ingreso del {{ diaSel?.etiqueta ?? fecha }})</span>
        </p>
      </div>

      <AlertaError :mensaje="error" />

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <!-- Escenario: ruleta + controles (esta zona se proyecta en pantalla completa) -->
        <div
          ref="stage"
          class="rifa-stage relative flex flex-col items-center justify-center overflow-hidden text-white"
          :class="pantallaCompleta ? 'h-screen w-screen p-[2vh]' : 'rounded-2xl p-4 shadow-tarjeta sm:p-6'"
        >
          <div class="mb-2 flex items-center gap-3 text-center">
            <span class="rounded-full bg-white p-1 ring-2 ring-[#F5B942]/70" :class="pantallaCompleta ? 'h-[9vh] w-[9vh]' : 'h-12 w-12'">
              <img src="/img/marca/escudo-160.png" alt="" class="h-full w-full object-contain">
            </span>
            <div>
              <p class="font-black tracking-tight" :class="pantallaCompleta ? 'text-[4.5vh]' : 'text-xl sm:text-2xl'">
                Gran <span class="text-[#F5B942]">Rifa</span>
              </p>
              <p class="text-blue-200" :class="pantallaCompleta ? 'text-[2.2vh]' : 'text-xs sm:text-sm'">
                {{ J.edicion }} {{ J.titulo }} · {{ diaSel?.etiqueta }}
              </p>
            </div>
          </div>
          <p
            v-if="premio.trim()"
            class="mb-2 rounded-full border border-[#F5B942]/40 bg-[#F5B942]/15 px-4 py-1 font-semibold text-[#F5B942]"
            :class="pantallaCompleta ? 'text-[2.6vh]' : 'text-sm'"
          >
            Premio: {{ premio.trim() }}
          </p>

          <svg
            :viewBox="`0 0 ${SIZE} ${SIZE}`"
            class="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
            :class="[pantallaCompleta ? 'max-w-[min(90vw,56vh)]' : 'max-w-[min(90vw,64vh,560px)]', { 'rifa-girando': girando }]"
            role="img"
            aria-label="Ruleta de participantes"
          >
            <defs>
              <linearGradient id="rifa-aro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FDE68A" />
                <stop offset="45%" stop-color="#F5B942" />
                <stop offset="100%" stop-color="#B7791F" />
              </linearGradient>
              <radialGradient id="rifa-brillo" cx="50%" cy="50%" r="50%">
                <stop offset="55%" stop-color="#000000" stop-opacity="0" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
              </radialGradient>
              <radialGradient id="rifa-centro" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="100%" stop-color="#DBEAFE" />
              </radialGradient>
            </defs>

            <!-- Aro dorado con focos -->
            <circle :cx="C" :cy="C" :r="RIM_R" fill="url(#rifa-aro)" />
            <circle :cx="C" :cy="C" :r="RIM_R - 14" fill="#0F172A" />
            <circle v-for="(f, i) in focos" :key="i" :cx="f[0]" :cy="f[1]" r="4.2" class="rifa-foco" :class="{ 'rifa-foco-b': i % 2 }" />

            <g ref="rueda">
              <circle v-if="slots.length < 2" :cx="C" :cy="C" :r="R" :fill="COLORS[0]" />
              <template v-else>
                <g v-for="(_, i) in slots" :key="i" class="rifa-casilla" :opacity="casillasGanadoras && !casillasGanadoras.includes(i) ? 0.35 : 1">
                  <path :d="slicePath(i * seg, (i + 1) * seg)" :fill="sliceColor(i, slots.length)" stroke="#FFFFFF" stroke-width="2" />
                  <text
                    :ref="(el) => { textos[i] = el as SVGTextElement | null }"
                    :transform="`rotate(${(i + 0.5) * seg - 90} ${C} ${C})`"
                    :x="C + R - 14"
                    :y="C"
                    text-anchor="end"
                    dominant-baseline="middle"
                    :font-size="fontSize"
                    font-weight="700"
                    :fill="SLICE_TEXT"
                  />
                </g>
              </template>
              <!-- Casillas ganadoras resaltadas mientras se anuncia -->
              <template v-if="casillasGanadoras && slots.length >= 2">
                <path
                  v-for="c in casillasGanadoras"
                  :key="`g${c}`"
                  :d="slicePath(c * seg, (c + 1) * seg)"
                  fill="none"
                  stroke="#F5B942"
                  stroke-width="6"
                  stroke-linejoin="round"
                  class="rifa-casilla-ganadora"
                />
              </template>
            </g>
            <circle :cx="C" :cy="C" :r="R" fill="url(#rifa-brillo)" pointer-events="none" />

            <text v-if="cargado && elegibles < 1" :x="C" :y="C + 70" text-anchor="middle" font-size="16" font-weight="700" :fill="SLICE_TEXT">
              Sin participantes por sortear
            </text>

            <!-- Centro con el escudo -->
            <circle :cx="C" :cy="C" r="40" fill="url(#rifa-centro)" stroke="url(#rifa-aro)" stroke-width="6" />
            <image href="/img/marca/escudo-160.png" :x="C - 24" :y="C - 28" width="48" height="56" />

            <!-- Flecha: rebota al pasar cada casilla -->
            <g ref="flecha">
              <path :d="`M${C - 17},4 L${C + 17},4 L${C},46 Z`" fill="#F5B942" stroke="#0A0E1A" stroke-width="3" stroke-linejoin="round" />
              <circle :cx="C" cy="14" r="5" fill="#0A0E1A" />
            </g>
          </svg>

          <!-- Controles -->
          <div class="mt-4 w-full space-y-3" :class="pantallaCompleta ? 'max-w-[60vh]' : 'max-w-md'">
            <input
              v-if="!pantallaCompleta"
              v-model="premio"
              type="text"
              maxlength="120"
              placeholder="Premio de este giro (opcional)"
              :disabled="girando"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-[#F5B942]/60"
            >
            <div v-if="!pantallaCompleta" class="flex items-center justify-between gap-3 text-sm text-gray-300">
              <span>Ganadores por giro</span>
              <div class="flex gap-1">
                <button
                  v-for="c in [1, 3, 5, 10]"
                  :key="c"
                  type="button"
                  :disabled="girando"
                  class="w-10 rounded-lg border py-1.5 font-bold"
                  :class="porGiro === c ? 'border-[#F5B942] bg-[#F5B942] text-[#0A0E1A]' : 'border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.08]'"
                  @click="porGiro = c"
                >
                  {{ c }}
                </button>
              </div>
            </div>
            <button
              type="button"
              :disabled="girando || elegibles < 1"
              class="w-full rounded-xl bg-gradient-to-b from-[#F5B942] to-[#D9962A] font-black text-[#0A0E1A] shadow-lg shadow-[#F5B942]/20 transition hover:from-[#FFC857] hover:to-[#E5A23A] disabled:cursor-not-allowed disabled:opacity-40"
              :class="pantallaCompleta ? 'py-[1.6vh] text-[3vh]' : 'py-3.5 text-lg'"
              @click="girar"
            >
              {{ girando ? 'Girando…' : elegibles < 1 ? 'Sin participantes por sortear' : porGiro > 1 ? `¡Girar ruleta! (${porGiro} ganadores)` : '¡Girar ruleta!' }}
            </button>

            <div class="flex items-center justify-between gap-3 text-sm text-gray-300">
              <span :class="pantallaCompleta ? 'text-[1.8vh]' : 'text-xs'">
                {{ nf(elegibles) }} en la ruleta · barra espaciadora para girar
              </span>
              <div class="flex items-center gap-1">
                <button type="button" class="rounded-lg p-2 text-gray-200 hover:bg-white/[0.08]" :aria-label="sonido ? 'Silenciar' : 'Activar sonido'" :title="sonido ? 'Silenciar' : 'Activar sonido'" @click="sonido = !sonido">
                  <UIcon :name="sonido ? 'i-lucide-volume-2' : 'i-lucide-volume-x'" class="size-4" />
                </button>
                <button v-if="pantallaCompleta" type="button" class="rounded-lg p-2 text-gray-200 hover:bg-white/[0.08]" aria-label="Salir de pantalla completa" @click="alternarPantalla">
                  <UIcon name="i-lucide-minimize-2" class="size-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Últimos ganadores -->
          <div v-if="ultimos.length" class="mt-3 flex max-w-full flex-wrap justify-center gap-2">
            <span v-for="g in ultimos" :key="g.id" class="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-gray-100" :class="pantallaCompleta ? 'text-[1.8vh]' : 'text-xs'">
              <span class="font-bold text-[#F5B942]">#{{ g.numero }}</span> {{ nombreCorto(g.nombre) }}
            </span>
          </div>

          <!-- Todos los participantes pasan en una franja para que cada quien vea su nombre -->
          <div v-if="todos.length" class="relative mt-4 w-full overflow-hidden">
            <p class="mb-1 text-center text-blue-200" :class="pantallaCompleta ? 'text-[1.8vh]' : 'text-xs'">Participan {{ nf(todos.length) }} personas</p>
            <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0A0E1A] to-transparent" />
            <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0A0E1A] to-transparent" />
            <div class="rifa-franja flex w-max" :style="{ animationDuration: `${Math.max(30, todos.length * 2)}s` }">
              <span
                v-for="(nombre, i) in [...todos, ...todos]"
                :key="i"
                class="flex items-center gap-3 whitespace-nowrap px-3 font-semibold text-gray-100"
                :class="pantallaCompleta ? 'text-[2.2vh]' : 'text-sm'"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-[#F5B942]" />
                {{ formatoNombre(nombre) }}
              </span>
            </div>
          </div>

          <!-- Ganadores del giro (dentro del escenario para que también se vean en pantalla completa) -->
          <div v-if="ganadorGiro" role="dialog" aria-modal="true" :aria-label="ganadorGiro.length === 1 ? 'Ganador' : 'Ganadores'" class="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div
              class="rifa-ganador max-h-full w-full overflow-y-auto rounded-3xl border-2 border-[#F5B942]/60 bg-gradient-to-b from-[#16204a] to-[#0D1326] p-6 text-center shadow-2xl shadow-[#F5B942]/20 sm:p-8"
              :class="ganadorGiro.length === 1 ? 'max-w-lg' : 'max-w-2xl'"
            >
              <UIcon name="i-lucide-trophy" class="mx-auto mb-3 text-[#F5B942]" :class="pantallaCompleta ? 'size-[8vh]' : 'size-12'" />
              <template v-if="ganadorGiro.length === 1">
                <p class="font-bold uppercase tracking-widest text-[#F5B942]" :class="pantallaCompleta ? 'text-[2.6vh]' : 'text-base'">Ganador #{{ ganadorGiro[0]!.numero }}</p>
                <h2 class="mt-2 break-words font-black leading-tight text-gray-50" :class="pantallaCompleta ? 'text-[6vh]' : 'text-3xl sm:text-4xl'">
                  {{ formatoNombre(ganadorGiro[0]!.nombre) }}
                </h2>
                <p v-if="ganadorGiro[0]!.procedencia" class="mt-3 text-gray-300" :class="{ 'text-[2.6vh]': pantallaCompleta }">{{ ganadorGiro[0]!.procedencia }}</p>
              </template>
              <template v-else>
                <h2 class="font-black uppercase tracking-widest text-[#F5B942]" :class="pantallaCompleta ? 'text-[3.6vh]' : 'text-xl sm:text-2xl'">¡{{ ganadorGiro.length }} ganadores!</h2>
                <ul class="mt-4 space-y-2 text-left">
                  <li
                    v-for="g in ganadorGiro"
                    :key="g.id"
                    class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5"
                    :class="{ 'opacity-40': ausentes.includes(g.id) }"
                  >
                    <span class="shrink-0 font-black text-[#F5B942]" :class="pantallaCompleta ? 'text-[2.6vh]' : 'text-base'">#{{ g.numero }}</span>
                    <div class="min-w-0 flex-1">
                      <p class="break-words font-bold leading-tight text-gray-50" :class="[{ 'line-through': ausentes.includes(g.id) }, pantallaCompleta ? 'text-[3.2vh]' : 'text-lg']">
                        {{ formatoNombre(g.nombre) }}
                      </p>
                      <p v-if="g.procedencia" class="text-gray-400" :class="pantallaCompleta ? 'text-[1.9vh]' : 'text-xs'">{{ g.procedencia }}</p>
                    </div>
                    <button v-if="!ausentes.includes(g.id)" type="button" class="shrink-0 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-gray-200 hover:bg-white/[0.1]" @click="marcarAusente(g)">
                      No está
                    </button>
                  </li>
                </ul>
              </template>
              <p v-if="ganadorGiro[0]!.premio" class="mt-3 inline-block rounded-full bg-[#F5B942]/15 px-4 py-1 font-semibold text-[#F5B942]" :class="{ 'text-[2.4vh]': pantallaCompleta }">
                {{ ganadorGiro[0]!.premio }}
              </p>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                <button v-if="ganadorGiro.length === 1" type="button" class="flex-1 rounded-xl bg-white/[0.06] py-2.5 font-medium text-gray-100 hover:bg-white/[0.1]" @click="marcarAusente(ganadorGiro[0]!)">
                  No está presente
                </button>
                <button ref="aceptar" type="button" class="flex-1 rounded-xl bg-[#1F9D73] py-2.5 font-bold text-white hover:bg-[#24B382]" @click="cerrarGanador">
                  Aceptar
                </button>
              </div>
            </div>
          </div>
          <canvas ref="confeti" class="pointer-events-none absolute inset-0 z-30 h-full w-full" />
        </div>

        <!-- Registro de ganadores -->
        <section class="flex flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta">
          <div class="flex items-center gap-2 border-b border-default p-4">
            <UInput v-model="filtro" icon="i-lucide-search" placeholder="Buscar por nombre, correo, teléfono o #ganador" size="sm" class="flex-1" />
            <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" aria-label="Actualizar lista" @click="cargarGanadores" />
            <UButton icon="i-lucide-download" color="neutral" variant="ghost" aria-label="Descargar CSV" :disabled="!ganadores.length" @click="descargarCsv" />
          </div>

          <div class="max-h-[60vh] flex-1 divide-y divide-default overflow-y-auto">
            <EstadoVacio
              v-if="!filtrados.length"
              icono="i-lucide-trophy"
              :titulo="ganadores.length ? 'Sin coincidencias' : 'Aún no hay ganadores'"
              :descripcion="ganadores.length ? undefined : 'Gire la ruleta para empezar.'"
            />
            <div v-for="g in filtrados" :key="g.id" class="flex items-start gap-3 p-3 sm:p-4">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-acento-100 text-sm font-bold text-acento-800 dark:bg-acento-900/40 dark:text-acento-200">#{{ g.numero }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-highlighted" :class="{ 'line-through opacity-60': g.estado === 'ANULADO' }">{{ formatoNombre(g.nombre) }}</p>
                <p class="text-xs text-muted">
                  {{ g.correo }}<template v-if="g.telefono"> · {{ g.telefono }}</template><template v-if="g.premio"> · {{ g.premio }}</template>
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <UBadge :label="ESTADO[g.estado].label" :color="ESTADO[g.estado].color" variant="soft" size="sm" />
                  <UButton v-if="g.estado === 'PENDIENTE'" label="Marcar entregado" size="xs" color="success" @click="actualizar(g.id, { estado: 'ENTREGADO' })" />
                  <UButton v-else-if="g.estado === 'ENTREGADO'" label="Deshacer" size="xs" color="neutral" variant="soft" @click="actualizar(g.id, { estado: 'PENDIENTE' })" />
                  <UButton v-else label="Sí estaba" size="xs" color="neutral" variant="soft" @click="actualizar(g.id, { estado: 'PENDIENTE' })" />
                </div>
              </div>
            </div>
          </div>

          <!-- Registros de prueba y reinicio -->
          <div class="space-y-3 border-t border-default p-4 text-sm">
            <button type="button" class="flex items-center gap-2 text-muted hover:text-highlighted" @click="verExcluidos = !verExcluidos">
              <UIcon name="i-lucide-flask-conical" class="size-4" />
              {{ excluidos.length }} registro(s) de prueba excluidos de la rifa
              <span class="underline">{{ verExcluidos ? 'ocultar' : 'ver' }}</span>
            </button>
            <ul v-if="verExcluidos" class="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-muted p-3 text-xs text-muted">
              <li v-if="!excluidos.length">Ninguno</li>
              <li v-for="(x, i) in excluidos" :key="i">{{ x.nombre }} · <span class="text-dimmed">{{ x.correo }}</span></li>
            </ul>

            <form v-if="reinicio" class="space-y-2 rounded-xl border border-error/40 bg-error/10 p-3" @submit.prevent="reiniciar">
              <p class="text-highlighted">
                Se borrarán los {{ ganadores.length }} ganadores del {{ diaSel?.etiqueta }} y todos los asistentes de ese día volverán a participar.
                La asistencia no se modifica. Escriba <b>REINICIAR</b> para confirmar.
              </p>
              <UInput v-model="reinicio.texto" autofocus class="w-full" />
              <div class="flex gap-2">
                <UButton label="Cancelar" color="neutral" variant="soft" block class="flex-1" @click="reinicio = null" />
                <UButton type="submit" label="Reiniciar rifa" color="error" block class="flex-1" :loading="reinicio.enviando" :disabled="reinicio.texto.trim().toUpperCase() !== 'REINICIAR'" />
              </div>
            </form>
            <button v-else type="button" :disabled="girando" class="flex items-center gap-2 text-error/80 hover:text-error disabled:opacity-40" @click="reinicio = { texto: '', enviando: false }">
              <UIcon name="i-lucide-rotate-ccw" class="size-4" />
              Reiniciar la rifa de este día (nadie ha ganado)
            </button>
          </div>
        </section>
      </div>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { ROL_SUPERADMIN } from '#shared/permisos'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { DIAS_JORNADAS, hoyMexico } from '#shared/registro-jornadas'
import type { GanadorRifaDto } from '~~/server/services/rifa-jornadas'

definePageMeta({ layout: 'plataforma', rol: ROL_SUPERADMIN })
useSeoMeta({ title: 'Rifa · Jornadas 2026' })

// ---------------------------------------------------------------------------
// Configuración de la ruleta
// ---------------------------------------------------------------------------
const SIZE = 460
const C = SIZE / 2
const R = 192 // radio de las casillas
const RIM_R = 212 // radio del aro dorado
const FOCOS = 24 // focos alrededor del aro
// Tonos claros; el texto va en oscuro para que se lea bien
const COLORS = ['#93C5FD', '#FDE68A', '#86EFAC', '#F9A8D4', '#C4B5FD', '#67E8F9']
const SLICE_TEXT = '#0F172A'
const IDLE_SPEED = 6 // °/s en reposo
// Casillas visibles a la vez; si hay más participantes, los nombres se turnan al pasar por abajo
const MAX_CASILLAS = 36
// Por debajo de media casilla por cuadro para que no parpadee ni parezca girar al revés
const FAST_SPEED = 400 // °/s
const ACELERACION_MS = 1100
const FRENADA_MS = 6500
const FRENADA_POT = 2.2 // la ruleta pierde velocidad de forma pareja
const PAUSA_GANADOR_MS = 1300 // se resalta la casilla antes de mostrar al ganador
// Flecha: los clavos de cada casilla la empujan y regresa como resorte
const FLECHA_MAX = 18
const FLECHA_CONTACTO = 0.16
const RESORTE_K = 900
const RESORTE_AMORT = 20

const sliceColor = (i: number, total: number) => {
  const idx = i % COLORS.length
  return i === total - 1 && total > 1 && idx === 0 ? COLORS[2] : COLORS[idx]
}
const polar = (deg: number, r: number): [number, number] => {
  const rad = (deg * Math.PI) / 180
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)]
}
// Ángulos en sentido horario desde las 12 en punto
const slicePath = (a1: number, a2: number) => {
  const [x1, y1] = polar(a1, R)
  const [x2, y2] = polar(a2, R)
  return `M${C},${C} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`
}
const focos = Array.from({ length: FOCOS }, (_, i) => polar((i * 360) / FOCOS, RIM_R - 7))

const truncar = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
// "luis felipe MORALES gutierrez" -> "Luis Felipe Morales Gutierrez"
const formatoNombre = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/(^|\s)(\p{L})/gu, (_m, sp: string, l: string) => sp + l.toUpperCase())
// En la ruleta sólo cabe nombre + primer apellido
const nombreCorto = (s: string) => {
  const w = formatoNombre(s).split(' ')
  return truncar(w.length >= 4 ? `${w[0]} ${w[2]}` : w.slice(0, 2).join(' '), 16)
}
const nf = (n: number) => n.toLocaleString('es-MX')

const ESTADO = {
  PENDIENTE: { label: 'Pendiente', color: 'warning' },
  ENTREGADO: { label: 'Entregado', color: 'success' },
  ANULADO: { label: 'No estaba', color: 'neutral' },
} as const

// ---------------------------------------------------------------------------
// Sonidos (Web Audio, sin archivos)
// ---------------------------------------------------------------------------
function crearSonidos() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const ctx = new AC()
  const nota = (freq: number, inicio: number, dur: number, tipo: OscillatorType = 'triangle', vol = 0.18) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = tipo
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime + inicio)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime + inicio)
    osc.stop(ctx.currentTime + inicio + dur + 0.02)
  }
  let ultimoTick = 0 // a alta velocidad los clics se espacian para que no zumben
  return {
    reanudar: () => { if (ctx.state === 'suspended') ctx.resume() },
    tick: () => {
      if (ctx.currentTime - ultimoTick < 0.045) return
      ultimoTick = ctx.currentTime
      nota(1500, 0, 0.03, 'square', 0.05)
    },
    fanfarria: () => {
      ;[523.25, 659.25, 783.99].forEach((f, i) => nota(f, i * 0.13, 0.22))
      nota(1046.5, 0.39, 0.7, 'triangle', 0.22)
    },
  }
}

// ---------------------------------------------------------------------------
// Confeti sobre un canvas (sin librerías)
// ---------------------------------------------------------------------------
const CONFETI_COLORES = ['#F5B942', '#FDE68A', '#93C5FD', '#86EFAC', '#F9A8D4', '#FFFFFF']
function lanzarConfeti(canvas: HTMLCanvasElement | null) {
  if (!canvas) return () => {}
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.scale(dpr, dpr)
  const piezas = Array.from({ length: 160 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * width * 0.3,
    y: height * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 15 - 5,
    giro: Math.random() * Math.PI,
    vgiro: (Math.random() - 0.5) * 0.4,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    color: CONFETI_COLORES[Math.floor(Math.random() * CONFETI_COLORES.length)]!,
  }))
  let raf = 0
  const inicio = performance.now()
  const frame = (now: number) => {
    const t = now - inicio
    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = t > 3000 ? Math.max(0, 1 - (t - 3000) / 1000) : 1
    for (const p of piezas) {
      p.vy += 0.35
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.giro += p.vgiro
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.giro)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.giro)))
      ctx.restore()
    }
    if (t < 4000) raf = requestAnimationFrame(frame)
    else ctx.clearRect(0, 0, width, height)
  }
  raf = requestAnimationFrame(frame)
  return () => {
    cancelAnimationFrame(raf)
    ctx.clearRect(0, 0, width, height)
  }
}

// ---------------------------------------------------------------------------
// Estado y API
// ---------------------------------------------------------------------------
const api = useApi()
const toast = useToast()

const hoy = hoyMexico()
const fecha = ref<string>(DIAS_JORNADAS.find(d => d.fecha === hoy)?.fecha ?? DIAS_JORNADAS.filter(d => d.fecha <= hoy).at(-1)?.fecha ?? DIAS_JORNADAS[0].fecha)
const diaSel = computed(() => DIAS_JORNADAS.find(d => d.fecha === fecha.value))

const premio = ref('')
const slots = ref<string[]>([]) // nombres con los que se dibujan las casillas
const todos = ref<string[]>([]) // todos los participantes, para la franja
const elegibles = ref(0)
const cargado = ref(false)
const excluidos = ref<{ nombre: string, correo: string }[]>([])
const verExcluidos = ref(false)
const ganadores = ref<GanadorRifaDto[]>([])
const filtro = ref('')
const girando = ref(false)
const ganadorGiro = ref<GanadorRifaDto[] | null>(null)
const ausentes = ref<string[]>([])
const porGiro = ref(1)
const error = ref('')
const sonido = ref(true)
const pantallaCompleta = ref(false)
const reinicio = ref<{ texto: string, enviando: boolean } | null>(null)
const casillasGanadoras = ref<number[] | null>(null)

const stage = useTemplateRef<HTMLDivElement>('stage')
const rueda = useTemplateRef<SVGGElement>('rueda')
const flecha = useTemplateRef<SVGGElement>('flecha')
const confeti = useTemplateRef<HTMLCanvasElement>('confeti')
const aceptar = useTemplateRef<HTMLButtonElement>('aceptar')
const textos: (SVGTextElement | null)[] = [] // <text> de cada casilla: se cambian sin re-render

// Estado de la animación (fuera de la reactividad: cambia en cada cuadro)
let angulo = 0
let velocidad = IDLE_SPEED
let fase: 'idle' | 'accel' | 'decel' = 'idle'
let inicioFase = 0
let frenada: { from: number, delta: number, duration: number, onEnd: () => void } | null = null
const resorte = { angulo: 0, vel: 0 }
let casillaActual = -1
let pausa: ReturnType<typeof setTimeout> | undefined
let nombres: string[] = [] // nombre que muestra cada casilla ahora mismo
let pool: string[] = [] // todos los participantes en orden aleatorio
let cursor = 0 // siguiente nombre del pool que entra a la ruleta
let abajoPrevia = -1 // casilla que está pasando por abajo
let protegidas = new Set<number>() // casillas de los ganadores: no se cambian mientras frena
let detenida = false // quieta mientras se anuncia al ganador
let sonidos: ReturnType<typeof crearSonidos> = null
const movimientoReducido = import.meta.client && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const seg = computed(() => 360 / Math.max(slots.value.length, 1))
const fontSize = computed(() => Math.max(9, Math.min(15, ((2 * Math.PI * 120) / Math.max(slots.value.length, 1)) * 0.45)))
const vigentes = computed(() => ganadores.value.filter(g => g.estado !== 'ANULADO').length)
const ultimos = computed(() => ganadores.value.filter(g => g.estado !== 'ANULADO').slice(0, 5))
const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return ganadores.value
  return ganadores.value.filter(g =>
    g.nombre.toLowerCase().includes(q) || g.correo.includes(q) || (g.telefono ?? '').includes(q) || `#${g.numero}` === q)
})

// Los textos de las casillas se escriben directo en el SVG para turnarlos cada cuadro
watch(slots, async (s) => {
  await nextTick()
  nombres = [...s]
  s.forEach((n, i) => { const t = textos[i]; if (t) t.textContent = nombreCorto(n) })
  abajoPrevia = -1
}, { flush: 'post' })

async function cargarElegibles() {
  try {
    const d = await api<{ total: number, nombres: string[], excluidosPrueba: { nombre: string, correo: string }[] }>('/api/jornadas/rifa/elegibles', { query: { fecha: fecha.value } })
    elegibles.value = d.total
    excluidos.value = d.excluidosPrueba
    pool = d.nombres
    cursor = d.nombres.length > MAX_CASILLAS ? MAX_CASILLAS : 0
    todos.value = d.nombres
    slots.value = d.nombres.slice(0, MAX_CASILLAS)
    cargado.value = true
  }
  catch (e) {
    error.value = errorDeApi(e).mensaje
  }
}

async function cargarGanadores() {
  try {
    ganadores.value = await api<GanadorRifaDto[]>('/api/jornadas/rifa/ganadores', { query: { fecha: fecha.value } })
  }
  catch (e) {
    error.value = errorDeApi(e).mensaje
  }
}

watch(fecha, () => {
  filtro.value = ''
  reinicio.value = null
  cargarElegibles()
  cargarGanadores()
})

// ---------------------------------------------------------------------------
// Animación (requestAnimationFrame, sin re-render por cuadro)
// ---------------------------------------------------------------------------
let raf = 0
function cuadro(ultimo: number) {
  return (now: number) => {
    const dt = Math.min((now - ultimo) / 1000, 0.1)
    const transcurrido = now - inicioFase
    const segmento = seg.value

    // Siempre gira hacia el mismo lado: el ángulo sólo aumenta
    if (fase === 'idle') {
      if (!movimientoReducido && !detenida) angulo += IDLE_SPEED * dt
    }
    else if (fase === 'accel') {
      const t = Math.min(transcurrido / ACELERACION_MS, 1)
      velocidad = IDLE_SPEED + (FAST_SPEED - IDLE_SPEED) * (1 - (1 - t) * (1 - t))
      angulo += velocidad * dt
    }
    else if (fase === 'decel' && frenada) {
      // Arranca con la misma velocidad que traía, así no hay saltos
      const t = Math.min(transcurrido / frenada.duration, 1)
      angulo = frenada.from + frenada.delta * (1 - (1 - t) ** FRENADA_POT)
      if (t >= 1) {
        fase = 'idle'
        frenada.onEnd()
      }
    }

    // Posición de la flecha dentro de la casilla (0 → 1 en el sentido del giro)
    const rot = ((angulo % 360) + 360) % 360
    const u = ((360 - rot) % 360) / segmento
    const casilla = Math.floor(u)
    const avance = 1 - (u - casilla)

    // Cada casilla que pasa por abajo toma el siguiente nombre, así van saliendo todos
    const total = nombres.length
    if (pool.length > total && total > 1) {
      const abajo = Math.floor(((((180 - rot) % 360) + 360) % 360) / segmento)
      if (abajoPrevia !== -1 && abajo !== abajoPrevia) {
        const pasaron = (abajoPrevia - abajo + total) % total
        for (let p = 1; p <= pasaron; p++) {
          const i = (abajoPrevia - p + total) % total
          if (protegidas.has(i)) continue
          nombres[i] = pool[cursor]!
          cursor = (cursor + 1) % pool.length
          const t = textos[i]
          if (t) t.textContent = nombreCorto(nombres[i]!)
        }
      }
      abajoPrevia = abajo
    }

    // Al pasar un clavo la flecha queda empujada al máximo y suena un clic
    if (casilla !== casillaActual) {
      const adelante = casillaActual !== -1
      casillaActual = casilla
      if (adelante) {
        resorte.angulo = Math.min(resorte.angulo, -FLECHA_MAX)
        resorte.vel = 0
        if (fase !== 'idle' && sonido.value) sonidos?.tick()
      }
    }

    // El clavo que se acerca empuja la flecha; al soltarla regresa como resorte
    const empuje = avance > 1 - FLECHA_CONTACTO ? -FLECHA_MAX * ((avance - (1 - FLECHA_CONTACTO)) / FLECHA_CONTACTO) : 0
    const pasos = Math.ceil(dt / 0.004)
    const h = dt / Math.max(pasos, 1)
    for (let i = 0; i < pasos; i++) {
      resorte.vel += (-RESORTE_K * resorte.angulo - RESORTE_AMORT * resorte.vel) * h
      resorte.angulo += resorte.vel * h
      if (empuje < resorte.angulo) {
        resorte.angulo = empuje
        resorte.vel = 0
      }
    }

    rueda.value?.setAttribute('transform', `rotate(${rot} ${C} ${C})`)
    flecha.value?.setAttribute('transform', `rotate(${resorte.angulo} ${C} 14)`)
    raf = requestAnimationFrame(cuadro(now))
  }
}

// Confeti cada vez que aparece un ganador
let pararConfeti = () => {}
watch(ganadorGiro, async (g) => {
  pararConfeti()
  if (!g) return
  await nextTick()
  aceptar.value?.focus()
  if (!movimientoReducido) pararConfeti = lanzarConfeti(confeti.value)
})

// ---------------------------------------------------------------------------
// Sorteo
// ---------------------------------------------------------------------------
async function girar() {
  if (girando.value || ganadorGiro.value || elegibles.value < 1 || slots.value.length < 1) return
  sonidos ??= crearSonidos()
  sonidos?.reanudar()
  girando.value = true
  error.value = ''
  casillasGanadoras.value = null
  detenida = false
  if (!movimientoReducido) {
    inicioFase = performance.now()
    fase = 'accel'
  }

  try {
    // El ganador lo decide el servidor; la ruleta gira mientras tanto (mín. 1.2 s)
    const [lista] = await Promise.all([
      api<GanadorRifaDto[]>('/api/jornadas/rifa/girar', { method: 'POST', body: { fecha: fecha.value, premio: premio.value.trim() || null, cantidad: porGiro.value } }),
      new Promise(r => setTimeout(r, movimientoReducido ? 0 : 1200)),
    ])

    // El primer ganador va en una casilla al azar (donde frena la flecha) y los demás
    // repartidos alrededor; ninguna de esas casillas se cambia mientras frena
    const n = slots.value.length
    const segmento = 360 / n
    const k = Math.floor(Math.random() * n)
    const casillas: number[] = []
    lista.slice(0, n).forEach((ganador, j) => {
      let c = (k + Math.round((j * n) / Math.min(lista.length, n))) % n
      while (casillas.includes(c)) c = (c + 1) % n
      casillas.push(c)
      nombres[c] = ganador.nombre
      const t = textos[c]
      if (t) t.textContent = nombreCorto(ganador.nombre)
    })
    protegidas = new Set(casillas)

    // Lejos de los bordes para que no quede duda de en qué casilla cayó
    const jitter = (Math.random() - 0.5) * segmento * 0.5
    const destino = ((-((k + 0.5) * segmento + jitter) % 360) + 360) % 360
    const from = angulo
    const ajuste = (((destino - from) % 360) + 360) % 360

    // Vueltas y duración calculadas para que la frenada empiece a la velocidad que lleva
    const v0 = Math.max(velocidad, 150)
    const ideal = (v0 * FRENADA_MS) / 1000 / FRENADA_POT
    const vueltas = Math.max(1, Math.round((ideal - ajuste) / 360))
    const delta = 360 * vueltas + ajuste

    frenada = {
      from,
      delta,
      duration: movimientoReducido ? 1500 : (FRENADA_POT * delta * 1000) / v0,
      onEnd: () => {
        velocidad = IDLE_SPEED
        detenida = true
        casillasGanadoras.value = casillas
        pausa = setTimeout(() => {
          ganadorGiro.value = lista
          girando.value = false
          if (sonido.value) sonidos?.fanfarria()
          cargarGanadores()
        }, movimientoReducido ? 0 : PAUSA_GANADOR_MS)
      },
    }
    inicioFase = performance.now()
    fase = 'decel'
  }
  catch (e) {
    fase = 'idle'
    protegidas = new Set()
    velocidad = IDLE_SPEED
    error.value = errorDeApi(e).mensaje
    girando.value = false
  }
}

async function actualizar(id: string, cambios: { estado?: GanadorRifaDto['estado'], premio?: string | null }) {
  try {
    await api(`/api/jornadas/rifa/ganadores/${id}`, { method: 'PATCH', body: cambios })
    await cargarGanadores()
  }
  catch (e) {
    error.value = errorDeApi(e).mensaje
  }
}

function cerrarGanador() {
  ganadorGiro.value = null
  ausentes.value = []
  casillasGanadoras.value = null
  protegidas = new Set()
  detenida = false
  cargarElegibles()
}

// Ganador del giro que no está presente: su premio queda anulado
async function marcarAusente(g: GanadorRifaDto) {
  await actualizar(g.id, { estado: 'ANULADO' })
  ausentes.value.push(g.id)
  if (ganadorGiro.value?.length === 1) cerrarGanador()
}

async function reiniciar() {
  if (!reinicio.value) return
  reinicio.value.enviando = true
  try {
    await api('/api/jornadas/rifa/reiniciar', { method: 'POST', body: { fecha: fecha.value, confirmacion: reinicio.value.texto } })
    reinicio.value = null
    filtro.value = ''
    toast.add({ title: 'Rifa reiniciada', color: 'success' })
    await Promise.all([cargarGanadores(), cargarElegibles()])
  }
  catch (e) {
    error.value = errorDeApi(e).mensaje
    if (reinicio.value) reinicio.value.enviando = false
  }
}

function alternarPantalla() {
  if (document.fullscreenElement) document.exitFullscreen?.()
  else stage.value?.requestFullscreen?.().catch(() => {})
}

function descargarCsv() {
  const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const filas = [['#', 'Nombre', 'Correo', 'Teléfono', 'Procedencia', 'Premio', 'Estado', 'Sorteado'],
    ...[...ganadores.value].reverse().map(g => [g.numero, formatoNombre(g.nombre), g.correo, g.telefono, g.procedencia, g.premio, ESTADO[g.estado].label, new Date(g.sorteadoEn).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })])]
  const blob = new Blob([`﻿${filas.map(f => f.map(esc).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `rifa-jornadas-${fecha.value}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Barra espaciadora para girar (útil al proyectar en pantalla completa)
function alTeclear(e: KeyboardEvent) {
  const el = e.target as HTMLElement
  if (e.code !== 'Space' || ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(el.tagName) || el.isContentEditable) return
  e.preventDefault()
  girar()
}
const alCambiarPantalla = () => { pantallaCompleta.value = !!stage.value && document.fullscreenElement === stage.value }

onMounted(() => {
  cargarElegibles()
  cargarGanadores()
  raf = requestAnimationFrame(cuadro(performance.now()))
  window.addEventListener('keydown', alTeclear)
  document.addEventListener('fullscreenchange', alCambiarPantalla)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(pausa)
  pararConfeti()
  window.removeEventListener('keydown', alTeclear)
  document.removeEventListener('fullscreenchange', alCambiarPantalla)
})
</script>

<style scoped>
.rifa-stage {
  background-color: #0A0E1A;
  background-image: radial-gradient(ellipse at center, rgba(79, 99, 210, 0.28), transparent 65%);
}
.rifa-foco { fill: #FFF7D6; opacity: 0.95; animation: rifa-foco 1.2s ease-in-out infinite; }
.rifa-foco-b { animation-delay: -0.6s; }
.rifa-girando .rifa-foco { animation-duration: 0.25s; }
@keyframes rifa-foco {
  0%, 100% { opacity: 1; fill: #FFF7D6; }
  50% { opacity: 0.35; fill: #F5B942; }
}
.rifa-casilla { transition: opacity 0.5s ease; }
.rifa-casilla-ganadora { animation: rifa-casilla 0.6s ease-in-out infinite alternate; }
@keyframes rifa-casilla {
  from { stroke: #F5B942; stroke-opacity: 1; }
  to { stroke: #FFFFFF; stroke-opacity: 0.6; }
}
.rifa-franja { will-change: transform; animation: rifa-franja linear infinite; }
@keyframes rifa-franja {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.rifa-ganador { animation: rifa-ganador 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes rifa-ganador {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .rifa-foco, .rifa-ganador, .rifa-casilla-ganadora, .rifa-franja { animation: none; }
}
</style>
