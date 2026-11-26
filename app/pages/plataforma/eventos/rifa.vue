<!-- Rifa de las Jornadas 2026 (sólo superadministrador): ruleta entre quienes marcaron su
     ingreso del día. El servidor elige a los ganadores; la ruleta sólo los anima.
     La zona de la ruleta se puede proyectar en pantalla completa (barra espaciadora para girar). -->
<template>
  <PanelPagina id="rifa-jornadas" titulo="Rifa · Jornadas 2026" tamano="xl">
    <template #acciones>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" aria-label="Actualizar" :disabled="girando" @click="recargar" />
      <UButton icon="i-lucide-presentation" label="Proyectar" @click="alternarPantalla" />
    </template>
    <template #herramientas>
      <UTabs v-model="fecha" :items="pestanasDias" :content="false" size="sm" />
      <span class="ml-auto hidden text-xs text-dimmed sm:inline">Participan quienes marcaron su ingreso a la sede ese día</span>
    </template>

    <div class="space-y-6">
      <!-- Cifras -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta ring-2 ring-acento-400">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Por sortear</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(elegibles) }}</p>
          <p class="mt-1 text-xs text-muted">asistentes del {{ diaSel?.etiqueta ?? fecha }}</p>
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Ganadores</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(vigentes) }}</p>
          <p class="mt-1 text-xs text-muted">{{ anulados ? `${nf(anulados)} no estaban presentes` : 'sorteados este día' }}</p>
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Premios entregados</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(entregados) }}</p>
          <p class="mt-1 text-xs text-muted">de {{ nf(vigentes) }} ganadores</p>
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Por entregar</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums" :class="pendientes ? 'text-acento-600 dark:text-acento-400' : 'text-highlighted'">{{ nf(pendientes) }}</p>
          <p class="mt-1 text-xs text-muted">pendientes de recoger</p>
        </div>
      </div>

      <AlertaError :mensaje="error" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <!-- Escenario: ruleta (esta zona se proyecta en pantalla completa) -->
        <div
          ref="stage"
          class="rifa-stage relative isolate flex flex-col items-center justify-center overflow-hidden text-white"
          :class="pantallaCompleta ? 'h-screen w-screen p-[2.5vh]' : 'rounded-2xl px-4 py-6 shadow-flotante sm:px-8 sm:py-8'"
        >
          <!-- Encabezado -->
          <div class="flex items-center gap-3 text-center sm:gap-4">
            <span class="shrink-0 rounded-2xl bg-white p-1.5 shadow-lg shadow-black/20" :class="pantallaCompleta ? 'h-[10vh]' : 'h-14'">
              <img src="/img/marca/escudo-160.png" alt="" class="h-full w-auto" width="138" height="160">
            </span>
            <div class="text-left">
              <p class="font-display font-semibold uppercase tracking-[0.22em] text-marca-200" :class="pantallaCompleta ? 'text-[1.9vh]' : 'text-[11px] sm:text-xs'">
                {{ J.edicion }} {{ J.titulo }}
              </p>
              <p class="font-display font-bold leading-none tracking-tight" :class="pantallaCompleta ? 'text-[6vh]' : 'text-3xl sm:text-4xl'">
                Gran <span class="text-acento-300">Rifa</span>
              </p>
              <p class="mt-1 text-marca-200/90" :class="pantallaCompleta ? 'text-[2vh]' : 'text-xs sm:text-sm'">{{ diaSel?.etiqueta }} de noviembre · {{ J.sede.nombre }}</p>
            </div>
          </div>
          <div class="rifa-filete mt-4 mb-3 h-0.5 w-40 rounded-full" :class="{ 'w-[30vh]': pantallaCompleta }" />

          <p
            v-if="premio.trim()"
            class="mb-3 inline-flex items-center gap-2 rounded-full bg-acento-500/20 px-4 py-1 font-semibold text-acento-200 ring-1 ring-acento-300/40"
            :class="pantallaCompleta ? 'text-[2.6vh]' : 'text-sm'"
          >
            <UIcon name="i-lucide-gift" class="size-[1.1em]" /> {{ premio.trim() }}
          </p>

          <svg
            :viewBox="`0 0 ${SIZE} ${SIZE}`"
            class="w-full drop-shadow-[0_24px_40px_rgba(15,5,30,0.6)]"
            :class="[pantallaCompleta ? 'max-w-[min(90vw,58vh)]' : 'max-w-[min(90vw,62vh,540px)]', { 'rifa-girando': girando }]"
            role="img"
            aria-label="Ruleta de participantes"
          >
            <defs>
              <linearGradient id="rifa-aro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#F4C9A5" />
                <stop offset="45%" stop-color="#E5843F" />
                <stop offset="100%" stop-color="#9C4117" />
              </linearGradient>
              <radialGradient id="rifa-brillo" cx="50%" cy="50%" r="50%">
                <stop offset="55%" stop-color="#1E1230" stop-opacity="0" />
                <stop offset="100%" stop-color="#1E1230" stop-opacity="0.25" />
              </radialGradient>
              <radialGradient id="rifa-centro" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="100%" stop-color="#EEE8F6" />
              </radialGradient>
            </defs>

            <!-- Aro cobre con focos -->
            <circle :cx="C" :cy="C" :r="RIM_R" fill="url(#rifa-aro)" />
            <circle :cx="C" :cy="C" :r="RIM_R - 14" fill="#1E1230" />
            <circle v-for="(f, i) in focos" :key="i" :cx="f[0]" :cy="f[1]" r="4.2" class="rifa-foco" :class="{ 'rifa-foco-b': i % 2 }" />

            <g ref="rueda">
              <circle v-if="slots.length < 2" :cx="C" :cy="C" :r="R" :fill="COLORS[0]" />
              <template v-else>
                <g v-for="(_, i) in slots" :key="i" class="rifa-casilla" :opacity="casillasGanadoras && !casillasGanadoras.includes(i) ? 0.3 : 1">
                  <path :d="slicePath(i * seg, (i + 1) * seg)" :fill="sliceColor(i, slots.length)" stroke="#FFFFFF" stroke-width="1.5" />
                  <text
                    :ref="(el) => { textos[i] = el as SVGTextElement | null }"
                    :transform="`rotate(${(i + 0.5) * seg - 90} ${C} ${C})`"
                    :x="C + R - 14"
                    :y="C"
                    text-anchor="end"
                    dominant-baseline="middle"
                    :font-size="fontSize"
                    font-weight="600"
                    font-family="Barlow, 'Public Sans', sans-serif"
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
                  stroke="#E5843F"
                  stroke-width="6"
                  stroke-linejoin="round"
                  class="rifa-casilla-ganadora"
                />
              </template>
            </g>
            <circle :cx="C" :cy="C" :r="R" fill="url(#rifa-brillo)" pointer-events="none" />

            <text v-if="cargado && elegibles < 1" :x="C" :y="C + 72" text-anchor="middle" font-size="16" font-weight="700" font-family="Barlow, sans-serif" :fill="SLICE_TEXT">
              Sin participantes por sortear
            </text>

            <!-- Centro con el escudo -->
            <circle :cx="C" :cy="C" r="42" fill="url(#rifa-centro)" stroke="url(#rifa-aro)" stroke-width="6" />
            <image href="/img/marca/escudo-160.png" :x="C - 25" :y="C - 29" width="50" height="58" />

            <!-- Flecha: rebota al pasar cada casilla -->
            <g ref="flecha">
              <path :d="`M${C - 17},4 L${C + 17},4 L${C},46 Z`" fill="#D96A22" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
              <circle :cx="C" cy="14" r="5" fill="#FFFFFF" />
            </g>
          </svg>

          <!-- Girar -->
          <div class="mt-5 w-full" :class="pantallaCompleta ? 'max-w-[62vh]' : 'max-w-md'">
            <button
              type="button"
              :disabled="girando || elegibles < 1"
              class="rifa-boton group relative w-full overflow-hidden rounded-xl font-display font-bold uppercase tracking-[0.12em] text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              :class="pantallaCompleta ? 'py-[1.8vh] text-[3vh]' : 'py-4 text-lg'"
              @click="girar"
            >
              <span class="relative z-10 inline-flex items-center justify-center gap-2">
                <UIcon :name="girando ? 'i-lucide-loader-circle' : 'i-lucide-ferris-wheel'" class="size-[1.15em]" :class="{ 'animate-spin': girando }" />
                {{ girando ? 'Girando…' : elegibles < 1 ? 'Sin participantes' : porGiro > 1 ? `Girar · ${porGiro} ganadores` : 'Girar la ruleta' }}
              </span>
            </button>
            <div class="mt-2.5 flex items-center justify-between gap-3 text-marca-200/80" :class="pantallaCompleta ? 'text-[1.8vh]' : 'text-xs'">
              <span class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-users" class="size-[1.1em]" /> {{ nf(elegibles) }} en la ruleta
                <span class="hidden sm:inline">· <kbd class="rounded border border-white/20 bg-white/10 px-1.5 py-px font-sans text-[0.9em]">espacio</kbd> para girar</span>
              </span>
              <span class="flex items-center gap-1">
                <button type="button" class="rounded-lg p-1.5 hover:bg-white/10" :aria-label="sonido ? 'Silenciar' : 'Activar sonido'" :title="sonido ? 'Silenciar' : 'Activar sonido'" @click="sonido = !sonido">
                  <UIcon :name="sonido ? 'i-lucide-volume-2' : 'i-lucide-volume-x'" class="size-4" />
                </button>
                <button type="button" class="rounded-lg p-1.5 hover:bg-white/10" :aria-label="pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'" @click="alternarPantalla">
                  <UIcon :name="pantallaCompleta ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'" class="size-4" />
                </button>
              </span>
            </div>
          </div>

          <!-- Últimos ganadores -->
          <div v-if="ultimos.length" class="mt-4 flex max-w-full flex-wrap justify-center gap-2">
            <span v-for="g in ultimos" :key="g.id" class="rounded-full bg-white/10 px-3 py-1 text-white ring-1 ring-white/15" :class="pantallaCompleta ? 'text-[1.8vh]' : 'text-xs'">
              <span class="font-bold text-acento-300">#{{ g.numero }}</span> {{ nombreCorto(g.nombre) }}
            </span>
          </div>

          <!-- Todos los participantes pasan en una franja para que cada quien vea su nombre -->
          <div v-if="todos.length" class="relative mt-5 w-full overflow-hidden border-t border-white/10 pt-3">
            <p class="mb-1.5 text-center font-display font-semibold uppercase tracking-[0.18em] text-marca-200/80" :class="pantallaCompleta ? 'text-[1.6vh]' : 'text-[10px]'">
              Participan {{ nf(todos.length) }} asistentes
            </p>
            <div class="rifa-borde-izq pointer-events-none absolute inset-y-0 left-0 z-10 w-16" />
            <div class="rifa-borde-der pointer-events-none absolute inset-y-0 right-0 z-10 w-16" />
            <div class="rifa-franja flex w-max" :style="{ animationDuration: `${Math.max(30, todos.length * 2)}s` }">
              <span
                v-for="(nombre, i) in [...todos, ...todos]"
                :key="i"
                class="flex items-center gap-3 whitespace-nowrap px-3 font-medium text-white/90"
                :class="pantallaCompleta ? 'text-[2.2vh]' : 'text-sm'"
              >
                <span class="size-1.5 rounded-full bg-acento-400" />
                {{ formatoNombre(nombre) }}
              </span>
            </div>
          </div>

          <!-- Ganadores del giro (dentro del escenario para que también se vean en pantalla completa) -->
          <div v-if="ganadorGiro" role="dialog" aria-modal="true" :aria-label="ganadorGiro.length === 1 ? 'Ganador' : 'Ganadores'" class="absolute inset-0 z-20 flex items-center justify-center bg-marca-950/80 p-4 backdrop-blur-sm">
            <div
              class="rifa-ganador max-h-full w-full overflow-y-auto rounded-3xl bg-gradient-to-b from-marca-800 to-marca-950 p-6 text-center shadow-2xl shadow-black/40 ring-2 ring-acento-400/70 sm:p-8"
              :class="ganadorGiro.length === 1 ? 'max-w-lg' : 'max-w-2xl'"
            >
              <span class="mx-auto mb-3 flex items-center justify-center rounded-full bg-acento-500/20 ring-1 ring-acento-300/40" :class="pantallaCompleta ? 'size-[11vh]' : 'size-16'">
                <UIcon name="i-lucide-trophy" class="text-acento-300" :class="pantallaCompleta ? 'size-[6vh]' : 'size-8'" />
              </span>
              <template v-if="ganadorGiro.length === 1">
                <p class="font-display font-semibold uppercase tracking-[0.22em] text-acento-300" :class="pantallaCompleta ? 'text-[2.6vh]' : 'text-sm'">Ganador #{{ ganadorGiro[0]!.numero }}</p>
                <h2 class="mt-2 break-words font-display font-bold leading-tight text-white" :class="pantallaCompleta ? 'text-[6.5vh]' : 'text-3xl sm:text-4xl'">
                  {{ formatoNombre(ganadorGiro[0]!.nombre) }}
                </h2>
                <p v-if="ganadorGiro[0]!.procedencia" class="mt-2 text-marca-200" :class="{ 'text-[2.4vh]': pantallaCompleta }">{{ ganadorGiro[0]!.procedencia }}</p>
              </template>
              <template v-else>
                <h2 class="font-display font-bold uppercase tracking-[0.14em] text-acento-300" :class="pantallaCompleta ? 'text-[4vh]' : 'text-2xl'">¡{{ ganadorGiro.length }} ganadores!</h2>
                <ul class="mt-4 space-y-2 text-left">
                  <li
                    v-for="g in ganadorGiro"
                    :key="g.id"
                    class="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-2.5 ring-1 ring-white/10"
                    :class="{ 'opacity-40': ausentes.includes(g.id) }"
                  >
                    <span class="shrink-0 font-display font-bold text-acento-300" :class="pantallaCompleta ? 'text-[2.8vh]' : 'text-lg'">#{{ g.numero }}</span>
                    <div class="min-w-0 flex-1">
                      <p class="break-words font-display font-semibold leading-tight text-white" :class="[{ 'line-through': ausentes.includes(g.id) }, pantallaCompleta ? 'text-[3.2vh]' : 'text-lg']">
                        {{ formatoNombre(g.nombre) }}
                      </p>
                      <p v-if="g.procedencia" class="text-marca-200/80" :class="pantallaCompleta ? 'text-[1.9vh]' : 'text-xs'">{{ g.procedencia }}</p>
                    </div>
                    <button v-if="!ausentes.includes(g.id)" type="button" class="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15" @click="marcarAusente(g)">
                      No está
                    </button>
                  </li>
                </ul>
              </template>
              <p v-if="ganadorGiro[0]!.premio" class="mt-4 inline-flex items-center gap-2 rounded-full bg-acento-500/20 px-4 py-1 font-semibold text-acento-200" :class="{ 'text-[2.4vh]': pantallaCompleta }">
                <UIcon name="i-lucide-gift" class="size-[1.1em]" /> {{ ganadorGiro[0]!.premio }}
              </p>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                <button v-if="ganadorGiro.length === 1" type="button" class="flex-1 rounded-xl bg-white/10 py-2.5 font-semibold text-white hover:bg-white/15" @click="marcarAusente(ganadorGiro[0]!)">
                  No está presente
                </button>
                <button ref="aceptar" type="button" class="rifa-boton flex-1 rounded-xl py-2.5 font-bold text-white" @click="cerrarGanador">
                  Aceptar
                </button>
              </div>
            </div>
          </div>
          <canvas ref="confeti" class="pointer-events-none absolute inset-0 z-30 h-full w-full" />
        </div>

        <!-- Columna lateral: siguiente giro y ganadores -->
        <div class="flex min-w-0 flex-col gap-6">
          <section class="rounded-2xl bg-default p-5 shadow-tarjeta">
            <h2 class="flex items-center gap-2 font-display text-base font-bold text-highlighted">
              <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-primary" /> Siguiente giro
            </h2>
            <div class="mt-4 space-y-4">
              <UFormField label="Premio (opcional)" help="Se muestra sobre la ruleta y queda en el registro del ganador.">
                <UInput v-model="premio" icon="i-lucide-gift" maxlength="120" placeholder="Ej. Kit de dermatoscopía" :disabled="girando" class="w-full" />
              </UFormField>
              <UFormField label="Ganadores por giro">
                <div class="grid grid-cols-4 gap-2">
                  <UButton
                    v-for="c in [1, 3, 5, 10]"
                    :key="c"
                    :label="String(c)"
                    block
                    :color="porGiro === c ? 'primary' : 'neutral'"
                    :variant="porGiro === c ? 'solid' : 'soft'"
                    :disabled="girando"
                    @click="porGiro = c"
                  />
                </div>
              </UFormField>
            </div>
          </section>

          <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-default shadow-tarjeta">
            <div class="flex flex-wrap items-center gap-2 border-b border-default px-5 py-3">
              <h2 class="font-display text-base font-bold text-highlighted">Ganadores</h2>
              <UBadge v-if="ganadores.length" :label="String(ganadores.length)" color="neutral" variant="soft" />
              <UButton icon="i-lucide-download" label="CSV" size="sm" color="neutral" variant="ghost" class="ml-auto" :disabled="!ganadores.length" @click="descargarCsv" />
            </div>
            <div v-if="ganadores.length > 4" class="border-b border-default px-5 py-2.5">
              <UInput v-model="filtro" icon="i-lucide-search" placeholder="Nombre, correo, teléfono o #número" size="sm" class="w-full" />
            </div>

            <div class="max-h-[34rem] flex-1 divide-y divide-default overflow-y-auto">
              <EstadoVacio
                v-if="!filtrados.length"
                icono="i-lucide-trophy"
                :titulo="ganadores.length ? 'Sin coincidencias' : 'Aún no hay ganadores'"
                :descripcion="ganadores.length ? undefined : 'Gire la ruleta para sortear el primer premio del día.'"
              />
              <div v-for="g in filtrados" :key="g.id" class="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-marca-50/60 dark:hover:bg-white/5">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
                  :class="g.estado === 'ANULADO' ? 'bg-muted text-dimmed' : 'bg-acento-100 text-acento-800 dark:bg-acento-900/40 dark:text-acento-200'"
                >
                  #{{ g.numero }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="truncate font-medium text-highlighted" :class="{ 'text-dimmed line-through': g.estado === 'ANULADO' }">{{ formatoNombre(g.nombre) }}</p>
                    <UBadge :label="ESTADO[g.estado].label" :color="ESTADO[g.estado].color" variant="soft" size="sm" class="shrink-0" />
                  </div>
                  <p class="truncate text-xs text-muted">{{ g.correo }}<template v-if="g.telefono"> · {{ g.telefono }}</template></p>
                  <p v-if="g.premio" class="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-acento-700 dark:text-acento-300">
                    <UIcon name="i-lucide-gift" class="size-3.5" /> {{ g.premio }}
                  </p>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <UButton v-if="g.estado === 'PENDIENTE'" icon="i-lucide-check" label="Entregar premio" size="xs" color="success" variant="soft" @click="actualizar(g.id, { estado: 'ENTREGADO' })" />
                    <UButton v-else-if="g.estado === 'ENTREGADO'" icon="i-lucide-undo-2" label="Deshacer" size="xs" color="neutral" variant="ghost" @click="actualizar(g.id, { estado: 'PENDIENTE' })" />
                    <UButton v-else icon="i-lucide-user-check" label="Sí estaba" size="xs" color="neutral" variant="ghost" @click="actualizar(g.id, { estado: 'PENDIENTE' })" />
                    <span v-if="g.estado === 'ENTREGADO' && g.entregadoEn" class="text-xs text-dimmed">{{ hora(g.entregadoEn) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Registros de prueba y reinicio -->
          <section class="space-y-3 rounded-2xl bg-default p-5 text-sm shadow-tarjeta">
            <button type="button" class="flex w-full items-center gap-2 text-left text-muted hover:text-highlighted" @click="verExcluidos = !verExcluidos">
              <UIcon name="i-lucide-flask-conical" class="size-4 shrink-0" />
              <span class="flex-1">{{ excluidos.length }} registro(s) de prueba excluidos de la rifa</span>
              <UIcon :name="verExcluidos ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4" />
            </button>
            <ul v-if="verExcluidos" class="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-muted p-3 text-xs text-muted">
              <li v-if="!excluidos.length">Ninguno</li>
              <li v-for="(x, i) in excluidos" :key="i">{{ x.nombre }} · <span class="text-dimmed">{{ x.correo }}</span></li>
            </ul>

            <USeparator />

            <form v-if="reinicio" class="space-y-3 rounded-xl bg-error/10 p-4" @submit.prevent="reiniciar">
              <p class="text-highlighted">
                Se borrarán los <b>{{ ganadores.length }}</b> ganadores del {{ diaSel?.etiqueta }} y todos los asistentes de ese día volverán a participar.
                La asistencia no se modifica. Escriba <b>REINICIAR</b> para confirmar.
              </p>
              <UInput v-model="reinicio.texto" autofocus placeholder="REINICIAR" class="w-full" />
              <div class="flex justify-end gap-2">
                <UButton label="Cancelar" color="neutral" variant="ghost" @click="reinicio = null" />
                <UButton type="submit" icon="i-lucide-rotate-ccw" label="Reiniciar rifa" color="error" :loading="reinicio.enviando" :disabled="reinicio.texto.trim().toUpperCase() !== 'REINICIAR'" />
              </div>
            </form>
            <button v-else type="button" :disabled="girando || !ganadores.length" class="flex items-center gap-2 text-error/80 hover:text-error disabled:opacity-40" @click="reinicio = { texto: '', enviando: false }">
              <UIcon name="i-lucide-rotate-ccw" class="size-4" />
              Reiniciar la rifa de este día
            </button>
          </section>
        </div>
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
// Lavandas del escudo alternadas con tonos cobre; el texto va en morado oscuro para que se lea bien
const COLORS = ['#DCCFEB', '#F4C9A5', '#C0A9DA', '#FAE6D4', '#9D7CC2', '#ECA46D']
const SLICE_TEXT = '#1E1230'
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
const CONFETI_COLORES = ['#E5843F', '#F4C9A5', '#9D7CC2', '#DCCFEB', '#D96A22', '#FFFFFF']
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
const pestanasDias = computed(() => DIAS_JORNADAS.map(d => ({ label: d.fecha === hoy ? `${d.etiqueta} · hoy` : d.etiqueta, value: d.fecha, icon: d.fecha === hoy ? 'i-lucide-radio' : 'i-lucide-calendar', disabled: girando.value })))

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
const anulados = computed(() => ganadores.value.filter(g => g.estado === 'ANULADO').length)
const entregados = computed(() => ganadores.value.filter(g => g.estado === 'ENTREGADO').length)
const pendientes = computed(() => ganadores.value.filter(g => g.estado === 'PENDIENTE').length)
const hora = (d: Date | string) => `Entregado ${new Date(d).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' })}`
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

function recargar() {
  cargarElegibles()
  cargarGanadores()
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
/* Escenario con los colores del escudo: morado profundo y un resplandor cobre al centro. */
.rifa-stage {
  background-color: var(--color-marca-950);
  background-image:
    radial-gradient(ellipse 60% 50% at 50% 45%, rgb(217 106 34 / 0.22), transparent 70%),
    radial-gradient(ellipse at top, var(--color-marca-800), transparent 70%),
    linear-gradient(to bottom, var(--color-marca-900), var(--color-marca-950));
}
.rifa-filete { background: linear-gradient(90deg, transparent, var(--color-acento-400), var(--color-marca-300), transparent); }
.rifa-borde-izq { background: linear-gradient(to right, var(--color-marca-950), transparent); }
.rifa-borde-der { background: linear-gradient(to left, var(--color-marca-950), transparent); }
.rifa-boton {
  background: linear-gradient(to bottom, var(--color-acento-400), var(--color-acento-600));
  box-shadow: 0 10px 28px -8px rgb(217 106 34 / 0.6), inset 0 1px 0 rgb(255 255 255 / 0.25);
}
.rifa-boton:not(:disabled):hover { background: linear-gradient(to bottom, var(--color-acento-300), var(--color-acento-500)); }
.rifa-foco { fill: #FDF5EE; opacity: 0.95; animation: rifa-foco 1.2s ease-in-out infinite; }
.rifa-foco-b { animation-delay: -0.6s; }
.rifa-girando .rifa-foco { animation-duration: 0.25s; }
@keyframes rifa-foco {
  0%, 100% { opacity: 1; fill: #FDF5EE; }
  50% { opacity: 0.35; fill: #E5843F; }
}
.rifa-casilla { transition: opacity 0.5s ease; }
.rifa-casilla-ganadora { animation: rifa-casilla 0.6s ease-in-out infinite alternate; }
@keyframes rifa-casilla {
  from { stroke: #E5843F; stroke-opacity: 1; }
  to { stroke: #FFFFFF; stroke-opacity: 0.7; }
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
