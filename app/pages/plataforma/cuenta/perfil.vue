<template>
  <PanelPagina id="perfil" titulo="Mi perfil" tamano="md">
    <div v-if="!cuenta" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else class="space-y-10">
      <!-- Encabezado con foto -->
      <section class="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <div class="relative">
          <FotoPerfil :foto-id="cuenta.perfil?.fotoId" :nombre="nombreCompleto(cuenta)" tamano="3xl" class="size-24 text-2xl" />
          <UDropdownMenu :items="opcionesFoto" :content="{ align: 'start' }">
            <UButton icon="i-lucide-camera" size="xs" color="neutral" variant="solid" class="absolute -bottom-1 -right-1 rounded-full ring-2 ring-default" :loading="subiendo" aria-label="Cambiar foto" />
          </UDropdownMenu>
          <input ref="selectorFoto" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="subirFoto">
        </div>
        <div class="min-w-0 space-y-1">
          <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
            {{ nombreCompleto(cuenta) }}
          </h1>
          <p class="text-muted">
            {{ cuenta.email }}
          </p>
          <div class="flex flex-wrap justify-center gap-1.5 pt-1 sm:justify-start">
            <UBadge v-for="r in cuenta.roles" :key="r.clave" :label="r.nombre" color="primary" variant="soft" />
          </div>
        </div>
      </section>

      <UForm ref="form" :schema="perfilSchema" :state="estado" class="space-y-10" @submit="guardar">
        <GrupoDatos titulo="Datos personales">
          <FilaDato etiqueta="Nombre" :valor="nombreCompleto(cuenta)" />
          <FilaDato etiqueta="Correo" :valor="cuenta.email" />
          <div class="px-5 py-4">
            <UFormField label="Teléfono de contacto" name="telefono">
              <UInput v-model="estado.telefono" type="tel" autocomplete="tel" class="w-full sm:max-w-xs" />
            </UFormField>
          </div>
          <p class="px-5 py-3 text-xs text-dimmed">
            Para corregir su nombre o correo, comuníquese con la Federación.
          </p>
        </GrupoDatos>

        <GrupoDatos titulo="Datos profesionales">
          <template #acciones>
            <EstadoPunto v-if="cuenta.perfil?.cedulaProfesional" v-bind="ESTADO_VALIDACION[cuenta.perfil.estadoValidacion]" class="text-xs" />
          </template>
          <div class="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <UFormField label="Cédula profesional" name="cedulaProfesional" help="7 u 8 dígitos (SEP)">
              <UInput v-model="estado.cedulaProfesional" inputmode="numeric" class="w-full" />
            </UFormField>
            <UFormField label="Especialidad" name="especialidadId">
              <USelectMenu
                v-model="especialidad"
                :items="opcionesEspecialidad"
                value-key="value"
                placeholder="Sin especialidad"
                :search-input="{ placeholder: 'Buscar…' }"
                class="w-full"
                
              />
            </UFormField>
            <UFormField label="Subespecialidad" name="subespecialidadId">
              <USelectMenu
                v-model="subespecialidad"
                :items="opcionesSub"
                value-key="value"
                :placeholder="opcionesSub.length ? 'Sin subespecialidad' : 'No hay subespecialidades registradas'"
                :disabled="!opcionesSub.length"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Cédula de especialidad" name="cedulaEspecialidad">
              <UInput v-model="estado.cedulaEspecialidad" inputmode="numeric" class="w-full" />
            </UFormField>
            <UFormField label="Municipio donde ejerce" name="municipioId" class="sm:col-span-2" help="Para el censo médico estatal (sólo se publica de forma agregada).">
              <USelectMenu v-model="municipio" :items="opcionesMunicipio" value-key="value" :search-input="{ placeholder: 'Buscar municipio…' }" placeholder="Elija su municipio" class="w-full" />
            </UFormField>
            <UFormField label="Institución de trabajo" name="institucionTrabajo" class="sm:col-span-2">
              <UInput v-model="estado.institucionTrabajo" placeholder="Opcional" class="w-full" />
            </UFormField>
            <UFormField label="Cargo institucional" name="cargoInstitucional" class="sm:col-span-2" help="Si ocupa un cargo en algún colegio, asociación o en la Federación.">
              <UInput v-model="estado.cargoInstitucional" placeholder="Opcional" class="w-full" />
            </UFormField>
          </div>
          <p v-if="cuenta.perfil?.estadoValidacion === 'RECHAZADO' && cuenta.perfil.motivoRechazo" class="px-5 py-3 text-sm text-error">
            Observación de la Federación: {{ cuenta.perfil.motivoRechazo }}
          </p>
          <p class="px-5 py-3 text-xs text-dimmed">
            Al cambiar cédulas o especialidad, la Federación vuelve a validar sus datos.
          </p>
        </GrupoDatos>

        <GrupoDatos titulo="Privacidad">
          <div class="space-y-5 px-5 py-5">
            <USwitch
              v-model="estado.publicarDirectorio"
              label="Aparecer en el directorio público"
              description="Se publican su nombre, especialidad y foto en el portal. Nunca su correo, teléfono ni cédula."
            />
            <USwitch
              v-model="estado.mostrarInstitucion"
              label="Mostrar mi institución de trabajo"
              description="Visible para otros integrantes de la plataforma y en el directorio, si lo autorizó."
            />
          </div>
          <p v-if="cuenta.perfil?.consentimientoEn && cuenta.perfil.publicarDirectorio" class="px-5 py-3 text-xs text-dimmed">
            Autorización otorgada el {{ formatoFechaHora(cuenta.perfil.consentimientoEn) }}. Puede retirarla en cualquier momento.
          </p>
        </GrupoDatos>

        <div class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <AlertaError :mensaje="error" class="sm:mr-auto" />
          <UButton type="submit" label="Guardar cambios" icon="i-lucide-check" size="lg" :loading="enviando" class="justify-center" />
        </div>
      </UForm>

      <CuentaMembresias />
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { perfilSchema, type PerfilInput } from '#shared/schemas/perfil'
import { formatoFechaHora, nombreCompleto } from '#shared/texto'
import type { MiCuentaDto } from '~~/server/services/perfil'
import type { EspecialidadDto } from '~~/server/services/especialidades'
import type { TonoEstado } from '~/components/EstadoPunto.vue'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Mi perfil' })

const api = useApi()
const toast = useToast()

const ESTADO_VALIDACION: Record<string, { texto: string, tono: TonoEstado }> = {
  PENDIENTE: { texto: 'Pendiente de validación', tono: 'alerta' },
  VALIDADO: { texto: 'Validado por la Federación', tono: 'exito' },
  RECHAZADO: { texto: 'Con observaciones', tono: 'error' },
}

const { data: cuenta } = await useAsyncData('mi-cuenta', () => api<MiCuentaDto>('/api/cuenta'))
const { data: especialidades } = await useAsyncData('especialidades', () => api<EspecialidadDto[]>('/api/especialidades'), { default: () => [] })

const estado = reactive<EstadoFormulario<PerfilInput>>({
  telefono: '',
  cedulaProfesional: '',
  especialidadId: undefined,
  subespecialidadId: undefined,
  cedulaEspecialidad: '',
  municipioId: undefined,
  institucionTrabajo: '',
  mostrarInstitucion: false,
  cargoInstitucional: '',
  publicarDirectorio: false,
})

function cargarEstado(c: MiCuentaDto) {
  const p = c.perfil
  Object.assign(estado, {
    telefono: c.telefono ?? '',
    cedulaProfesional: p?.cedulaProfesional ?? '',
    especialidadId: p?.especialidadId ?? undefined,
    subespecialidadId: p?.subespecialidadId ?? undefined,
    cedulaEspecialidad: p?.cedulaEspecialidad ?? '',
    municipioId: p?.municipioId ?? undefined,
    institucionTrabajo: p?.institucionTrabajo ?? '',
    mostrarInstitucion: p?.mostrarInstitucion ?? false,
    cargoInstitucional: p?.cargoInstitucional ?? '',
    publicarDirectorio: p?.publicarDirectorio ?? false,
  })
}
watch(cuenta, c => c && cargarEstado(c), { immediate: true })

// Los menús no admiten null como valor: NINGUNA representa "sin especialidad".
const NINGUNA = '__ninguna__'
const especialidad = computed({
  get: () => estado.especialidadId ?? NINGUNA,
  set: (v: string) => {
    estado.especialidadId = v === NINGUNA ? undefined : v
    estado.subespecialidadId = undefined
  },
})
const subespecialidad = computed({
  get: () => estado.subespecialidadId ?? NINGUNA,
  set: (v: string) => { estado.subespecialidadId = v === NINGUNA ? undefined : v },
})

const { data: municipios } = await useAsyncData('municipios', () => api<{ id: string, nombre: string, region: { nombre: string } }[]>('/api/catalogos/municipios'), { default: () => [] })
const opcionesMunicipio = computed(() => [{ label: 'Sin indicar', value: NINGUNA }, ...municipios.value.map(m => ({ label: m.nombre, description: m.region.nombre, value: m.id }))])
const municipio = computed({ get: () => estado.municipioId ?? NINGUNA, set: (v: string) => { estado.municipioId = v === NINGUNA ? undefined : v } })

const opcionesEspecialidad = computed(() => [
  { label: 'Sin especialidad', value: NINGUNA },
  ...especialidades.value.map(e => ({ label: e.nombre, value: e.id })),
])
const opcionesSub = computed(() => {
  const subs = especialidades.value.find(e => e.id === estado.especialidadId)?.subespecialidades ?? []
  return subs.length ? [{ label: 'Sin subespecialidad', value: NINGUNA }, ...subs.map(s => ({ label: s.nombre, value: s.id }))] : []
})

const form = useTemplateRef<Form<PerfilInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const r = await enviar(() => api<MiCuentaDto>('/api/cuenta/perfil', { method: 'PUT', body: estado }))
  if (r.ok) {
    cuenta.value = r.valor
    toast.add({ title: 'Perfil actualizado', color: 'success', icon: 'i-lucide-check' })
  }
}

// --- Foto
const selectorFoto = useTemplateRef<HTMLInputElement>('selectorFoto')
const subiendo = ref(false)

const opcionesFoto = computed<DropdownMenuItem[][]>(() => [
  [{ label: cuenta.value?.perfil?.fotoId ? 'Cambiar foto' : 'Subir foto', icon: 'i-lucide-upload', onSelect: () => selectorFoto.value?.click() }],
  ...(cuenta.value?.perfil?.fotoId ? [[{ label: 'Quitar foto', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: quitarFoto }]] : []),
])

async function subirFoto(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  input.value = ''
  if (!archivo) return
  if (archivo.size > 3 * 1024 * 1024) {
    toast.add({ title: 'La foto supera el máximo de 3 MB', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  const datos = new FormData()
  datos.append('foto', archivo)
  subiendo.value = true
  try {
    cuenta.value = await api<MiCuentaDto>('/api/cuenta/foto', { method: 'POST', body: datos })
    toast.add({ title: 'Foto actualizada', color: 'success', icon: 'i-lucide-check' })
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    subiendo.value = false
  }
}

async function quitarFoto() {
  try {
    cuenta.value = await api<MiCuentaDto>('/api/cuenta/foto', { method: 'DELETE' })
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
