<!-- Muro de las Jornadas 2026: espacio donde los asistentes publican fotos del evento, dan
     "me gusta" y comentan. Las fotos se reducen y limpian en el teléfono, el servidor las
     reconstruye sin metadatos y el personal revisa cada publicación antes de mostrarla. -->
<template>
  <div>
    <SitioEncabezado
      antetitulo="Jornadas 2026"
      titulo="Muro de las Jornadas"
      :descripcion="`Fotografías y comentarios de los asistentes a las ${J.edicion} Jornadas Académicas FEACOMECH. Las publicaciones se revisan antes de aparecer y pueden difundirse en las redes sociales de la Federación.`"
    >
      <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
        <UButton icon="i-lucide-square-pen" label="Publicar fotos" size="lg" @click="irAPublicar" />
        <dl class="flex gap-8">
          <div v-for="c in cifras" :key="c.t">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{{ c.t }}</dt>
            <dd class="font-display text-2xl font-bold tabular-nums text-marca-900 dark:text-white">{{ nf(c.v) }}</dd>
          </div>
        </dl>
      </div>
    </SitioEncabezado>

    <UContainer class="grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div class="w-full min-w-0 space-y-6">
        <!-- Publicar -->
        <section id="publicar" class="scroll-mt-24 rounded-xl bg-default shadow-tarjeta ring-1 ring-default">
          <div v-if="publicado" class="flex flex-col items-center px-6 py-10 text-center">
            <UIcon name="i-lucide-circle-check" class="size-10 text-success" />
            <h2 class="mt-3 font-display text-xl font-bold text-highlighted">Publicación recibida</h2>
            <p class="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Gracias por compartir. El equipo de la Federación revisará su publicación y aparecerá en el muro en cuanto sea aprobada.
            </p>
            <UButton class="mt-5" label="Publicar otra" color="neutral" variant="outline" @click="publicado = false" />
          </div>

          <form v-else @submit.prevent="publicar">
            <div class="border-b border-default px-5 py-4">
              <p class="rotulo">Nueva publicación</p>
            </div>
            <div class="space-y-4 p-5">
              <div class="grid gap-4 md:grid-cols-[1fr_1.7fr]">
                <UFormField label="Nombre" hint="Opcional" help="Aparecerá como crédito de la fotografía.">
                  <UInput v-model="autor" maxlength="60" placeholder="Ej. Dra. Ana López Pérez" :disabled="enviando" class="w-full" />
                </UFormField>
                <UFormField label="Mensaje" hint="Opcional">
                  <UTextarea v-model="mensaje" :rows="3" autoresize maxlength="500" placeholder="Describa el momento: ponencia, taller, sede…" :disabled="enviando" class="w-full" />
                </UFormField>
              </div>

              <!-- Fotos elegidas -->
              <div v-if="items.length" class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                <div v-for="it in items" :key="it.clave" class="relative aspect-square overflow-hidden rounded-md bg-muted ring-1 ring-default">
                  <img v-if="it.vista" :src="it.vista" alt="" class="size-full object-cover">
                  <div v-else class="flex size-full items-center justify-center"><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-dimmed" /></div>
                  <div v-if="it.estado === 'enviando'" class="absolute inset-0 flex items-center justify-center bg-marca-950/50"><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-white" /></div>
                  <div v-else-if="it.estado === 'listo'" class="absolute inset-0 flex items-center justify-center bg-marca-900/55"><UIcon name="i-lucide-check" class="size-6 text-white" /></div>
                  <div v-else-if="it.estado === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-error/80 p-1 text-center text-[10px] font-medium leading-tight text-white">
                    <UIcon name="i-lucide-triangle-alert" class="size-4" />{{ it.error }}
                  </div>
                  <button v-if="!enviando" type="button" class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Quitar foto" @click="quitar(it)">
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </button>
                </div>
              </div>

              <label
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-accented px-4 py-3 text-sm transition-colors hover:border-marca-400 hover:bg-marca-50/60 dark:hover:bg-white/5"
                :class="{ 'pointer-events-none opacity-50': enviando || items.length >= FOTOS_POR_PUBLICACION }"
              >
                <input ref="selector" type="file" accept="image/*" multiple class="sr-only" :disabled="enviando || items.length >= FOTOS_POR_PUBLICACION" @change="elegir">
                <UIcon name="i-lucide-image-plus" class="size-5 text-marca-600 dark:text-marca-300" />
                <span class="font-medium text-highlighted">Agregar fotografías</span>
                <span class="ml-auto text-xs text-dimmed">{{ items.length }} de {{ FOTOS_POR_PUBLICACION }}</span>
              </label>

              <!-- Campo trampa para robots: no lo ven las personas -->
              <div class="hidden" aria-hidden="true">
                <label>Sitio web <input v-model="sitio" type="text" tabindex="-1" autocomplete="off"></label>
              </div>

              <UCheckbox v-model="autorizo" :disabled="enviando" :ui="{ label: 'text-xs font-normal leading-relaxed text-muted' }">
                <template #label>
                  Autorizo a la FEACOMECH a publicar estas fotografías en su sitio web y en sus redes sociales oficiales, y confirmo que las tomé o tengo permiso para compartirlas.
                </template>
              </UCheckbox>
              <AlertaError :mensaje="error" />
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-default px-5 py-3">
              <p class="text-xs text-dimmed">Se revisa antes de publicarse.</p>
              <UButton
                type="submit"
                :loading="enviando"
                :disabled="(!mensaje.trim() && !items.length) || !autorizo"
                :label="enviando && items.length ? `Enviando ${progreso} de ${items.length}…` : 'Enviar publicación'"
                icon="i-lucide-send"
              />
            </div>
          </form>
        </section>

        <!-- Nuevas -->
        <div v-if="nuevas.length" class="sticky top-20 z-10 flex justify-center">
          <UButton icon="i-lucide-arrow-up" :label="`${nuevas.length} ${nuevas.length === 1 ? 'publicación nueva' : 'publicaciones nuevas'}`" size="sm" class="shadow-flotante" @click="mostrarNuevas" />
        </div>

        <!-- Publicaciones -->
        <EstadoVacio
          v-if="!publicaciones.length"
          icono="i-lucide-images"
          titulo="Aún no hay publicaciones"
          descripcion="Las fotografías aprobadas de los asistentes aparecerán aquí."
          class="rounded-xl bg-default shadow-tarjeta ring-1 ring-default"
        />
        <article v-for="p in publicaciones" :key="p.id" class="overflow-hidden rounded-xl bg-default shadow-tarjeta ring-1 ring-default">
          <header class="flex items-center gap-3 px-5 pt-4">
            <Avatar :nombre="p.autor" class="size-10 text-sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-highlighted">{{ p.autor || 'Asistente de las Jornadas' }}</p>
              <p class="text-xs text-dimmed">{{ haceCuanto(p.creadoEn) }} · {{ J.sede.nombre }}</p>
            </div>
            <span v-if="p.destacada" class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-acento-700 dark:text-acento-300">
              <UIcon name="i-lucide-star" class="size-3.5" /> Destacada
            </span>
          </header>
          <p v-if="p.mensaje" class="whitespace-pre-line px-5 pt-3 text-[15px] leading-relaxed text-toned [overflow-wrap:anywhere]">{{ p.mensaje }}</p>

          <!-- Fotos -->
          <div v-if="p.fotos.length" class="mt-4 grid gap-0.5" :class="rejilla(p.fotos.length)">
            <button
              v-for="(f, i) in p.fotos.slice(0, 4)"
              :key="f.id"
              type="button"
              class="relative block overflow-hidden bg-muted"
              :class="celda(p.fotos.length, i)"
              :aria-label="`Ver fotografía ${i + 1} de ${p.fotos.length}`"
              @click="abrir(p, i)"
            >
              <img
                :src="mini(f.id)"
                :alt="p.mensaje ?? 'Fotografía de las Jornadas'"
                :width="f.ancho"
                :height="f.alto"
                loading="lazy"
                class="size-full object-cover transition-opacity hover:opacity-90"
                :style="p.fotos.length === 1 ? { aspectRatio: `${f.ancho} / ${f.alto}`, maxHeight: '36rem' } : undefined"
              >
              <span v-if="i === 3 && p.fotos.length > 4" class="absolute inset-0 flex items-center justify-center bg-marca-950/55 font-display text-2xl font-bold text-white">+{{ p.fotos.length - 4 }}</span>
            </button>
          </div>

          <!-- Acciones -->
          <div class="flex items-center gap-1 border-b border-default px-3 py-1.5">
            <button type="button" class="accion" :class="{ 'text-acento-600 dark:text-acento-400': gustadas.has(p.id) }" :aria-pressed="gustadas.has(p.id)" @click="gustar(p)">
              <UIcon name="i-lucide-heart" class="size-[18px]" :class="{ 'fill-current': gustadas.has(p.id) }" />
              <span>Me gusta<template v-if="p.meGusta"> · {{ p.meGusta }}</template></span>
            </button>
            <button type="button" class="accion" @click="enfocarComentario(p.id)">
              <UIcon name="i-lucide-message-square" class="size-[18px]" />
              <span>Comentar<template v-if="p.totalComentarios"> · {{ p.totalComentarios }}</template></span>
            </button>
            <button type="button" class="accion ml-auto" @click="compartir(p)">
              <UIcon name="i-lucide-share-2" class="size-[18px]" />
              <span class="hidden sm:inline">Compartir</span>
            </button>
          </div>

          <!-- Comentarios -->
          <div class="space-y-3 bg-muted/40 px-5 py-4">
            <button v-if="p.totalComentarios > p.comentarios.length" type="button" class="text-sm font-medium text-primary hover:underline" @click="verComentarios(p)">
              Ver {{ p.totalComentarios === 1 ? 'el comentario' : `los ${p.totalComentarios} comentarios` }}
            </button>
            <div v-for="c in p.comentarios" :key="c.id" class="group flex gap-3">
              <Avatar :nombre="c.autor" class="mt-0.5 size-7 text-[11px]" />
              <div class="min-w-0 flex-1">
                <p class="text-sm leading-relaxed [overflow-wrap:anywhere]">
                  <span class="font-semibold text-highlighted">{{ c.autor || 'Asistente' }}</span>
                  <span class="text-toned"> {{ c.texto }}</span>
                </p>
                <div class="mt-0.5 flex gap-3 text-[11px] text-dimmed">
                  <span>{{ haceCuanto(c.creadoEn) }}</span>
                  <button v-if="!reportados.has(c.id)" type="button" class="hover:text-error sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus:opacity-100" @click="reportar(c)">Reportar</button>
                  <span v-else>Reportado</span>
                </div>
              </div>
            </div>

            <form class="flex items-center gap-2" @submit.prevent="comentar(p)">
              <UInput
                :id="`comentario-${p.id}`"
                v-model="borradores[p.id]"
                maxlength="280"
                size="md"
                :placeholder="autor ? `Comentar como ${autor}…` : 'Escriba un comentario…'"
                :disabled="comentando === p.id"
                class="min-w-0 flex-1"
              />
              <UButton type="submit" icon="i-lucide-send-horizontal" color="neutral" variant="ghost" :loading="comentando === p.id" :disabled="!borradores[p.id]?.trim()" aria-label="Enviar comentario" />
            </form>
          </div>
        </article>

        <div v-if="hayMas" class="text-center">
          <UButton label="Ver publicaciones anteriores" icon="i-lucide-chevron-down" color="neutral" variant="outline" :loading="cargandoMas" @click="cargarMas" />
        </div>
      </div>

      <!-- Lateral -->
      <aside class="space-y-5 lg:sticky lg:top-20">
        <div class="rounded-xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <p class="rotulo">Difusión</p>
          <p class="justificado mt-3 text-sm leading-relaxed text-muted">
            La Federación puede compartir las publicaciones aprobadas en su página de Facebook y demás redes oficiales, con el crédito de quien tomó la fotografía.
          </p>
          <UButton :to="J.contacto.facebook" target="_blank" icon="i-lucide-facebook" label="facebook.com/feacomech" size="sm" color="neutral" variant="outline" class="mt-4" />
          <p class="mt-4 text-xs text-dimmed">Etiqueta sugerida: <span class="font-medium text-muted">{{ HASHTAG_JORNADAS }}</span></p>
        </div>

        <div class="rounded-xl bg-default p-5 shadow-tarjeta ring-1 ring-default">
          <p class="rotulo">Lineamientos</p>
          <ul class="mt-3 space-y-2.5 text-sm text-muted">
            <li v-for="r in REGLAS" :key="r" class="flex gap-2.5">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-acento-500" /><span>{{ r }}</span>
            </li>
          </ul>
          <p class="justificado mt-4 border-t border-default pt-4 text-xs leading-relaxed text-dimmed">
            No solicitamos correo ni teléfono, y a las fotografías se les retira la ubicación y los datos del dispositivo. Para retirar una foto en la que aparece, escríbanos por
            <a :href="J.contacto.whatsapp" target="_blank" rel="noopener" class="font-medium text-primary hover:underline">WhatsApp</a>.
            Consulte el <NuxtLink to="/aviso-de-privacidad" class="font-medium text-primary hover:underline">aviso de privacidad</NuxtLink>.
          </p>
        </div>

        <NuxtLink to="/jornadas-2026" class="flex items-center gap-2 px-1 text-sm font-medium text-primary hover:underline">
          <UIcon name="i-lucide-arrow-left" class="size-4" /> Volver a las Jornadas 2026
        </NuxtLink>
      </aside>
    </UContainer>

    <!-- Visor de fotos -->
    <Teleport to="body">
      <Transition name="visor">
        <div v-if="visor" class="fixed inset-0 z-[100] flex flex-col bg-marca-950/95 text-white" role="dialog" aria-modal="true" aria-label="Fotografías de la publicación" @click.self="visor = null">
          <div class="flex items-center justify-between gap-3 p-3 sm:p-4">
            <p class="truncate text-sm text-white/70">{{ visor.pub.autor || 'Asistente de las Jornadas' }} · {{ visor.i + 1 }} de {{ visor.pub.fotos.length }}</p>
            <button type="button" class="rounded-full p-2 hover:bg-white/10" aria-label="Cerrar" @click="visor = null"><UIcon name="i-lucide-x" class="size-6" /></button>
          </div>
          <div class="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" @click.self="visor = null">
            <img :key="visor.pub.fotos[visor.i]!.id" :src="grande(visor.pub.fotos[visor.i]!.id)" :alt="visor.pub.mensaje ?? 'Fotografía de las Jornadas'" class="max-h-full max-w-full rounded object-contain">
            <button v-if="visor.i > 0" type="button" class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Anterior" @click="visor.i--"><UIcon name="i-lucide-chevron-left" class="size-6" /></button>
            <button v-if="visor.i < visor.pub.fotos.length - 1" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Siguiente" @click="visor.i++"><UIcon name="i-lucide-chevron-right" class="size-6" /></button>
          </div>
          <div class="flex items-center justify-between gap-4 p-4 sm:px-8">
            <p class="line-clamp-2 min-w-0 text-sm text-white/80">{{ visor.pub.mensaje ?? `${J.edicion} Jornadas Académicas FEACOMECH` }}</p>
            <button type="button" class="inline-flex shrink-0 items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20" :class="{ 'text-acento-300': gustadas.has(visor.pub.id) }" @click="gustar(visor.pub)">
              <UIcon name="i-lucide-heart" class="size-4" :class="{ 'fill-current': gustadas.has(visor.pub.id) }" />
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

// Avatar con iniciales (o ícono si no hay nombre) en el morado institucional
const Avatar = defineComponent({
  props: { nombre: { type: String as PropType<string | null>, default: null } },
  setup(props) {
    return () => {
      const n = props.nombre?.trim() ?? ''
      const iniciales = n.split(/\s+/).filter(w => !/^(dr|dra|lic|mtro|mtra)\.?$/i.test(w)).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
      return h_(
        'span',
        { 'class': 'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-marca-100 font-display font-bold text-marca-800 ring-1 ring-marca-200 dark:bg-marca-900 dark:text-marca-100 dark:ring-white/10', 'aria-hidden': 'true' },
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
async function gustar(p: PublicacionDto) {
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
  setTimeout(() => document.querySelector<HTMLTextAreaElement>('#publicar textarea')?.focus(), 400)
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

/** Rechaza si la promesa tarda más de `ms` (algunos teléfonos se quedan colgados al decodificar). */
function conTiempo<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, mal) => setTimeout(() => mal(new Error('Tardó demasiado')), ms))])
}

async function decodificar(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await conTiempo(createImageBitmap(archivo, { imageOrientation: 'from-image' }), 10_000) }
    catch { /* se intenta con <img> */ }
  }
  return conTiempo(new Promise((ok, mal) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = () => mal(new Error('Formato no compatible'))
    img.src = URL.createObjectURL(archivo)
  }), 20_000)
}

/**
 * Envía con reintentos: en la sede la red es lenta y a veces se corta. Reintenta ante fallas
 * de red y errores del servidor/proxy (5xx), no ante rechazos (4xx), que no cambiarían.
 */
async function enviarConReintentos<T>(fn: () => Promise<T>, intentos = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    }
    catch (e) {
      const estado = (e as { statusCode?: number }).statusCode
      const reintentable = !estado || estado >= 500
      if (!reintentable || i >= intentos) throw e
      await new Promise(r => setTimeout(r, 1500 * i))
    }
  }
}

async function preparar(it: Item) {
  try {
    const img = await decodificar(it.archivo)
    it.foto = await reducir(img, LADO_FOTO, 0.8)
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
    if (!boleto.value) await pedirBoleto()
    const { id, clave } = await conBoleto(() => enviarConReintentos(() => $fetch<{ id: string, clave: string }>('/api/publico/jornadas/muro', {
      method: 'POST',
      body: formulario(primera ? { datos: JSON.stringify({ ...JSON.parse(datos), boleto: boleto.value }), foto: primera.foto!, miniatura: primera.miniatura! } : { datos: JSON.stringify({ ...JSON.parse(datos), boleto: boleto.value }) }),
      timeout: 90_000,
    })))
    if (primera) primera.estado = 'listo'

    let fallidas = 0
    for (const it of resto) {
      progreso.value++
      it.estado = 'enviando'
      try {
        await enviarConReintentos(() => $fetch<{ id: string }>(`/api/publico/jornadas/muro/${id}/fotos` as string, { method: 'POST', body: formulario({ clave, foto: it.foto!, miniatura: it.miniatura! }), timeout: 90_000 }))
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
    const estado = (e as { statusCode?: number }).statusCode
    const deRed = (e as Error)?.name === 'FetchError' && (!estado || estado >= 500)
    error.value = deRed
      ? 'No se pudo conectar: la señal está débil. Revise su conexión e intente de nuevo; sus fotos siguen aquí.'
      : e instanceof Error && !('statusCode' in e) ? e.message : errorDeApi(e).mensaje
    items.value.forEach((i) => { if (i.estado === 'enviando') i.estado = 'lista' })
  }
  finally {
    enviando.value = false
  }
}
onBeforeUnmount(() => items.value.forEach(i => i.vista && URL.revokeObjectURL(i.vista)))
</script>

<style scoped>
.accion {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ui-text-muted);
  transition: background-color 0.15s, color 0.15s;
}
.accion:hover { background: var(--ui-bg-elevated); color: var(--ui-text-highlighted); }
.visor-enter-active, .visor-leave-active { transition: opacity 0.2s ease; }
.visor-enter-from, .visor-leave-to { opacity: 0; }
</style>
