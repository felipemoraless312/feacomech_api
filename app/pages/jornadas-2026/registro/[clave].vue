<!-- Registro en sede e ingreso diario a las Jornadas 2026. Enlace oculto que se reparte por QR
     en el Polyforum: no aparece en menús ni buscadores, y sin la clave correcta responde 404.
     El teléfono guarda un pase para que los días siguientes baste un toque.
     Vista "en vivo": reloj, día del evento, sesión en curso y siguiente (del temario oficial). -->
<template>
  <div class="min-h-svh bg-marca-950 text-white">
    <!-- Fondo animado -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div class="fondo-degradado absolute inset-0" />
      <div class="burbuja b1" />
      <div class="burbuja b2" />
      <div class="burbuja b3" />
      <div class="reticula absolute inset-0" />
    </div>

    <div class="relative mx-auto max-w-lg px-4 pb-10">
      <!-- Encabezado -->
      <header class="entrada pt-6" style="--d: 0ms">
        <div class="flex items-center gap-3">
          <img src="/img/marca/escudo-512.png" alt="" class="h-12 w-auto drop-shadow-lg">
          <div class="min-w-0 flex-1">
            <p class="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-acento-300">{{ J.edicion }} Jornadas Académicas</p>
            <p class="font-display text-sm font-semibold uppercase tracking-[0.12em] text-white/70">FEACOMECH · {{ J.anio }}</p>
          </div>
          <div v-if="reloj" class="text-right">
            <p class="font-display text-2xl font-bold tabular-nums leading-none">{{ reloj }}</p>
            <p class="mt-1 text-[11px] uppercase tracking-wider text-white/50">Tuxtla Gtz.</p>
          </div>
        </div>

        <h1 class="mt-6 font-display text-4xl font-bold uppercase leading-[0.95] tracking-[0.05em]">
          Registro<br><span class="texto-brillo">de asistencia</span>
        </h1>

        <div v-if="estado" class="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span v-if="estado.ingresoAbierto" class="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
            <span class="relative flex size-2"><span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span class="relative inline-flex size-2 rounded-full bg-emerald-400" /></span>
            En vivo · {{ estado.dia?.etiqueta ?? 'Hoy' }}
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white/80 ring-1 ring-white/15">
            <UIcon name="i-lucide-map-pin" class="size-3.5" /> Polyforum Chiapas
          </span>
        </div>

        <!-- Días del evento -->
        <ol v-if="estado" class="mt-5 grid grid-cols-3 gap-2">
          <li
            v-for="(d, i) in estado.dias"
            :key="d.fecha"
            class="dia entrada"
            :class="{ 'dia-hoy': d.fecha === estado.hoy, 'dia-pasado': d.fecha < estado.hoy, 'dia-asistido': asistidos.includes(d.fecha) }"
            :style="{ '--d': `${120 + i * 70}ms` }"
          >
            <span class="text-[11px] font-semibold uppercase tracking-wider opacity-70">Día {{ i + 1 }}</span>
            <span class="font-display text-lg font-bold leading-tight">{{ d.corta }}</span>
            <UIcon v-if="asistidos.includes(d.fecha)" name="i-lucide-circle-check" class="absolute right-2 top-2 size-4 text-emerald-300" />
          </li>
        </ol>
      </header>

      <main class="mt-6">
        <div v-if="cargando" class="flex flex-col items-center gap-3 py-20 text-white/60">
          <span class="cargador" />
          <p class="text-sm">Preparando su registro…</p>
        </div>

        <!-- Clave incorrecta: se presenta como página inexistente -->
        <div v-else-if="!estado" class="tarjeta p-8 text-center">
          <UIcon name="i-lucide-link-2-off" class="mx-auto size-10 text-dimmed" />
          <p class="mt-3 font-display text-lg font-bold text-highlighted">Enlace no válido</p>
          <p class="mt-1 text-sm text-muted">Escanee de nuevo el código QR del módulo de registro.</p>
        </div>

        <template v-else>
          <!-- Cuenta regresiva (antes del evento) -->
          <section v-if="cuenta && vista !== 'listo'" class="entrada mb-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur" style="--d: 300ms">
            <p class="text-center text-xs font-semibold uppercase tracking-[0.2em] text-acento-200">Faltan para la inauguración</p>
            <div class="mt-3 grid grid-cols-4 gap-2 text-center">
              <div v-for="u in cuenta" :key="u.t" class="rounded-xl bg-white/10 py-2.5">
                <p class="font-display text-3xl font-bold tabular-nums">{{ u.v }}</p>
                <p class="text-[10px] font-medium uppercase tracking-wide text-white/60">{{ u.t }}</p>
              </div>
            </div>
            <p class="mt-3 text-center text-sm text-white/70">Puede registrarse desde ahora; su ingreso se marca los días del evento.</p>
          </section>

          <!-- Sesión en curso -->
          <section v-if="programaHoy && vista === 'inicio'" class="entrada mb-4 overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/15 backdrop-blur" style="--d: 300ms">
            <div v-if="sesion.ahora" class="p-4">
              <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-acento-200">
                <UIcon :name="ICONO_TIPO[sesion.ahora.tipo]" class="size-4" /> Ahora · {{ sesion.ahora.inicio }}{{ sesion.ahora.fin ? `–${sesion.ahora.fin}` : '' }}
              </p>
              <p class="mt-1.5 font-display text-lg font-bold leading-snug">{{ sesion.ahora.titulo }}</p>
              <p v-if="sesion.ahora.ponente" class="mt-0.5 text-sm text-white/70">{{ sesion.ahora.ponente }}</p>
              <div v-if="sesion.avance !== null" class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div class="h-full rounded-full bg-gradient-to-r from-acento-400 to-acento-200 transition-[width] duration-1000" :style="{ width: `${sesion.avance}%` }" />
              </div>
            </div>
            <div v-if="sesion.siguiente" class="flex items-start gap-3 p-4" :class="sesion.ahora ? 'border-t border-white/10 bg-black/10' : ''">
              <span class="mt-0.5 rounded-md bg-white/10 px-2 py-1 font-display text-sm font-bold tabular-nums">{{ sesion.siguiente.inicio }}</span>
              <div class="min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{{ sesion.ahora ? 'A continuación' : 'Próxima actividad' }}</p>
                <p class="text-sm font-semibold leading-snug">{{ sesion.siguiente.titulo }}</p>
              </div>
            </div>
            <p v-if="!sesion.ahora && !sesion.siguiente" class="p-4 text-sm text-white/70">Concluyeron las actividades de hoy. ¡Gracias por acompañarnos!</p>
          </section>

          <Transition name="vista" mode="out-in">
            <!-- Resultado -->
            <section v-if="vista === 'listo' && resultado" key="listo" class="space-y-4">
              <div class="relative">
                <div v-if="festejo" class="confeti" aria-hidden="true">
                  <span v-for="p in confeti" :key="p.i" :style="p.estilo" />
                </div>

                <!-- Pase digital -->
                <div class="pase">
                  <div class="relative bg-gradient-to-br from-marca-800 via-marca-700 to-acento-600 px-6 pb-8 pt-7 text-center">
                    <svg class="palomita mx-auto size-20" viewBox="0 0 52 52" aria-hidden="true">
                      <circle cx="26" cy="26" r="24" fill="none" />
                      <path fill="none" :d="resultado.ingresoHoy ? 'M15 27l7 7 15-16' : 'M17 26.5l6 6 12-13'" />
                    </svg>
                    <p class="mt-4 font-display text-2xl font-bold leading-tight">
                      {{ resultado.ingresoHoy ? (resultado.ingresoRepetido ? 'Su ingreso de hoy ya estaba registrado' : '¡Bienvenido(a)!') : '¡Registro completo!' }}
                    </p>
                    <p v-if="resultado.ingresoHoy && diaHoy" class="mt-1 text-sm text-white/80">Ingreso del {{ diaHoy.etiqueta }} de noviembre · {{ hora }}</p>
                    <p v-else-if="!resultado.ingresoHoy" class="mt-1 text-sm text-white/80">Lo esperamos el {{ J.fechas }}</p>
                  </div>
                  <div class="pase-corte" />
                  <div class="bg-default px-6 pb-6 pt-5 text-default">
                    <div class="flex items-center gap-4">
                      <span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-marca-100 font-display text-xl font-bold text-marca-800">{{ iniciales(resultado.nombre) }}</span>
                      <div class="min-w-0">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Asistente</p>
                        <p class="font-display text-xl font-bold leading-tight text-highlighted">{{ resultado.nombre }}</p>
                      </div>
                    </div>

                    <div class="mt-5">
                      <div class="flex items-baseline justify-between text-sm">
                        <p class="font-semibold text-highlighted">Asistencia</p>
                        <p class="text-muted"><strong class="text-highlighted">{{ resultado.diasAsistidos.length }}</strong> de {{ estado.dias.length }} días</p>
                      </div>
                      <ol class="mt-2 grid grid-cols-3 gap-2">
                        <li
                          v-for="(d, i) in estado.dias"
                          :key="d.fecha"
                          class="sello"
                          :class="resultado.diasAsistidos.includes(d.fecha) ? 'sello-si' : 'sello-no'"
                          :style="{ '--d': `${600 + i * 180}ms` }"
                        >
                          <UIcon :name="resultado.diasAsistidos.includes(d.fecha) ? 'i-lucide-badge-check' : 'i-lucide-circle-dashed'" class="mx-auto size-6" />
                          <span class="mt-1 block text-sm font-semibold">{{ d.corta }}</span>
                        </li>
                      </ol>
                    </div>

                    <p v-if="resultado.yaRegistrado && !resultado.ingresoRepetido" class="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted">
                      Este correo ya estaba registrado; no se cambiaron sus datos.
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 rounded-xl bg-white/[0.07] px-4 py-3 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur">
                <UIcon name="i-lucide-smartphone" class="mt-0.5 size-5 shrink-0 text-acento-300" />
                <p>Este teléfono recordará su registro: los demás días sólo escanee el QR y toque un botón. Su constancia saldrá a nombre de <strong class="text-white">{{ resultado.nombre }}</strong>.</p>
              </div>
              <p v-if="!resultado.ingresoHoy" class="text-center text-sm text-white/70">
                El día del evento escanee de nuevo el QR y toque «Registrar mi ingreso de hoy».
              </p>
              <UButton label="Listo" size="xl" block class="justify-center bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" @click="vista = 'inicio'" />
            </section>

            <!-- Inicio -->
            <section v-else-if="vista === 'inicio'" key="inicio" class="space-y-3">
              <div v-if="pase" class="pase entrada" style="--d: 380ms">
                <div class="bg-default p-6 text-default">
                  <div class="flex items-center gap-4">
                    <span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-marca-700 to-acento-500 font-display text-xl font-bold text-white">{{ iniciales(pase.nombre) }}</span>
                    <div class="min-w-0">
                      <p class="text-sm text-muted">{{ saludo }},</p>
                      <p class="font-display text-2xl font-bold leading-tight text-highlighted">{{ pase.nombre }}</p>
                    </div>
                  </div>
                  <template v-if="estado.ingresoAbierto">
                    <UButton
                      v-if="!asistidos.includes(estado.hoy)"
                      label="Registrar mi ingreso de hoy"
                      icon="i-lucide-scan-line"
                      size="xl"
                      block
                      class="boton-principal mt-6 justify-center py-4 text-lg"
                      :loading="enviando"
                      @click="ingresoConPase"
                    />
                    <p v-else class="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                      <UIcon name="i-lucide-circle-check" class="size-5" /> Su ingreso de hoy ya está registrado.
                    </p>
                  </template>
                  <p v-else class="mt-5 rounded-lg bg-muted px-4 py-3 text-sm text-muted">
                    Ya está registrado. Los días del evento toque aquí para marcar su ingreso.
                  </p>
                  <AlertaError :mensaje="error" class="mt-3" />
                  <button type="button" class="mt-4 text-sm text-muted underline" @click="olvidarPase">No soy {{ pase.nombre.split(' ')[0] }}</button>
                </div>
              </div>

              <template v-else>
                <AlertaError :mensaje="error" />
                <button type="button" class="opcion entrada" style="--d: 380ms" @click="abrir('registro')">
                  <span class="opcion-icono bg-gradient-to-br from-acento-400 to-acento-600"><UIcon name="i-lucide-user-plus" class="size-7" /></span>
                  <span class="flex-1">
                    <span class="block font-display text-xl font-bold text-highlighted">Es mi primera vez</span>
                    <span class="block text-sm text-muted">Registrarme {{ estado.ingresoAbierto ? 'y marcar mi ingreso' : 'ahora' }} · 1 minuto</span>
                  </span>
                  <UIcon name="i-lucide-arrow-right" class="opcion-flecha size-5 text-dimmed" />
                </button>
                <button v-if="estado.ingresoAbierto" type="button" class="opcion entrada" style="--d: 460ms" @click="abrir('correo')">
                  <span class="opcion-icono bg-gradient-to-br from-marca-600 to-marca-900"><UIcon name="i-lucide-mail-check" class="size-7" /></span>
                  <span class="flex-1">
                    <span class="block font-display text-xl font-bold text-highlighted">Ya me registré</span>
                    <span class="block text-sm text-muted">Marcar mi ingreso de hoy con mi correo</span>
                  </span>
                  <UIcon name="i-lucide-arrow-right" class="opcion-flecha size-5 text-dimmed" />
                </button>
              </template>
            </section>

            <!-- Formulario de registro en dos pasos -->
            <section v-else-if="vista === 'registro'" key="registro" class="tarjeta p-5">
              <div class="mb-5 flex items-center justify-between">
                <button type="button" class="inline-flex items-center gap-1 text-sm text-muted" @click="paso === 2 ? (paso = 1) : (vista = 'inicio')">
                  <UIcon name="i-lucide-arrow-left" class="size-4" /> Regresar
                </button>
                <p class="text-sm font-semibold text-muted">Paso {{ paso }} de 2</p>
              </div>
              <div class="mb-6 grid grid-cols-2 gap-1.5">
                <span class="h-1.5 rounded-full bg-acento-500" />
                <span class="h-1.5 rounded-full transition-colors duration-500" :class="paso === 2 ? 'bg-acento-500' : 'bg-accented'" />
              </div>

              <UForm ref="form" :schema="registroAsistenteSchema" :state="datos" :validate-on="['blur']" @submit="registrar" @error="alFallar">
                <Transition :name="paso === 2 ? 'avanza' : 'regresa'" mode="out-in">
                  <div v-if="paso === 1" key="p1" class="space-y-4" @keydown.enter.prevent="siguiente">
                    <div>
                      <p class="font-display text-2xl font-bold text-highlighted">Sus datos</p>
                      <p class="text-sm text-muted">Así aparecerán en su constancia.</p>
                    </div>
                    <UFormField label="Nombre completo" name="nombre" required help="Tal como aparece en su INE.">
                      <UInput v-model="datos.nombre" size="xl" autocomplete="name" autocapitalize="words" icon="i-lucide-user" class="w-full" />
                    </UFormField>
                    <UFormField label="Correo electrónico" name="correo" required help="Con él descargará su constancia.">
                      <UInput v-model="datos.correo" size="xl" type="email" inputmode="email" autocomplete="email" autocapitalize="none" icon="i-lucide-at-sign" class="w-full" />
                    </UFormField>
                    <UFormField label="Teléfono celular" name="telefono" hint="Opcional">
                      <UInput v-model="datos.telefono" size="xl" type="tel" inputmode="tel" autocomplete="tel" icon="i-lucide-phone" class="w-full" />
                    </UFormField>
                    <UButton type="button" label="Continuar" trailing-icon="i-lucide-arrow-right" size="xl" block class="boton-principal justify-center py-3.5" @click="siguiente" />
                  </div>

                  <div v-else key="p2" class="space-y-5">
                    <div>
                      <p class="font-display text-2xl font-bold text-highlighted">Su perfil</p>
                      <p class="text-sm text-muted">Hola, {{ datos.nombre.trim().split(/\s+/)[0] }}. Ya casi terminamos.</p>
                    </div>
                    <UFormField label="Usted es" name="categoria" required>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          v-for="c in categorias"
                          :key="c.value"
                          type="button"
                          class="categoria"
                          :class="{ 'categoria-activa': datos.categoria === c.value }"
                          :aria-pressed="datos.categoria === c.value"
                          @click="elegir(c.value)"
                        >
                          <UIcon :name="c.icono" class="size-7" />
                          <span class="text-sm font-semibold leading-tight">{{ c.label }}</span>
                        </button>
                      </div>
                    </UFormField>
                    <UFormField label="Colegio, institución o escuela" name="procedencia" hint="Opcional">
                      <UInput v-model="datos.procedencia" size="xl" list="colegios" icon="i-lucide-building-2" class="w-full" />
                      <datalist id="colegios">
                        <option v-for="c in J.colegios" :key="c" :value="c" />
                      </datalist>
                    </UFormField>
                    <UCheckbox v-model="acepta" required>
                      <template #label>
                        Acepto el <NuxtLink to="/aviso-de-privacidad" target="_blank" class="text-primary underline">aviso de privacidad</NuxtLink>. Mis datos se usan sólo para el control de asistencia y mi constancia.
                      </template>
                    </UCheckbox>
                    <AlertaError :mensaje="error" />
                    <UButton type="submit" :label="estado.ingresoAbierto ? 'Registrarme y marcar ingreso' : 'Registrarme'" icon="i-lucide-check" size="xl" block :disabled="!acepta" :loading="enviando" class="boton-principal justify-center py-3.5" />
                  </div>
                </Transition>
              </UForm>
            </section>

            <!-- Ya registrado: sólo el correo -->
            <section v-else-if="vista === 'correo'" key="correo" class="tarjeta p-5">
              <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-muted" @click="vista = 'inicio'">
                <UIcon name="i-lucide-arrow-left" class="size-4" /> Regresar
              </button>
              <form class="space-y-4" @submit.prevent="ingresoConCorreo">
                <div>
                  <p class="font-display text-2xl font-bold text-highlighted">¡Qué gusto verle de nuevo!</p>
                  <p class="text-sm text-muted">Escriba el correo con el que se registró.</p>
                </div>
                <UFormField label="Correo electrónico" required>
                  <UInput v-model="correo" size="xl" type="email" inputmode="email" autocomplete="email" autocapitalize="none" icon="i-lucide-at-sign" class="w-full" autofocus />
                </UFormField>
                <AlertaError :mensaje="error" />
                <UButton type="submit" label="Registrar mi ingreso de hoy" icon="i-lucide-scan-line" size="xl" block :loading="enviando" class="boton-principal justify-center py-3.5" />
                <p class="text-center text-sm text-muted">
                  ¿No se ha registrado? <button type="button" class="text-primary underline" @click="abrir('registro')">Regístrese aquí</button>
                </p>
              </form>
            </section>
          </Transition>
        </template>

        <p class="mt-8 text-center text-xs text-white/50">
          ¿Problemas? Acuda al módulo de registro o llame al
          <a :href="`tel:+52${J.contacto.telefonoRegistro.replaceAll(' ', '')}`" class="underline">{{ J.contacto.telefonoRegistro }}</a>.
        </p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { PROGRAMA_2026, type Actividad, type TipoActividad } from '#shared/jornadas2026-programa'
import { CATEGORIAS_ASISTENTE, NOMBRE_CATEGORIA, diaDelEvento, registroAsistenteSchema, type CategoriaAsistente, type RegistroAsistenteEntrada } from '#shared/registro-jornadas'
import { ZONA_HORARIA } from '#shared/texto'
import type { ResultadoIngreso } from '~~/server/services/registro-asistentes'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Registro · Jornadas 2026', robots: 'noindex, nofollow, noarchive', themeColor: '#1e1230' })
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })

interface Estado { hoy: string, dia: { fecha: string, etiqueta: string, corta: string } | null, ingresoAbierto: boolean, dias: { fecha: string, etiqueta: string, corta: string }[] }
interface Pase { codigo: string, nombre: string, dias?: string[] }

const ICONO_CATEGORIA: Record<CategoriaAsistente, string> = {
  COLEGIADO: 'i-lucide-stethoscope',
  NO_COLEGIADO: 'i-lucide-hospital',
  ESTUDIANTE: 'i-lucide-graduation-cap',
  OTRO: 'i-lucide-users',
}
const ICONO_TIPO: Record<TipoActividad, string> = {
  ponencia: 'i-lucide-mic',
  registro: 'i-lucide-clipboard-check',
  receso: 'i-lucide-coffee',
  acto: 'i-lucide-award',
  taller: 'i-lucide-flask-conical',
  social: 'i-lucide-sparkles',
}

const route = useRoute()
const base = `/api/publico/jornadas/registro/${encodeURIComponent(String(route.params.clave))}`
const LLAVE_PASE = 'feacomech-jornadas-2026-pase'

const cargando = ref(true)
const estado = ref<Estado | null>(null)
const vista = ref<'inicio' | 'registro' | 'correo' | 'listo'>('inicio')
const paso = ref<1 | 2>(1)
const resultado = ref<ResultadoIngreso | null>(null)
const pase = ref<Pase | null>(null)
const correo = ref('')
const acepta = ref(false)
const festejo = ref(false)
const categorias = CATEGORIAS_ASISTENTE.map(c => ({ value: c, label: NOMBRE_CATEGORIA[c], icono: ICONO_CATEGORIA[c] }))
const datos = reactive<RegistroAsistenteEntrada>({ nombre: '', correo: '', telefono: '', categoria: undefined as unknown as CategoriaAsistente, procedencia: '' })

const form = useTemplateRef<Form<RegistroAsistenteEntrada>>('form')
const { enviando, error, enviar } = useEnvio(form)

const diaHoy = computed(() => (resultado.value?.ingresoHoy ? diaDelEvento(resultado.value.ingresoHoy) ?? { etiqueta: resultado.value.ingresoHoy } : null))
const hora = ref('')
const asistidos = computed(() => resultado.value?.diasAsistidos ?? pase.value?.dias ?? [])

// --- Reloj (sólo en el cliente, para no desajustar la hidratación) ---
const ahora = ref<Date | null>(null)
let temporizador: ReturnType<typeof setInterval> | undefined
const fmtHora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: ZONA_HORARIA })
const reloj = computed(() => (ahora.value ? fmtHora.format(ahora.value) : ''))
const minutosHoy = computed(() => {
  if (!reloj.value) return null
  const [h, m] = reloj.value.split(':').map(Number)
  return h! * 60 + m!
})
const saludo = computed(() => {
  const m = minutosHoy.value ?? 600
  return m < 12 * 60 ? 'Buenos días' : m < 19 * 60 ? 'Buenas tardes' : 'Buenas noches'
})

const cuenta = computed(() => {
  if (!ahora.value) return null
  const ms = new Date(J.inicio).getTime() - ahora.value.getTime()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  const dd = (n: number) => String(n).padStart(2, '0')
  return [
    { v: Math.floor(s / 86400), t: 'días' },
    { v: dd(Math.floor(s / 3600) % 24), t: 'horas' },
    { v: dd(Math.floor(s / 60) % 60), t: 'min' },
    { v: dd(s % 60), t: 'seg' },
  ]
})

// --- Sesión en curso según el temario oficial ---
const programaHoy = computed(() => (estado.value && minutosHoy.value !== null ? PROGRAMA_2026.find(d => d.fecha === estado.value!.hoy) ?? null : null))
const aMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h! * 60 + m!
}
const sesion = computed(() => {
  const vacio = { ahora: null as Actividad | null, siguiente: null as Actividad | null, avance: null as number | null }
  const dia = programaHoy.value
  const m = minutosHoy.value
  if (!dia || m === null) return vacio
  const lista = dia.actividades
  const actual = lista.find(a => a.fin && aMin(a.inicio) <= m && m < aMin(a.fin)) ?? null
  const siguiente = lista.find(a => aMin(a.inicio) > m) ?? null
  const avance = actual?.fin ? Math.round(((m - aMin(actual.inicio)) / (aMin(actual.fin) - aMin(actual.inicio))) * 100) : null
  return { ahora: actual, siguiente, avance }
})

// --- Confeti ---
const COLORES = ['#d96a22', '#eca46d', '#9d7cc2', '#dccfeb', '#34d399', '#fde68a']
const confeti = Array.from({ length: 42 }, (_, i) => ({
  i,
  estilo: {
    left: `${(i * 37) % 100}%`,
    background: COLORES[i % COLORES.length],
    animationDelay: `${(i % 7) * 70}ms`,
    animationDuration: `${1400 + ((i * 53) % 900)}ms`,
    '--x': `${((i * 29) % 120) - 60}px`,
    '--r': `${(i * 47) % 720}deg`,
    width: i % 3 ? '8px' : '6px',
    height: i % 3 ? '14px' : '6px',
    borderRadius: i % 3 ? '2px' : '50%',
  },
}))

const iniciales = (nombre: string) => nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()

onMounted(async () => {
  ahora.value = new Date()
  temporizador = setInterval(() => (ahora.value = new Date()), 1000)
  try {
    pase.value = JSON.parse(localStorage.getItem(LLAVE_PASE) ?? 'null')
  }
  catch { /* almacenamiento no disponible */ }
  try {
    estado.value = await $fetch<Estado>(base)
  }
  catch { /* 404: clave incorrecta */ }
  cargando.value = false
})
onBeforeUnmount(() => clearInterval(temporizador))

function abrir(v: 'registro' | 'correo') {
  error.value = ''
  paso.value = 1
  vista.value = v
}

async function siguiente() {
  // Sólo los campos del paso 1 (el tipo de Nuxt UI no infiere las llaves de un esquema con default).
  const ok = await form.value?.validate({ name: ['nombre', 'correo', 'telefono'] as never, silent: true })
  if (ok !== false) paso.value = 2
}

function elegir(c: CategoriaAsistente) {
  datos.categoria = c
  form.value?.clear('categoria')
}

function alFallar() {
  // El proxy del componente desenvuelve la referencia expuesta; se aceptan ambas formas.
  const e = form.value?.errors as unknown as { name?: string }[] | { value: { name?: string }[] } | undefined
  const errores = (Array.isArray(e) ? e : e?.value) ?? []
  if (errores.some(e => ['nombre', 'correo', 'telefono'].includes(String(e.name)))) paso.value = 1
}

function mostrar(r: ResultadoIngreso) {
  resultado.value = r
  hora.value = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: ZONA_HORARIA }).format(new Date())
  pase.value = { codigo: r.codigo, nombre: r.nombre, dias: r.diasAsistidos }
  try {
    localStorage.setItem(LLAVE_PASE, JSON.stringify(pase.value))
  }
  catch { /* sin almacenamiento: los demás días usará su correo */ }
  vista.value = 'listo'
  window.scrollTo({ top: 0, behavior: 'smooth' })
  festejo.value = false
  requestAnimationFrame(() => (festejo.value = true))
  try {
    navigator.vibrate?.([30, 40, 60])
  }
  catch { /* sin vibración */ }
}

async function registrar() {
  const r = await enviar(() => $fetch<ResultadoIngreso>(base, { method: 'POST', body: datos }))
  if (r.ok) mostrar(r.valor)
  else alFallar()
}

async function ingresoConCorreo() {
  if (!correo.value.trim()) return
  const r = await enviar(() => $fetch<ResultadoIngreso>(`${base}/ingreso`, { method: 'POST', body: { correo: correo.value } }))
  if (r.ok) mostrar(r.valor)
}

async function ingresoConPase() {
  if (!pase.value) return
  const r = await enviar(() => $fetch<ResultadoIngreso>(`${base}/ingreso`, { method: 'POST', body: { codigo: pase.value!.codigo } }))
  if (r.ok) mostrar(r.valor)
  else if ((r.error as { status?: number }).status === 404) olvidarPase()
}

function olvidarPase() {
  pase.value = null
  resultado.value = null
  try {
    localStorage.removeItem(LLAVE_PASE)
  }
  catch { /* nada que borrar */ }
}
</script>

<style scoped>
/* ---------- Fondo ---------- */
.fondo-degradado {
  background: linear-gradient(135deg, #1e1230 0%, #321f46 35%, #402858 60%, #1e1230 100%);
  background-size: 300% 300%;
  animation: deriva 18s ease-in-out infinite;
}
.burbuja {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  opacity: 0.55;
  animation: flota 14s ease-in-out infinite;
}
.b1 { width: 22rem; height: 22rem; top: -6rem; right: -8rem; background: #d96a22; }
.b2 { width: 18rem; height: 18rem; top: 40%; left: -9rem; background: #7d5ba6; animation-delay: -5s; }
.b3 { width: 14rem; height: 14rem; bottom: -4rem; right: -3rem; background: #bd5418; opacity: 0.35; animation-delay: -9s; }
.reticula {
  background-image: radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(to bottom, black, transparent 70%);
}
@keyframes deriva {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes flota {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -25px) scale(1.08); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.texto-brillo {
  background: linear-gradient(90deg, #eca46d, #fae6d4, #d96a22, #eca46d);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: brillo 5s linear infinite;
}
@keyframes brillo { to { background-position: 200% center; } }

/* ---------- Entradas escalonadas ---------- */
.entrada {
  animation: aparece 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes aparece {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* ---------- Días ---------- */
.dia {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0.875rem;
  padding: 0.625rem 0.75rem;
  background: rgb(255 255 255 / 0.06);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
  color: rgb(255 255 255 / 0.75);
}
.dia-pasado { opacity: 0.55; }
.dia-asistido { opacity: 1; box-shadow: inset 0 0 0 1px rgb(52 211 153 / 0.45); }
.dia-hoy {
  opacity: 1;
  color: white;
  background: linear-gradient(135deg, #d96a22, #bd5418);
  box-shadow: 0 10px 30px -10px rgb(217 106 34 / 0.8);
  animation: aparece 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both, latido 2.8s ease-in-out 1s infinite;
  animation-delay: var(--d, 0ms), 1s;
}
@keyframes latido {
  0%, 100% { box-shadow: 0 10px 30px -10px rgb(217 106 34 / 0.8); }
  50% { box-shadow: 0 10px 40px -6px rgb(217 106 34 / 1); }
}

/* ---------- Tarjetas ---------- */
.tarjeta {
  border-radius: 1.25rem;
  background: var(--ui-bg);
  color: var(--ui-text);
  box-shadow: 0 25px 50px -20px rgb(0 0 0 / 0.6);
}
.pase {
  overflow: hidden;
  border-radius: 1.25rem;
  box-shadow: 0 30px 60px -25px rgb(0 0 0 / 0.7);
}
.pase-corte {
  position: relative;
  height: 0;
  border-top: 2px dashed var(--ui-border-accented);
  background: var(--ui-bg);
}
.pase-corte::before,
.pase-corte::after {
  content: '';
  position: absolute;
  top: -12px;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: var(--color-marca-950);
}
.pase-corte::before { left: -12px; }
.pase-corte::after { right: -12px; }

.opcion {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 1rem;
  border-radius: 1.25rem;
  background: var(--ui-bg);
  padding: 1.25rem;
  text-align: left;
  box-shadow: 0 20px 40px -22px rgb(0 0 0 / 0.7);
  transition: transform 0.2s, box-shadow 0.2s;
}
.opcion:hover { transform: translateY(-2px); }
.opcion:active { transform: scale(0.98); box-shadow: 0 0 0 3px var(--color-acento-400); }
.opcion-icono {
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  color: white;
  box-shadow: 0 8px 20px -8px rgb(0 0 0 / 0.5);
}
.opcion-flecha { transition: transform 0.2s; }
.opcion:hover .opcion-flecha { transform: translateX(4px); }

.boton-principal {
  color: white;
  background: linear-gradient(135deg, #e5843f, #d96a22 50%, #bd5418);
  box-shadow: 0 12px 24px -12px rgb(217 106 34 / 0.9);
  transition: transform 0.15s, filter 0.15s;
}
.boton-principal:hover { filter: brightness(1.06); }
.boton-principal:active { transform: scale(0.98); }

/* ---------- Categorías ---------- */
.categoria {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  border-radius: 0.875rem;
  padding: 0.875rem;
  text-align: left;
  color: var(--ui-text-muted);
  box-shadow: inset 0 0 0 1px var(--ui-border-accented);
  transition: all 0.2s;
}
.categoria:active { transform: scale(0.97); }
.categoria-activa {
  color: var(--color-acento-700);
  background: var(--color-acento-50);
  box-shadow: inset 0 0 0 2px var(--color-acento-500);
}

/* ---------- Resultado ---------- */
.palomita circle {
  stroke: rgb(255 255 255 / 0.9);
  stroke-width: 2.5;
  stroke-dasharray: 152;
  stroke-dashoffset: 152;
  animation: traza 0.6s ease-out 0.1s forwards;
}
.palomita path {
  stroke: white;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: traza 0.35s ease-out 0.6s forwards;
}
@keyframes traza { to { stroke-dashoffset: 0; } }

.sello {
  border-radius: 0.75rem;
  padding: 0.75rem 0.5rem;
  text-align: center;
  animation: estampa 0.45s cubic-bezier(0.3, 1.6, 0.5, 1) both;
  animation-delay: var(--d);
}
.sello-si { background: #ecfdf5; color: #065f46; box-shadow: inset 0 0 0 1px #a7f3d0; }
.sello-no { background: var(--ui-bg-muted); color: var(--ui-text-dimmed); }
@keyframes estampa {
  from { opacity: 0; transform: scale(1.6) rotate(-8deg); }
  to { opacity: 1; transform: none; }
}

.confeti {
  pointer-events: none;
  position: absolute;
  inset: -1rem 0 auto;
  height: 0;
  z-index: 10;
}
.confeti span {
  position: absolute;
  top: 0;
  animation: cae ease-in forwards;
}
@keyframes cae {
  0% { opacity: 1; transform: translate(0, -20px) rotate(0); }
  100% { opacity: 0; transform: translate(var(--x), 420px) rotate(var(--r)); }
}

.cargador {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: 3px solid rgb(255 255 255 / 0.15);
  border-top-color: #d96a22;
  animation: gira 0.8s linear infinite;
}
@keyframes gira { to { transform: rotate(360deg); } }

/* ---------- Transiciones entre vistas ---------- */
.vista-enter-active, .vista-leave-active,
.avanza-enter-active, .avanza-leave-active,
.regresa-enter-active, .regresa-leave-active { transition: opacity 0.25s, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.vista-enter-from { opacity: 0; transform: translateY(16px) scale(0.98); }
.vista-leave-to { opacity: 0; transform: translateY(-8px) scale(0.98); }
.avanza-enter-from, .regresa-leave-to { opacity: 0; transform: translateX(24px); }
.avanza-leave-to, .regresa-enter-from { opacity: 0; transform: translateX(-24px); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .confeti { display: none; }
}
</style>
