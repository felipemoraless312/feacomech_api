<!-- Aviso de privacidad integral. El domicilio y el correo salen de Configuración → Institución;
     si faltan, se muestra "[… por confirmar]" para que se note y se completen.
     Al cambiar el contenido, actualizar ACTUALIZADO. -->
<template>
  <div>
    <SitioEncabezado
      antetitulo="Protección de datos"
      titulo="Aviso de privacidad"
      :descripcion="`Cómo ${nombre} trata los datos personales de quienes usan su sitio, su plataforma y los servicios de sus eventos.`"
    >
      <p class="text-sm text-muted">Última actualización: {{ ACTUALIZADO }}</p>
    </SitioEncabezado>

    <UContainer class="grid gap-10 py-12 sm:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_16rem]">
      <!-- Índice -->
      <nav class="hidden lg:block" aria-label="Contenido del aviso">
        <div class="sticky top-24">
          <p class="rotulo">Contenido</p>
          <ol class="mt-4 space-y-0.5 border-l border-default">
            <li v-for="(s, i) in secciones" :key="s.id">
              <a
                :href="`#${s.id}`"
                class="-ml-px flex gap-3 border-l-2 py-1.5 pl-4 text-sm transition-colors"
                :class="activa === s.id ? 'border-acento-500 font-semibold text-marca-800 dark:text-white' : 'border-transparent text-muted hover:border-marca-300 hover:text-highlighted'"
              >
                <span class="w-5 shrink-0 tabular-nums text-dimmed">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.titulo }}
              </a>
            </li>
          </ol>
        </div>
      </nav>

      <!-- Contenido -->
      <article class="min-w-0 max-w-3xl">
        <!-- Resumen -->
        <div class="grid gap-px overflow-hidden rounded-lg bg-[var(--ui-border)] ring-1 ring-default sm:grid-cols-3">
          <div v-for="r in RESUMEN" :key="r.t" class="bg-default p-5">
            <UIcon :name="r.icono" class="size-6 text-marca-600 dark:text-marca-300" />
            <p class="mt-3 font-display font-bold text-highlighted">{{ r.t }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">{{ r.d }}</p>
          </div>
        </div>

        <section v-for="(s, i) in secciones" :id="s.id" :key="s.id" class="seccion scroll-mt-24 border-b border-default py-10 last:border-0">
          <p class="font-display text-sm font-semibold tabular-nums text-acento-600 dark:text-acento-400">{{ String(i + 1).padStart(2, '0') }}</p>
          <h2 class="mt-1 font-display text-2xl font-bold tracking-tight text-highlighted">{{ s.titulo }}</h2>
          <p v-for="(p, k) in s.parrafos" :key="k" class="justificado mt-4 text-[16px] leading-relaxed text-toned">{{ p }}</p>
          <ul v-if="s.lista" class="mt-4 space-y-2.5">
            <li v-for="(l, k) in s.lista" :key="k" class="flex gap-3 text-[16px] leading-relaxed text-toned">
              <span class="mt-2.5 size-1.5 shrink-0 rounded-full bg-acento-500" />
              <span class="justificado"><strong v-if="l.t" class="font-semibold text-highlighted">{{ l.t }}: </strong>{{ l.d }}</span>
            </li>
          </ul>
          <p v-for="(p, k) in s.despues ?? []" :key="`d${k}`" class="justificado mt-4 text-[16px] leading-relaxed text-toned">{{ p }}</p>
        </section>
      </article>

      <!-- Contacto -->
      <aside class="lg:col-start-2 xl:col-start-auto">
        <div class="space-y-4 xl:sticky xl:top-24">
          <div class="rounded-lg bg-marca-900 p-6 text-white shadow-tarjeta">
            <p class="rotulo !text-acento-200">Derechos ARCO</p>
            <p class="mt-3 text-sm leading-relaxed text-white/80">Para acceder, rectificar, cancelar u oponerse al tratamiento de sus datos, o revocar su consentimiento, escriba a:</p>
            <p class="mt-3 break-all font-semibold">{{ correo }}</p>
            <UButton v-if="institucion?.email" :to="`mailto:${institucion.email}?subject=Solicitud%20de%20derechos%20ARCO`" icon="i-lucide-mail" label="Enviar solicitud" size="sm" class="mt-4 bg-white text-marca-900 hover:bg-marca-50" />
          </div>
          <div class="rounded-lg bg-default p-5 text-sm shadow-tarjeta ring-1 ring-default">
            <p class="font-semibold text-highlighted">Responsable</p>
            <p class="mt-1 leading-relaxed text-muted">{{ nombre }}</p>
            <p class="mt-1 leading-relaxed text-muted">{{ domicilio }}</p>
          </div>
        </div>
      </aside>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Aviso de privacidad', robots: 'noindex' })

const ACTUALIZADO = '27 de noviembre de 2026'

const { data: institucion } = await useInstitucion()
const nombre = computed(() => institucion.value?.nombre ?? 'la Federación')
const domicilio = computed(() => [institucion.value?.direccion, institucion.value?.ciudad].filter(Boolean).join(', ') || '[domicilio por confirmar]')
const correo = computed(() => institucion.value?.email || '[correo de privacidad por confirmar]')

const RESUMEN = [
  { icono: 'i-lucide-shield-check', t: 'Sólo lo necesario', d: 'Tratamos los datos que requiere cada servicio y nada más.' },
  { icono: 'i-lucide-ban', t: 'Sin venta de datos', d: 'No vendemos sus datos ni usamos publicidad o rastreo de terceros.' },
  { icono: 'i-lucide-user-check', t: 'Usted decide', d: 'Puede consultar, corregir o retirar sus datos y su consentimiento.' },
]

interface Seccion { id: string, titulo: string, parrafos?: string[], lista?: { t?: string, d: string }[], despues?: string[] }

const secciones = computed<Seccion[]>(() => [
  {
    id: 'responsable',
    titulo: 'Responsable',
    parrafos: [`${nombre.value} (en adelante, “la Federación”), con domicilio en ${domicilio.value}, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás normativa aplicable.`],
  },
  {
    id: 'datos',
    titulo: 'Datos personales que tratamos',
    parrafos: ['Según el servicio que utilice, podemos tratar:'],
    lista: [
      { t: 'Identificación y contacto', d: 'nombre, correo electrónico y teléfono.' },
      { t: 'Datos académicos y profesionales', d: 'cédula profesional y de especialidad, especialidad, subespecialidad, institución de trabajo y cargo institucional.' },
      { t: 'Afiliación', d: 'pertenencia a colegios y asociaciones y su historial de afiliación.' },
      { t: 'Fotografía', d: 'cuando usted decide agregarla a su perfil.' },
      { t: 'Eventos', d: 'en el registro de asistencia de las Jornadas: nombre, correo, teléfono, categoría, procedencia y días de asistencia, para el control de acceso y la emisión de constancias.' },
      { t: 'Muro de las Jornadas', d: 'las fotografías y comentarios que usted publique y, si lo escribe, su nombre como crédito. No se solicita correo ni teléfono, y a las fotografías se les retiran la ubicación y los datos del dispositivo.' },
      { t: 'Datos técnicos', d: 'dirección IP, navegador y registro de accesos, con fines de seguridad. En el muro sólo se conserva una huella cifrada que no permite conocer la dirección IP.' },
    ],
    despues: ['La Federación no solicita datos personales sensibles. Le pedimos no publicar en el muro fotografías de pacientes, expedientes ni documentos con datos personales.'],
  },
  {
    id: 'finalidades',
    titulo: 'Finalidades',
    parrafos: ['Sus datos se usan para:'],
    lista: [
      { d: 'Administrar su cuenta, su afiliación y su pertenencia a colegios y asociaciones.' },
      { d: 'Validar sus datos profesionales.' },
      { d: 'Registrar su asistencia a los eventos y emitir sus constancias.' },
      { d: 'Publicar en el muro y en las redes sociales oficiales de la Federación las fotografías que usted comparta y autorice.' },
      { d: 'Atender los mensajes que nos envía por el formulario de contacto.' },
      { d: 'Comunicarle avisos institucionales y de seguridad de su cuenta.' },
      { d: 'Mantener la seguridad de la plataforma y la bitácora de acciones.' },
    ],
  },
  {
    id: 'directorio',
    titulo: 'Directorio público y publicaciones',
    parrafos: [
      'Su nombre, especialidad y fotografía sólo aparecen en el directorio público si usted lo autoriza expresamente desde su perfil. Puede retirar esa autorización en cualquier momento; el directorio público nunca muestra su correo, teléfono ni número de cédula.',
      'Los nombramientos de la mesa directiva y del consejo consultivo se publican una vez validados por la Federación.',
      'Las publicaciones del muro se revisan antes de mostrarse. Si aparece en una fotografía y desea que se retire, puede solicitarlo por los medios de contacto de este aviso.',
    ],
  },
  {
    id: 'transferencias',
    titulo: 'Transferencias',
    parrafos: [
      'El colegio o asociación al que usted pertenece puede consultar sus datos de afiliación para los fines de esa relación.',
      'La Federación no vende sus datos personales ni los transfiere a terceros sin su consentimiento, salvo en los casos previstos por la ley, como el requerimiento fundado de una autoridad competente.',
    ],
  },
  {
    id: 'arco',
    titulo: 'Derechos ARCO y revocación del consentimiento',
    parrafos: [
      `Usted puede acceder a sus datos, rectificarlos, cancelarlos u oponerse a su tratamiento (derechos ARCO), así como revocar su consentimiento, enviando una solicitud a ${correo.value}.`,
    ],
    lista: [
      { t: 'Su solicitud debe incluir', d: 'su nombre, el derecho que desea ejercer, una descripción clara de los datos de que se trate, un medio para responderle y, en su caso, el documento que acredite su identidad o la de su representante.' },
      { t: 'Plazos', d: 'le responderemos en un máximo de 20 días hábiles a partir de la recepción de su solicitud y, si procede, la haremos efectiva dentro de los 15 días hábiles siguientes a la respuesta, conforme a la ley.' },
    ],
    despues: ['Muchos de sus datos puede consultarlos y corregirlos directamente en “Mi perfil” dentro de la plataforma.'],
  },
  {
    id: 'cookies',
    titulo: 'Cookies y almacenamiento en su navegador',
    parrafos: [
      'La plataforma usa únicamente una cookie técnica para mantener su sesión iniciada y otra para recordar el tema claro u oscuro. En el muro, su navegador guarda localmente el nombre que escribió y las publicaciones que le gustaron, sólo para su comodidad.',
      'No usamos cookies de publicidad ni de rastreo de terceros.',
    ],
  },
  {
    id: 'cambios',
    titulo: 'Cambios a este aviso',
    parrafos: ['Cualquier cambio a este aviso se publicará en esta misma página, con su fecha de actualización.'],
  },
])

// Resalta en el índice la sección visible
const activa = ref('responsable')
let observador: IntersectionObserver | undefined
onMounted(() => {
  observador = new IntersectionObserver((entradas) => {
    const visible = entradas.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (visible) activa.value = visible.target.id
  }, { rootMargin: '-20% 0px -70% 0px' })
  document.querySelectorAll('.seccion').forEach(el => observador!.observe(el))
})
onBeforeUnmount(() => observador?.disconnect())
</script>
