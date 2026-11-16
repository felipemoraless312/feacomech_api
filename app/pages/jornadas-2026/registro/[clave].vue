<!-- Registro en sede e ingreso diario a las Jornadas 2026. Enlace oculto que se reparte por QR
     en el Polyforum: no aparece en menús ni buscadores, y sin la clave correcta responde 404.
     El teléfono guarda un pase para que los días siguientes baste un toque. -->
<template>
  <div class="min-h-svh bg-muted">
    <header class="relative isolate overflow-hidden bg-marca-950 text-white">
      <div class="cartel-fondo absolute inset-0 -z-10" />
      <div class="mx-auto flex max-w-lg items-center gap-3 px-4 py-5">
        <img src="/img/marca/escudo-512.png" alt="" class="h-12 w-auto drop-shadow">
        <div class="min-w-0">
          <p class="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-acento-200">{{ J.edicion }} Jornadas Académicas</p>
          <p class="font-display text-xl font-bold uppercase leading-tight tracking-[0.04em]">Registro de asistencia</p>
          <p v-if="estado" class="text-sm text-white/80">{{ estado.dia ? `${estado.dia.etiqueta} de noviembre · ${J.sede.nombre}` : J.fechas }}</p>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-lg px-4 py-6">
      <div v-if="cargando" class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-dimmed" />
      </div>

      <!-- Clave incorrecta: se presenta como página inexistente -->
      <div v-else-if="!estado" class="rounded-lg bg-default p-8 text-center ring-1 ring-default">
        <UIcon name="i-lucide-link-2-off" class="mx-auto size-10 text-dimmed" />
        <p class="mt-3 font-display text-lg font-bold text-highlighted">Enlace no válido</p>
        <p class="mt-1 text-sm text-muted">Escanee de nuevo el código QR del módulo de registro.</p>
      </div>

      <template v-else>
        <!-- Resultado -->
        <section v-if="vista === 'listo' && resultado" class="space-y-4">
          <div class="rounded-lg bg-default p-6 text-center ring-1 ring-default">
            <span class="mx-auto flex size-16 items-center justify-center rounded-full" :class="resultado.ingresoHoy ? 'bg-emerald-100 text-emerald-600' : 'bg-marca-100 text-marca-700'">
              <UIcon :name="resultado.ingresoHoy ? 'i-lucide-check' : 'i-lucide-user-check'" class="size-9" />
            </span>
            <p class="mt-4 font-display text-2xl font-bold text-highlighted">
              {{ resultado.ingresoHoy ? (resultado.ingresoRepetido ? 'Su ingreso de hoy ya estaba registrado' : '¡Ingreso registrado!') : 'Registro completo' }}
            </p>
            <p class="mt-1 text-lg text-highlighted">{{ resultado.nombre }}</p>
            <p v-if="resultado.ingresoHoy && diaHoy" class="text-sm text-muted">{{ diaHoy.etiqueta }} de noviembre · {{ hora }}</p>
            <p v-else-if="!resultado.ingresoHoy" class="mt-2 text-sm text-muted">
              El día del evento escanee de nuevo el QR y toque «Registrar mi ingreso de hoy».
            </p>

            <!-- Días del evento -->
            <ol class="mt-6 grid grid-cols-3 gap-2">
              <li v-for="d in estado.dias" :key="d.fecha" class="rounded-md px-2 py-3 text-sm" :class="resultado.diasAsistidos.includes(d.fecha) ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-muted text-dimmed'">
                <UIcon :name="resultado.diasAsistidos.includes(d.fecha) ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'" class="mx-auto size-5" />
                <span class="mt-1 block font-semibold">{{ d.corta }}</span>
              </li>
            </ol>
          </div>

          <p v-if="resultado.yaRegistrado && !resultado.ingresoRepetido" class="rounded-md bg-default px-4 py-3 text-sm text-muted ring-1 ring-default">
            Este correo ya estaba registrado; no se cambiaron sus datos.
          </p>
          <div class="flex gap-3 rounded-md bg-acento-50 px-4 py-3 text-sm text-acento-900 ring-1 ring-acento-200">
            <UIcon name="i-lucide-smartphone" class="mt-0.5 size-5 shrink-0" />
            <p>Este teléfono recordará su registro: los demás días sólo escanee el QR y toque un botón. Su constancia saldrá a nombre de <strong>{{ resultado.nombre }}</strong>.</p>
          </div>
          <UButton label="Listo" size="xl" block color="neutral" variant="outline" @click="vista = 'inicio'" />
        </section>

        <!-- Inicio -->
        <section v-else-if="vista === 'inicio'" class="space-y-4">
          <UAlert
            v-if="!estado.ingresoAbierto"
            color="neutral"
            variant="subtle"
            icon="i-lucide-calendar-clock"
            title="Hoy no hay sesiones"
            :description="`Puede registrarse desde ahora; su ingreso se marca los días del evento (${J.fechas}).`"
          />

          <div v-if="pase" class="rounded-lg bg-default p-6 ring-1 ring-default">
            <p class="text-sm text-muted">Hola,</p>
            <p class="font-display text-2xl font-bold text-highlighted">{{ pase.nombre }}</p>
            <UButton
              v-if="estado.ingresoAbierto"
              label="Registrar mi ingreso de hoy"
              icon="i-lucide-log-in"
              size="xl"
              block
              class="mt-5 bg-acento-500 py-4 text-lg hover:bg-acento-600"
              :loading="enviando"
              @click="ingresoConPase"
            />
            <AlertaError :mensaje="error" class="mt-3" />
            <button type="button" class="mt-4 text-sm text-muted underline" @click="olvidarPase">No soy {{ pase.nombre.split(' ')[0] }}</button>
          </div>

          <template v-else>
            <AlertaError :mensaje="error" />
            <button type="button" class="opcion" @click="abrir('registro')">
              <span class="flex size-12 shrink-0 items-center justify-center rounded-md bg-acento-500 text-white"><UIcon name="i-lucide-user-plus" class="size-6" /></span>
              <span class="flex-1">
                <span class="block font-display text-lg font-bold text-highlighted">Es mi primera vez</span>
                <span class="block text-sm text-muted">Registrarme {{ estado.ingresoAbierto ? 'y marcar mi ingreso' : 'ahora' }}</span>
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 text-dimmed" />
            </button>
            <button v-if="estado.ingresoAbierto" type="button" class="opcion" @click="abrir('correo')">
              <span class="flex size-12 shrink-0 items-center justify-center rounded-md bg-marca-800 text-white"><UIcon name="i-lucide-mail-check" class="size-6" /></span>
              <span class="flex-1">
                <span class="block font-display text-lg font-bold text-highlighted">Ya me registré</span>
                <span class="block text-sm text-muted">Marcar mi ingreso de hoy con mi correo</span>
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 text-dimmed" />
            </button>
          </template>
        </section>

        <!-- Formulario de registro -->
        <section v-else-if="vista === 'registro'" class="rounded-lg bg-default p-5 ring-1 ring-default">
          <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-muted" @click="vista = 'inicio'">
            <UIcon name="i-lucide-arrow-left" class="size-4" /> Regresar
          </button>
          <UForm ref="form" :schema="registroAsistenteSchema" :state="datos" class="space-y-4" @submit="registrar">
            <UFormField label="Nombre completo" name="nombre" required help="Tal como aparece en su INE: así saldrá en su constancia.">
              <UInput v-model="datos.nombre" size="xl" autocomplete="name" autocapitalize="words" class="w-full" />
            </UFormField>
            <UFormField label="Correo electrónico" name="correo" required help="Con él descargará su constancia.">
              <UInput v-model="datos.correo" size="xl" type="email" inputmode="email" autocomplete="email" autocapitalize="none" class="w-full" />
            </UFormField>
            <UFormField label="Teléfono celular" name="telefono">
              <UInput v-model="datos.telefono" size="xl" type="tel" inputmode="tel" autocomplete="tel" class="w-full" />
            </UFormField>
            <UFormField label="Usted es" name="categoria" required>
              <URadioGroup v-model="datos.categoria" :items="categorias" variant="card" size="lg" :ui="{ fieldset: 'grid gap-2' }" />
            </UFormField>
            <UFormField label="Colegio, institución o escuela" name="procedencia">
              <UInput v-model="datos.procedencia" size="xl" list="colegios" class="w-full" placeholder="Opcional" />
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
            <UButton type="submit" :label="estado.ingresoAbierto ? 'Registrarme y marcar ingreso' : 'Registrarme'" icon="i-lucide-check" size="xl" block :disabled="!acepta" :loading="enviando" class="bg-acento-500 py-3.5 hover:bg-acento-600" />
          </UForm>
        </section>

        <!-- Ya registrado: sólo el correo -->
        <section v-else-if="vista === 'correo'" class="rounded-lg bg-default p-5 ring-1 ring-default">
          <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-muted" @click="vista = 'inicio'">
            <UIcon name="i-lucide-arrow-left" class="size-4" /> Regresar
          </button>
          <form class="space-y-4" @submit.prevent="ingresoConCorreo">
            <UFormField label="Correo con el que se registró" required>
              <UInput v-model="correo" size="xl" type="email" inputmode="email" autocomplete="email" autocapitalize="none" class="w-full" autofocus />
            </UFormField>
            <AlertaError :mensaje="error" />
            <UButton type="submit" label="Registrar mi ingreso de hoy" icon="i-lucide-log-in" size="xl" block :loading="enviando" class="bg-acento-500 py-3.5 hover:bg-acento-600" />
            <p class="text-center text-sm text-muted">
              ¿No se ha registrado? <button type="button" class="text-primary underline" @click="abrir('registro')">Regístrese aquí</button>
            </p>
          </form>
        </section>
      </template>

      <p class="mt-8 text-center text-xs text-dimmed">¿Problemas? Acuda al módulo de registro o escriba al {{ J.contacto.telefono }}.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { CATEGORIAS_ASISTENTE, NOMBRE_CATEGORIA, diaDelEvento, registroAsistenteSchema, type CategoriaAsistente, type RegistroAsistenteEntrada } from '#shared/registro-jornadas'
import type { ResultadoIngreso } from '~~/server/services/registro-asistentes'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Registro · Jornadas 2026', robots: 'noindex, nofollow, noarchive' })
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })

interface Estado { hoy: string, dia: { fecha: string, etiqueta: string, corta: string } | null, ingresoAbierto: boolean, dias: { fecha: string, etiqueta: string, corta: string }[] }
interface Pase { codigo: string, nombre: string }

const route = useRoute()
const base = `/api/publico/jornadas/registro/${encodeURIComponent(String(route.params.clave))}`
const LLAVE_PASE = 'feacomech-jornadas-2026-pase'

const cargando = ref(true)
const estado = ref<Estado | null>(null)
const vista = ref<'inicio' | 'registro' | 'correo' | 'listo'>('inicio')
const resultado = ref<ResultadoIngreso | null>(null)
const pase = ref<Pase | null>(null)
const correo = ref('')
const acepta = ref(false)
const categorias = CATEGORIAS_ASISTENTE.map(c => ({ value: c, label: NOMBRE_CATEGORIA[c] }))
const datos = reactive<RegistroAsistenteEntrada>({ nombre: '', correo: '', telefono: '', categoria: undefined as unknown as CategoriaAsistente, procedencia: '' })

const form = useTemplateRef<Form<RegistroAsistenteEntrada>>('form')
const { enviando, error, enviar } = useEnvio(form)

const diaHoy = computed(() => (resultado.value?.ingresoHoy ? diaDelEvento(resultado.value.ingresoHoy) ?? { etiqueta: resultado.value.ingresoHoy } : null))
const hora = ref('')

onMounted(async () => {
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

function abrir(v: 'registro' | 'correo') {
  error.value = ''
  vista.value = v
}

function mostrar(r: ResultadoIngreso) {
  resultado.value = r
  hora.value = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' }).format(new Date())
  pase.value = { codigo: r.codigo, nombre: r.nombre }
  try {
    localStorage.setItem(LLAVE_PASE, JSON.stringify(pase.value))
  }
  catch { /* sin almacenamiento: los demás días usará su correo */ }
  vista.value = 'listo'
  window.scrollTo({ top: 0 })
}

async function registrar() {
  const r = await enviar(() => $fetch<ResultadoIngreso>(base, { method: 'POST', body: datos }))
  if (r.ok) mostrar(r.valor)
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
  try {
    localStorage.removeItem(LLAVE_PASE)
  }
  catch { /* nada que borrar */ }
}
</script>

<style scoped>
.cartel-fondo {
  background: linear-gradient(120deg, #1f2a6b 0%, #2b3a8f 35%, #6b4f7a 70%, #d96a22 115%);
}
.opcion {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 1rem;
  border-radius: var(--ui-radius);
  background: var(--ui-bg);
  padding: 1.25rem;
  text-align: left;
  box-shadow: 0 0 0 1px var(--ui-border);
  transition: box-shadow 0.15s;
}
.opcion:active {
  box-shadow: 0 0 0 2px var(--color-acento-500);
}
</style>
