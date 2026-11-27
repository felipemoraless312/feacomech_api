<!-- Muro de las Jornadas 2026: mini foro donde los asistentes publican fotos del evento,
     dan "me gusta" y comentan. Las fotos se reducen y limpian en el teléfono, el servidor las
     reconstruye sin metadatos y el personal revisa cada publicación antes de mostrarla. -->
<template>
  <div class="bg-muted/50">
    <!-- Encabezado -->
    <section class="relative isolate overflow-hidden bg-marca-950 text-white">
      <div class="fondo-muro pointer-events-none absolute inset-0 -z-10" />
      <UContainer class="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <NuxtLink to="/jornadas-2026" class="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
            <UIcon name="i-lucide-arrow-left" class="size-4" /> {{ J.edicion }} Jornadas Académicas FEACOMECH
          </NuxtLink>
          <p class="mt-6 font-display text-sm font-semibold uppercase tracking-[0.28em] text-acento-300">Muro de las Jornadas</p>
          <h1 class="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
            Comparte tus <span class="text-acento-300">momentos</span>
          </h1>
          <p class="mt-5 max-w-xl text-lg text-white/80">
            Publica tus fotos del evento, comenta las de tus colegas y vive las Jornadas también aquí. Las publicaciones aprobadas aparecen en el muro, en la pantalla de la sede y pueden compartirse en las redes sociales de la FEACOMECH.
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <UButton icon="i-lucide-square-pen" label="Publicar" size="xl" class="bg-acento-500 text-white shadow-lg shadow-acento-900/40 hover:bg-acento-600" @click="irAPublicar" />
            <button type="button" class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20" @click="copiarHashtag">
              <UIcon :name="hashtagCopiado ? 'i-lucide-check' : 'i-lucide-hash'" class="size-4 text-acento-300" />
              {{ HASHTAG_JORNADAS.slice(1) }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div v-for="c in cifras" :key="c.t" class="rounded-2xl bg-white/10 px-3 py-5 ring-1 ring-white/15 backdrop-blur">
            <UIcon :name="c.icono" class="mx-auto size-6 text-acento-300" />
            <p class="mt-2 font-display text-3xl font-bold tabular-nums sm:text-4xl">{{ nf(c.v) }}</p>
            <p class="text-xs font-medium uppercase tracking-wide text-white/65">{{ c.t }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div class="mx-auto w-full max-w-2xl space-y-5">
        <!-- Publicar -->
        <section id="publicar" class="scroll-mt-24 overflow-hidden rounded-2xl bg-default shadow-tarjeta">
          <div v-if="publicado" class="px-6 py-10 text-center">
            <div class="exito mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
              <UIcon name="i-lucide-party-popper" class="size-8" />
            </div>
            <h2 class="mt-4 font-display text-2xl font-bold text-highlighted">¡Gracias por compartir!</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              Tu publicación está en revisión. En cuanto el equipo de la Federación la apruebe, aparecerá aquí en el muro.
            </p>
            <UButton class="mt-5" icon="i-lucide-square-pen" label="Publicar otra" @click="publicado = false" />
          </div>

          <form v-else @submit.prevent="publicar">
            <div class="flex gap-3 p-4 sm:p-5">
              <Avatar :nombre="autor" class="size-11 text-base" />
              <div class="min-w-0 flex-1 space-y-2">
                <input
                  v-model="autor"
                  maxlength="60"
                  placeholder="Tu nombre (opcional, para darte crédito)"
                  :disabled="enviando"
                  class="w-full bg-transparent text-sm font-semibold text-highlighted outline-none placeholder:font-normal placeholder:text-dimmed"
                >
                <textarea
                  ref="caja"
                  v-model="mensaje"
                  rows="3"
                  maxlength="500"
                  placeholder="¿Qué está pasando en las Jornadas?"
                  :disabled="enviando"
                  class="w-full resize-none bg-transparent text-[17px] leading-relaxed text-highlighted outline-none placeholder:text-dimmed"
                />
              </div>
            </div>

            <!-- Fotos elegidas -->
            <div v-if="items.length" class="grid grid-cols-3 gap-2 px-4 pb-3 sm:grid-cols-6 sm:px-5">
              <div v-for="it in items" :key="it.clave" class="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-default">
                <img v-if="it.vista" :src="it.vista" alt="" class="size-full object-cover">
                <div v-else class="flex size-full items-center justify-center"><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-dimmed" /></div>
                <div v-if="it.estado === 'enviando'" class="absolute inset-0 flex items-center justify-center bg-marca-950/55"><UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-white" /></div>
                <div v-else-if="it.estado === 'listo'" class="absolute inset-0 flex items-center justify-center bg-success/60"><UIcon name="i-lucide-check" class="size-7 text-white" /></div>
                <div v-else-if="it.estado === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-error/75 p-1 text-center text-[10px] font-medium leading-tight text-white">
                  <UIcon name="i-lucide-triangle-alert" class="size-4" />{{ it.error }}
                </div>
                <button v-if="!enviando" type="button" class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Quitar foto" @click="quitar(it)">
                  <UIcon name="i-lucide-x" class="size-3.5" />
                </button>
              </div>
            </div>

            <!-- Campo trampa para robots: no lo ven las personas -->
            <div class="hidden" aria-hidden="true">
              <label>Sitio web <input v-model="sitio" type="text" tabindex="-1" autocomplete="off"></label>
            </div>

            <div class="space-y-3 border-t border-default bg-muted/40 px-4 py-3 sm:px-5">
              <UCheckbox v-model="autorizo" :disabled="enviando" :ui="{ label: 'text-xs font-normal text-muted' }">
                <template #label>
                  Autorizo a la FEACOMECH a publicar mis fotos en su sitio y en sus redes sociales oficiales, y confirmo que las tomé yo o tengo permiso para compartirlas.
                </template>
              </UCheckbox>
              <AlertaError :mensaje="error" />
              <div class="flex items-center justify-between gap-3">
                <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-marca-700 transition hover:bg-marca-50 dark:text-marca-200 dark:hover:bg-white/5" :class="{ 'pointer-events-none opacity-50': enviando || items.length >= FOTOS_POR_PUBLICACION }">
                  <input ref="selector" type="file" accept="image/*" multiple class="sr-only" :disabled="enviando || items.length >= FOTOS_POR_PUBLICACION" @change="elegir">
                  <UIcon name="i-lucide-image-plus" class="size-5 text-acento-500" />
                  Fotos <span class="font-normal text-dimmed">{{ items.length }}/{{ FOTOS_POR_PUBLICACION }}</span>
                </label>
                <UButton
                  type="submit"
                  :loading="enviando"
                  :disabled="(!mensaje.trim() && !items.length) || !autorizo || !boleto"
                  :label="enviando && items.length ? `Subiendo ${progreso}/${items.length}…` : 'Publicar'"
                  icon="i-lucide-send"
                  class="bg-acento-500 px-5 text-white hover:bg-acento-600 disabled:bg-acento-500/50"
                />
              </div>
            </div>
          </form>
        </section>

        <!-- Nuevas -->
        <Transition name="aviso">
          <div v-if="nuevas.length" class="sticky top-20 z-10 flex justify-center">
            <button type="button" class="inline-flex items-center gap-2 rounded-full bg-acento-500 px-5 py-2 text-sm font-semibold text-white shadow-flotante hover:bg-acento-600" @click="mostrarNuevas">
              <UIcon name="i-lucide-arrow-up" class="size-4" />
              {{ nuevas.length }} {{ nuevas.length === 1 ? 'publicación nueva' : 'publicaciones nuevas' }}
            </button>
          </div>
        </Transition>

        <!-- Publicaciones -->
        <div v-if="!publicaciones.length" class="rounded-2xl bg-default p-10 text-center shadow-tarjeta">
          <UIcon name="i-lucide-messages-square" class="mx-auto size-10 text-dimmed" />
          <p class="mt-3 font-display text-lg font-semibold text-highlighted">El muro está esperando su primera publicación</p>
          <p class="mt-1 text-sm text-muted">¡Comparte una foto de las Jornadas y sé quien lo inaugure!</p>
        </div>
        <TransitionGroup tag="div" name="pub" class="space-y-5">
          <article v-for="p in publicaciones" :key="p.id" class="overflow-hidden rounded-2xl bg-default shadow-tarjeta" :class="{ 'ring-2 ring-acento-400': p.destacada }">
            <header class="flex items-center gap-3 px-4 pt-4 sm:px-5">
              <Avatar :nombre="p.autor" class="size-10 text-sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-highlighted">{{ p.autor || 'Asistente de las Jornadas' }}</p>
                <p class="text-xs text-dimmed">{{ haceCuanto(p.creadoEn) }} · Polyforum Chiapas</p>
              </div>
              <span v-if="p.destacada" class="inline-flex items-center gap-1 rounded-full bg-acento-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-acento-800 dark:bg-acento-900/40 dark:text-acento-200">
                <UIcon name="i-lucide-star" class="size-3" /> Destacada
              </span>
            </header>
            <p v-if="p.mensaje" class="whitespace-pre-line px-4 pt-3 text-[15px] leading-relaxed text-highlighted [overflow-wrap:anywhere] sm:px-5">{{ p.mensaje }}</p>

            <!-- Fotos -->
            <div v-if="p.fotos.length" class="mt-3 grid gap-0.5" :class="rejilla(p.fotos.length)">
              <button
                v-for="(f, i) in p.fotos.slice(0, 4)"
                :key="f.id"
                type="button"
                class="group relative block overflow-hidden bg-muted"
                :class="celda(p.fotos.length, i)"
                :aria-label="`Ver foto ${i + 1} de ${p.fotos.length}`"
                @click="abrir(p, i)"
              >
                <img
                  :src="mini(f.id)"
                  :alt="p.mensaje ?? 'Foto de las Jornadas'"
                  :width="f.ancho"
                  :height="f.alto"
                  loading="lazy"
                  class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  :style="p.fotos.length === 1 ? { aspectRatio: `${f.ancho} / ${f.alto}`, maxHeight: '36rem' } : undefined"
                >
                <span v-if="i === 3 && p.fotos.length > 4" class="absolute inset-0 flex items-center justify-center bg-black/50 font-display text-3xl font-bold text-white">+{{ p.fotos.length - 4 }}</span>
              </button>
            </div>

            <!-- Acciones -->
            <div class="flex items-center gap-1 border-b border-default px-2 py-1.5 sm:px-3">
              <button type="button" class="accion" :class="{ 'text-rose-500': gustadas.has(p.id) }" @click="gustar(p)">
                <UIcon name="i-lucide-heart" class="size-5" :class="[{ 'fill-current': gustadas.has(p.id) }, { latido: latiendo === p.id }]" />
                <span>{{ p.meGusta || '' }} Me gusta</span>
              </button>
              <button type="button" class="accion" @click="enfocarComentario(p.id)">
                <UIcon name="i-lucide-message-circle" class="size-5" />
                <span>{{ p.totalComentarios || '' }} Comentar</span>
              </button>
              <button type="button" class="accion ml-auto" @click="compartir(p)">
                <UIcon name="i-lucide-share-2" class="size-5" />
                <span class="hidden sm:inline">Compartir</span>
              </button>
            </div>

            <!-- Comentarios -->
            <div class="space-y-3 bg-muted/30 px-4 py-3 sm:px-5">
              <button v-if="p.totalComentarios > p.comentarios.length" type="button" class="text-sm font-medium text-muted hover:text-highlighted" @click="verComentarios(p)">
                Ver {{ p.totalComentarios === 1 ? 'el comentario' : `los ${p.totalComentarios} comentarios` }}
              </button>
              <div v-for="c in p.comentarios" :key="c.id" class="group flex gap-2.5">
                <Avatar :nombre="c.autor" class="size-8 text-xs" />
                <div class="min-w-0 flex-1">
                  <div class="inline-block max-w-full rounded-2xl bg-default px-3.5 py-2 ring-1 ring-default">
                    <p class="text-xs font-semibold text-highlighted">{{ c.autor || 'Asistente' }}</p>
                    <p class="text-sm text-toned [overflow-wrap:anywhere]">{{ c.texto }}</p>
                  </div>
                  <div class="mt-0.5 flex gap-3 px-2 text-[11px] text-dimmed">
                    <span>{{ haceCuanto(c.creadoEn) }}</span>
                    <button v-if="!reportados.has(c.id)" type="button" class="opacity-0 transition hover:text-error group-hover:opacity-100 focus:opacity-100" @click="reportar(c)">Reportar</button>
                    <span v-else class="text-error/80">Reportado</span>
                  </div>
                </div>
              </div>

              <form class="flex items-start gap-2.5" @submit.prevent="comentar(p)">
                <Avatar :nombre="autor" class="size-8 text-xs" />
                <div class="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-default py-1 pl-4 pr-1 ring-1 ring-default focus-within:ring-marca-300">
                  <input
                    :id="`comentario-${p.id}`"
                    v-model="borradores[p.id]"
                    maxlength="280"
                    :placeholder="autor ? `Comenta como ${autor}…` : 'Escribe un comentario…'"
                    class="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-dimmed"
                    :disabled="comentando === p.id"
                  >
                  <UButton type="submit" icon="i-lucide-send-horizontal" size="sm" variant="ghost" :loading="comentando === p.id" :disabled="!borradores[p.id]?.trim()" aria-label="Enviar comentario" class="rounded-full" />
                </div>
              </form>
            </div>
          </article>
        </TransitionGroup>

        <div v-if="hayMas" class="text-center">
          <UButton label="Ver publicaciones anteriores" icon="i-lucide-chevron-down" color="neutral" variant="outline" :loading="cargandoMas" @click="cargarMas" />
        </div>
      </div>

      <!-- Lateral -->
      <aside class="space-y-4 lg:sticky lg:top-20">
        <div class="rounded-2xl bg-marca-900 p-5 text-white shadow-tarjeta">
          <h3 class="flex items-center gap-2 font-display text-lg font-bold">
            <UIcon name="i-lucide-megaphone" class="size-5 text-acento-300" /> Se publicarán en redes
          </h3>
          <p class="justificado mt-2 text-sm leading-relaxed text-white/80">
            La Federación puede compartir las publicaciones aprobadas en su página de Facebook y demás redes oficiales, con tu crédito si escribes tu nombre.
          </p>
          <UButton :to="J.contacto.facebook" target="_blank" icon="i-lucide-facebook" label="facebook.com/feacomech" size="sm" class="mt-4 bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20" />
        </div>

        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <h3 class="flex items-center gap-2 font-display text-base font-bold text-highlighted">
            <UIcon name="i-lucide-shield-check" class="size-5 text-primary" /> Reglas del muro
          </h3>
          <ul class="mt-3 space-y-2.5 text-sm text-muted">
            <li v-for="r in REGLAS" :key="r" class="flex gap-2.5">
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-success" /><span>{{ r }}</span>
            </li>
          </ul>
          <p class="justificado mt-4 border-t border-default pt-4 text-xs leading-relaxed text-dimmed">
            No pedimos correo ni teléfono, y a las fotos se les quita la ubicación y los datos del teléfono. Si apareces en una foto y quieres que la retiremos, escríbenos por
            <a :href="J.contacto.whatsapp" target="_blank" rel="noopener" class="font-medium text-primary hover:underline">WhatsApp</a>.
            Consulta el <NuxtLink to="/aviso-de-privacidad" class="font-medium text-primary hover:underline">aviso de privacidad</NuxtLink>.
          </p>
        </div>

        <NuxtLink to="/jornadas-2026/muro/pantalla" target="_blank" class="flex items-center gap-3 rounded-2xl bg-default p-4 shadow-tarjeta transition hover:shadow-flotante">
          <span class="flex size-10 items-center justify-center rounded-xl bg-acento-100 text-acento-700 dark:bg-acento-900/40 dark:text-acento-200"><UIcon name="i-lucide-monitor-play" class="size-5" /></span>
          <span class="min-w-0 flex-1">
            <span class="block font-semibold text-highlighted">Modo pantalla</span>
            <span class="block text-xs text-muted">Presentación para proyectar en la sede</span>
          </span>
          <UIcon name="i-lucide-arrow-up-right" class="size-4 text-dimmed" />
        </NuxtLink>
      </aside>
    </UContainer>

    <!-- Visor de fotos -->
    <Teleport to="body">
      <Transition name="visor">
        <div v-if="visor" class="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label="Fotos de la publicación" @click.self="visor = null">
          <div class="flex items-center justify-between gap-3 p-3 sm:p-4">
            <p class="truncate text-sm text-white/70">{{ visor.pub.autor || 'Asistente de las Jornadas' }} · {{ visor.i + 1 }} de {{ visor.pub.fotos.length }}</p>
            <button type="button" class="rounded-full p-2 hover:bg-white/10" aria-label="Cerrar" @click="visor = null"><UIcon name="i-lucide-x" class="size-6" /></button>
          </div>
          <div class="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" @click.self="visor = null">
            <img :key="visor.pub.fotos[visor.i]!.id" :src="grande(visor.pub.fotos[visor.i]!.id)" :alt="visor.pub.mensaje ?? 'Foto de las Jornadas'" class="visor-img max-h-full max-w-full rounded-md object-contain">
            <button v-if="visor.i > 0" type="button" class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Anterior" @click="visor.i--"><UIcon name="i-lucide-chevron-left" class="size-6" /></button>
            <button v-if="visor.i < visor.pub.fotos.length - 1" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Siguiente" @click="visor.i++"><UIcon name="i-lucide-chevron-right" class="size-6" /></button>
          </div>
          <div class="flex items-center justify-between gap-4 p-4 sm:px-8">
            <p class="line-clamp-2 min-w-0 text-sm text-white/80">{{ visor.pub.mensaje ?? HASHTAG_JORNADAS }}</p>
            <button type="button" class="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20" :class="{ 'text-rose-400': gustadas.has(visor.pub.id) }" @click="gustar(visor.pub)">
              <UIcon name="i-lucide-heart" class="size-5" :class="{ 'fill-current': gustadas.has(visor.pub.id), latido: latiendo === visor.pub.id }" />
              {{ visor.pub.meGusta }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { FOTOS_POR_PUBLICACION, HASHTAG_JORNADAS, LADO_FOTO, LADO_MINIATURA, textoNoPermitido, type ComentarioDto, type PublicacionDto } from '#shared/muro-jornadas'

const titulo = `Muro de las ${J.edicion} Jornadas Académicas FEACOMECH`
const descripcionSeo = 'Comparte tus fotos de las Jornadas Académicas FEACOMECH 2026, comenta las de tus colegas y vive el evento en el muro. Las publicaciones aprobadas pueden compartirse en las redes sociales de la Federación.'
useSeoMeta({ title: titulo, description: descripcionSeo })
useCompartir({ titulo, descripcion: descripcionSeo })

const toast = useToast()
const nf = (n: number) => n.toLocaleString('es-MX')
const mini = (id: string) => `/api/publico/jornadas/muro/foto/${id}/mini`
const grande = (id: string) => `/api/publico/jornadas/muro/foto/${id}/grande`

const REGLAS = [
  'Fotos del evento: ponencias, talleres, carteles, convivencia y la sede.',
  'Nunca fotos de pacientes, expedientes, credenciales ni documentos con datos personales.',
  'Si salen otras personas, que estén de acuerdo en aparecer.',
  'Lenguaje respetuoso y sin enlaces. Cada publicación se revisa antes de aparecer.',
]

// Avatar con iniciales (o ícono si no hay nombre), con color estable por nombre
const COLORES_AVATAR = ['bg-marca-600', 'bg-acento-500', 'bg-marca-400', 'bg-acento-700', 'bg-marca-800', 'bg-acento-400']
const Avatar = defineComponent({
  props: { nombre: { type: String as PropType<string | null>, default: null } },
  setup(props) {
    return () => {
      const n = props.nombre?.trim() ?? ''
      const iniciales = n.split(/\s+/).filter(w => !/^(dr|dra|lic|mtro|mtra)\.?$/i.test(w)).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
      let h = 0
      for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0
      return h_(
        'span',
        { 'class': ['inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold text-white', n ? COLORES_AVATAR[h % COLORES_AVATAR.length] : 'bg-gris-400'], 'aria-hidden': 'true' },
        iniciales || [h_(resolveComponent('UIcon'), { name: 'i-lucide-user', class: 'size-[55%]' })],
      )
    }
  },
})
const h_ = h

function haceCuanto(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'hace un momento'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' })
}

// Rejilla de fotos al estilo de las redes sociales
const rejilla = (n: number) => (n === 1 ? 'grid-cols-1' : n === 2 ? 'grid-cols-2' : n === 3 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2')
const celda = (n: number, i: number) => {
  if (n === 1) return ''
  if (n === 2) return 'aspect-[4/5]'
  if (n === 3) return i === 0 ? 'row-span-2 aspect-[4/5] h-full' : 'aspect-[8/5]'
  return 'aspect-square'
}

// -- Muro ---------------------------------------------------------------------
type Pagina = { publicaciones: PublicacionDto[], total: number, totalFotos: number, hayMas: boolean }
const { data } = await useAsyncData('muro-jornadas', () => $fetch<Pagina>('/api/publico/jornadas/muro'))
const publicaciones = ref<PublicacionDto[]>(data.value?.publicaciones ?? [])
const total = ref(data.value?.total ?? 0)
const totalFotos = ref(data.value?.totalFotos ?? 0)
const hayMas = ref(data.value?.hayMas ?? false)
const nuevas = ref<PublicacionDto[]>([])
const cargandoMas = ref(false)
const totalComentarios = computed(() => publicaciones.value.reduce((s, p) => s + p.totalComentarios, 0))
const cifras = computed(() => [
  { t: 'Publicaciones', v: total.value, icono: 'i-lucide-messages-square' },
  { t: 'Fotos', v: totalFotos.value, icono: 'i-lucide-images' },
  { t: 'Comentarios', v: totalComentarios.value, icono: 'i-lucide-message-circle' },
])

async function cargarMas() {
  cargandoMas.value = true
  try {
    const r = await $fetch<Pagina>('/api/publico/jornadas/muro', { query: { antesDe: publicaciones.value.at(-1)?.id } })
    publicaciones.value.push(...r.publicaciones.filter(p => !publicaciones.value.some(x => x.id === p.id)))
    hayMas.value = r.hayMas
  }
  finally {
    cargandoMas.value = false
  }
}

// Cada 30 s: publicaciones nuevas, "me gusta" y comentarios recientes
useIntervalFn(async () => {
  if (document.visibilityState !== 'visible') return
  const r = await $fetch<Pagina>('/api/publico/jornadas/muro').catch(() => null)
  if (!r) return
  total.value = r.total
  totalFotos.value = r.totalFotos
  const conocidas = new Set([...publicaciones.value, ...nuevas.value].map(p => p.id))
  const frescas = r.publicaciones.filter(p => !conocidas.has(p.id))
  if (!publicaciones.value.length) publicaciones.value = frescas
  else if (frescas.length) nuevas.value = [...frescas, ...nuevas.value]
  const porId = new Map(r.publicaciones.map(p => [p.id, p]))
  for (const p of publicaciones.value) {
    const x = porId.get(p.id)
    if (!x) continue
    p.meGusta = Math.max(p.meGusta, x.meGusta)
    p.destacada = x.destacada
    if (x.totalComentarios > p.totalComentarios) {
      const ids = new Set(p.comentarios.map(c => c.id))
      p.comentarios.push(...x.comentarios.filter(c => !ids.has(c.id)))
      p.totalComentarios = x.totalComentarios
    }
  }
}, 30_000)

function mostrarNuevas() {
  publicaciones.value = [...nuevas.value, ...publicaciones.value]
  nuevas.value = []
  document.getElementById('publicar')?.scrollIntoView({ behavior: 'smooth' })
}

// -- Boleto y nombre recordado --------------------------------------------------
const boleto = ref('')
async function pedirBoleto() {
  boleto.value = (await $fetch<{ boleto: string }>('/api/publico/jornadas/muro/boleto').catch(() => ({ boleto: '' }))).boleto
}
const autor = ref('')
const CLAVE_NOMBRE = 'muro-jornadas-nombre'
const CLAVE_GUSTADAS = 'muro-jornadas-megusta'
const gustadas = ref(new Set<string>())
const reportados = ref(new Set<string>())
onMounted(() => {
  pedirBoleto()
  try {
    autor.value = localStorage.getItem(CLAVE_NOMBRE) ?? ''
    gustadas.value = new Set(JSON.parse(localStorage.getItem(CLAVE_GUSTADAS) ?? '[]'))
  }
  catch { /* sin almacenamiento local */ }
})
watch(autor, (v) => {
  try { localStorage.setItem(CLAVE_NOMBRE, v.trim()) }
  catch { /* sin almacenamiento local */ }
})

/** Si el boleto caducó (400), pide otro y reintenta una vez. */
async function conBoleto<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  }
  catch (e) {
    if ((e as { statusCode?: number }).statusCode !== 400 || !/caduc/i.test(errorDeApi(e).mensaje)) throw e
    await pedirBoleto()
    return fn()
  }
}

// -- Me gusta, comentarios, reportes -----------------------------------------
const latiendo = ref<string | null>(null)
async function gustar(p: PublicacionDto) {
  latiendo.value = p.id
  setTimeout(() => { if (latiendo.value === p.id) latiendo.value = null }, 600)
  if (gustadas.value.has(p.id)) return
  gustadas.value = new Set([...gustadas.value, p.id])
  p.meGusta++
  try { localStorage.setItem(CLAVE_GUSTADAS, JSON.stringify([...gustadas.value].slice(-500))) }
  catch { /* sin almacenamiento local */ }
  const r = await $fetch<{ meGusta: number }>(`/api/publico/jornadas/muro/${p.id}/me-gusta`, { method: 'POST' }).catch(() => null)
  if (r) p.meGusta = Math.max(p.meGusta, r.meGusta)
}

const borradores = reactive<Record<string, string>>({})
const comentando = ref<string | null>(null)
function enfocarComentario(id: string) {
  document.getElementById(`comentario-${id}`)?.focus()
}
async function verComentarios(p: PublicacionDto) {
  const todos = await $fetch<ComentarioDto[]>(`/api/publico/jornadas/muro/${p.id}/comentarios`).catch(() => null)
  if (todos) {
    p.comentarios = todos
    p.totalComentarios = todos.length
  }
}
async function comentar(p: PublicacionDto) {
  const texto = borradores[p.id]?.trim()
  if (!texto) return
  const motivo = textoNoPermitido(texto)
  if (motivo) {
    toast.add({ title: motivo, color: 'warning' })
    return
  }
  comentando.value = p.id
  try {
    const c = await conBoleto(() => $fetch<ComentarioDto>(`/api/publico/jornadas/muro/${p.id}/comentarios`, { method: 'POST', body: { boleto: boleto.value, autor: autor.value, texto, sitio: sitio.value } }))
    p.comentarios.push(c)
    p.totalComentarios++
    borradores[p.id] = ''
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error' })
  }
  finally {
    comentando.value = null
  }
}
async function reportar(c: ComentarioDto) {
  reportados.value = new Set([...reportados.value, c.id])
  await $fetch(`/api/publico/jornadas/muro/comentarios/${c.id}/reportar`, { method: 'POST' }).catch(() => {})
  toast.add({ title: 'Gracias, lo revisaremos', color: 'neutral' })
}

async function compartir(p: PublicacionDto) {
  const url = `${location.origin}/jornadas-2026/muro`
  const texto = `${p.mensaje ? `${p.mensaje.slice(0, 120)} ` : ''}${HASHTAG_JORNADAS}`
  if (navigator.share) {
    await navigator.share({ title: titulo, text: texto, url }).catch(() => {})
    return
  }
  await navigator.clipboard.writeText(`${texto} ${url}`)
  toast.add({ title: 'Enlace copiado', color: 'success' })
}

const hashtagCopiado = ref(false)
async function copiarHashtag() {
  await navigator.clipboard?.writeText(HASHTAG_JORNADAS).catch(() => {})
  hashtagCopiado.value = true
  setTimeout(() => (hashtagCopiado.value = false), 1800)
}

// -- Visor --------------------------------------------------------------------
const visor = ref<{ pub: PublicacionDto, i: number } | null>(null)
const abrir = (pub: PublicacionDto, i: number) => { visor.value = { pub, i } }
function teclas(e: KeyboardEvent) {
  const v = visor.value
  if (!v) return
  if (e.key === 'Escape') visor.value = null
  else if (e.key === 'ArrowRight' && v.i < v.pub.fotos.length - 1) v.i++
  else if (e.key === 'ArrowLeft' && v.i > 0) v.i--
}
watch(visor, (v) => { document.documentElement.style.overflow = v ? 'hidden' : '' })
onMounted(() => window.addEventListener('keydown', teclas))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', teclas)
  document.documentElement.style.overflow = ''
})

// -- Publicar -----------------------------------------------------------------
interface Item {
  clave: string
  archivo: File
  vista: string | null
  foto?: Blob
  miniatura?: Blob
  estado: 'preparando' | 'lista' | 'enviando' | 'listo' | 'error'
  error?: string
}
const caja = useTemplateRef<HTMLTextAreaElement>('caja')
const items = ref<Item[]>([])
const mensaje = ref('')
const sitio = ref('')
const autorizo = ref(false)
const enviando = ref(false)
const progreso = ref(0)
const publicado = ref(false)
const error = ref('')

function irAPublicar() {
  document.getElementById('publicar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setTimeout(() => caja.value?.focus(), 400)
}

/** Redibuja la imagen en un lienzo: la reduce y la convierte en un JPEG nuevo, sin metadatos. */
async function reducir(origen: ImageBitmap | HTMLImageElement, lado: number, calidad: number): Promise<Blob> {
  const w = 'naturalWidth' in origen ? origen.naturalWidth : origen.width
  const hh = 'naturalHeight' in origen ? origen.naturalHeight : origen.height
  const escala = Math.min(1, lado / Math.max(w, hh))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(w * escala)
  lienzo.height = Math.round(hh * escala)
  const ctx = lienzo.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(origen, 0, 0, lienzo.width, lienzo.height)
  return new Promise((ok, mal) => lienzo.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo procesar'))), 'image/jpeg', calidad))
}

async function decodificar(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(archivo, { imageOrientation: 'from-image' }) }
    catch { /* se intenta con <img> */ }
  }
  return new Promise((ok, mal) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = () => mal(new Error('Formato no compatible'))
    img.src = URL.createObjectURL(archivo)
  })
}

async function preparar(it: Item) {
  try {
    const img = await decodificar(it.archivo)
    it.foto = await reducir(img, LADO_FOTO, 0.85)
    it.miniatura = await reducir(img, LADO_MINIATURA, 0.8)
    if ('close' in img) img.close()
    it.vista = URL.createObjectURL(it.miniatura)
    it.estado = 'lista'
  }
  catch {
    it.estado = 'error'
    it.error = 'No se pudo leer'
  }
}

function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  error.value = ''
  const archivos = [...(input.files ?? [])].filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
  const cupo = FOTOS_POR_PUBLICACION - items.value.length
  if (archivos.length > cupo) toast.add({ title: `Máximo ${FOTOS_POR_PUBLICACION} fotos por publicación`, color: 'warning' })
  for (const archivo of archivos.slice(0, Math.max(0, cupo))) {
    const it = reactive<Item>({ clave: `${archivo.name}-${archivo.size}-${Math.random()}`, archivo, vista: null, estado: 'preparando' })
    items.value.push(it)
    preparar(it)
  }
  input.value = ''
}
function quitar(it: Item) {
  if (it.vista) URL.revokeObjectURL(it.vista)
  items.value = items.value.filter(x => x !== it)
}

function formulario(campos: Record<string, string | Blob>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(campos)) {
    if (typeof v === 'string') fd.append(k, v)
    else fd.append(k, v, `${k}.jpg`)
  }
  return fd
}

async function publicar() {
  if (!autorizo.value || enviando.value) return
  const motivo = mensaje.value.trim() ? textoNoPermitido(mensaje.value) : null
  if (motivo) {
    error.value = motivo
    return
  }
  enviando.value = true
  error.value = ''
  progreso.value = 0
  try {
    while (items.value.some(i => i.estado === 'preparando')) await new Promise(r => setTimeout(r, 150))
    const fotos = items.value.filter(i => i.estado === 'lista' && i.foto)
    if (!fotos.length && !mensaje.value.trim()) throw new Error('No pudimos leer las fotos elegidas. Intente con otras.')

    // La publicación se crea con la primera foto; las demás se agregan una por una.
    const [primera, ...resto] = fotos
    if (primera) {
      primera.estado = 'enviando'
      progreso.value = 1
    }
    const datos = JSON.stringify({ boleto: boleto.value, autor: autor.value, mensaje: mensaje.value, autorizo: true, sitio: sitio.value })
    const { id, clave } = await conBoleto(() => $fetch<{ id: string, clave: string }>('/api/publico/jornadas/muro', {
      method: 'POST',
      body: formulario(primera ? { datos, foto: primera.foto!, miniatura: primera.miniatura! } : { datos }),
    }))
    if (primera) primera.estado = 'listo'

    let fallidas = 0
    for (const it of resto) {
      progreso.value++
      it.estado = 'enviando'
      try {
        await $fetch(`/api/publico/jornadas/muro/${id}/fotos`, { method: 'POST', body: formulario({ clave, foto: it.foto!, miniatura: it.miniatura! }) })
        it.estado = 'listo'
      }
      catch (e) {
        it.estado = 'error'
        it.error = errorDeApi(e).mensaje
        fallidas++
      }
    }
    if (fallidas) toast.add({ title: `${fallidas} foto(s) no se pudieron subir`, description: 'El resto de la publicación se envió a revisión.', color: 'warning' })

    items.value.forEach(i => i.vista && URL.revokeObjectURL(i.vista))
    items.value = []
    mensaje.value = ''
    publicado.value = true
  }
  catch (e) {
    error.value = e instanceof Error && !('statusCode' in e) ? e.message : errorDeApi(e).mensaje
    items.value.forEach((i) => { if (i.estado === 'enviando') i.estado = 'lista' })
  }
  finally {
    enviando.value = false
  }
}
onBeforeUnmount(() => items.value.forEach(i => i.vista && URL.revokeObjectURL(i.vista)))
</script>

<style scoped>
.fondo-muro {
  background:
    radial-gradient(ellipse 45% 70% at 90% 30%, rgb(217 106 34 / 0.35), transparent 70%),
    radial-gradient(ellipse 60% 70% at 5% 0%, var(--color-marca-700), transparent 70%),
    linear-gradient(160deg, var(--color-marca-900), var(--color-marca-950));
}
.accion {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.6rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ui-text-muted);
  transition: background-color 0.15s, color 0.15s;
}
.accion:hover { background: var(--ui-bg-elevated); color: var(--ui-text-highlighted); }
.exito { animation: exito 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes exito { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.latido { animation: latido 0.6s ease; }
@keyframes latido { 0% { transform: scale(1); } 30% { transform: scale(1.45); } 60% { transform: scale(0.9); } 100% { transform: scale(1); } }
.pub-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pub-enter-from { opacity: 0; transform: translateY(-16px) scale(0.98); }
.aviso-enter-active, .aviso-leave-active { transition: all 0.3s ease; }
.aviso-enter-from, .aviso-leave-to { opacity: 0; transform: translateY(-10px); }
.visor-enter-active, .visor-leave-active { transition: opacity 0.25s ease; }
.visor-enter-from, .visor-leave-to { opacity: 0; }
.visor-img { animation: aparecer 0.3s ease; }
@keyframes aparecer { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .exito, .latido, .visor-img { animation: none; }
}
</style>
