<!-- Administración de la estructura de la Federación (organizacionId null) o de una organización:
     organigrama vigente, nombramientos con historial, periodos y catálogo de órganos y cargos. -->
<template>
  <div v-if="datos" class="space-y-6">
    <UTabs v-model="pestana" :items="pestanas" :content="false" variant="link" :ui="{ list: 'overflow-x-auto' }" />

    <!-- Organigrama -->
    <div v-if="pestana === 'organigrama'" class="space-y-10">
      <EstadoVacio v-if="!datos.organos.length" icono="i-lucide-network" titulo="Aún no hay órganos ni cargos" descripcion="Registre la mesa directiva y sus cargos en la pestaña Órganos y cargos.">
        <UButton label="Configurar cargos" @click="pestana = 'cargos'" />
      </EstadoVacio>
      <section v-for="o in organigramas" :key="o.id" class="space-y-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="font-display text-xl font-semibold text-highlighted">
            {{ o.nombre }}
            <UBadge v-if="!o.activo" label="Inactivo" color="neutral" variant="soft" size="sm" class="ml-1 align-middle" />
          </h3>
          <span v-if="periodoVigente" class="text-sm text-muted">Periodo {{ periodoVigente.nombre }}</span>
        </div>
        <EstructuraOrganigrama :nodos="o.nodos" />
      </section>
    </div>

    <!-- Nombramientos -->
    <div v-else-if="pestana === 'nombramientos'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <USelect v-model="filtroPeriodo" :items="opcionesPeriodo" value-key="value" class="w-48" />
        <USelect v-model="filtroEstado" :items="opcionesEstado" value-key="value" class="w-40" />
        <UButton icon="i-lucide-plus" label="Nuevo nombramiento" class="ml-auto" :disabled="!hayCargos" @click="abrir('nombramiento')" />
      </div>
      <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
        <EstadoVacio v-if="!nombramientos.length" icono="i-lucide-user-round-check" titulo="Sin nombramientos en esta vista" :descripcion="hayCargos ? undefined : 'Primero registre los cargos.'" />
        <ul v-else class="divide-y divide-default">
          <li v-for="n in nombramientos" :key="n.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
            <div class="relative">
              <FotoPerfil :foto-id="n.persona.fotoId" :nombre="n.persona.nombre" tamano="lg" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-highlighted">
                {{ n.persona.nombre }}
              </p>
              <p class="text-sm text-muted">
                {{ cargoDe(n.cargoId) }} · {{ fechaCorta(n.inicio) }} – {{ n.fin ? fechaCorta(n.fin) : 'actual' }}<template v-if="n.periodo">
                  · {{ n.periodo.nombre }}
                </template><template v-if="n.organizacionProcedencia">
                  · {{ n.organizacionProcedencia.siglas || n.organizacionProcedencia.nombre }}
                </template>
              </p>
            </div>
            <UBadge v-if="!n.publicado" label="Sin publicar" color="warning" variant="soft" size="sm" />
            <EstadoPunto :texto="n.vigente ? 'En funciones' : NOMBRE_NOMBRAMIENTO[n.estado]" :tono="n.vigente ? 'exito' : n.estado === 'REVOCADO' ? 'error' : 'neutro'" />
            <UDropdownMenu :items="accionesNombramiento(n)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones" />
            </UDropdownMenu>
          </li>
        </ul>
      </div>
      <input ref="selectorFoto" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="subirFoto">
    </div>

    <!-- Periodos -->
    <div v-else-if="pestana === 'periodos'" class="space-y-4">
      <div class="flex justify-end">
        <UButton icon="i-lucide-plus" label="Nuevo periodo" @click="abrir('periodo')" />
      </div>
      <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
        <EstadoVacio v-if="!datos.periodos.length" icono="i-lucide-calendar-range" titulo="Sin periodos de gestión registrados" />
        <ul v-else class="divide-y divide-default">
          <li v-for="p in datos.periodos" :key="p.id" class="flex items-center gap-4 px-5 py-3.5">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-highlighted">
                {{ p.nombre }}
                <UBadge v-if="p.id === periodoVigente?.id" label="Vigente" color="primary" variant="soft" size="sm" class="ml-1" />
              </p>
              <p class="text-sm text-muted">
                {{ fechaCorta(p.inicio) }} – {{ p.fin ? fechaCorta(p.fin) : 'sin fecha de término' }} · {{ p.nombramientos }} nombramiento(s)
              </p>
            </div>
            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="Editar" @click="abrir('periodo', p)" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Órganos y cargos -->
    <div v-else class="space-y-6">
      <div class="flex justify-end">
        <UButton icon="i-lucide-plus" label="Nuevo órgano" color="neutral" variant="soft" @click="abrir('organo')" />
      </div>
      <GrupoDatos v-for="o in datos.organos" :key="o.id" :titulo="`${o.nombre} · ${NOMBRE_ORGANO[o.tipo]}`">
        <template #acciones>
          <div class="flex gap-1">
            <UButton icon="i-lucide-plus" label="Cargo" size="xs" color="neutral" variant="ghost" @click="abrir('cargo', undefined, o.id)" />
            <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" aria-label="Editar órgano" @click="abrir('organo', o)" />
          </div>
        </template>
        <EstadoVacio v-if="!o.cargos.length" icono="i-lucide-briefcase" titulo="Sin cargos" />
        <div v-for="c in o.cargos" :key="c.id" class="flex items-center gap-3 px-5 py-3">
          <div class="min-w-0 flex-1">
            <p class="text-[15px]" :class="c.activo ? 'text-highlighted' : 'text-dimmed line-through'">
              {{ c.nombre }}
            </p>
            <p class="text-xs text-muted">
              {{ c.superiorId ? `Depende de ${cargoDe(c.superiorId)}` : 'Nivel superior' }} · {{ c.nombramientos }} nombramiento(s)
            </p>
          </div>
          <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" aria-label="Editar cargo" @click="abrir('cargo', c)" />
        </div>
      </GrupoDatos>
    </div>

    <UModal v-model:open="modal.abierto" :title="titulos[modal.tipo]" :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <EstructuraFormNombramiento v-if="modal.tipo === 'nombramiento'" :estructura="datos" :nombramiento="modal.elemento as Nombramiento | undefined" :puede-publicar="puedePublicar" @cerrar="modal.abierto = false" @guardado="alGuardar" />
        <EstructuraFormPeriodo v-else-if="modal.tipo === 'periodo'" :organizacion-id="organizacionId" :periodo="modal.elemento as Periodo | undefined" @cerrar="modal.abierto = false" @guardado="alGuardar" />
        <EstructuraFormOrgano v-else-if="modal.tipo === 'organo'" :organizacion-id="organizacionId" :organo="modal.elemento as Organo | undefined" @cerrar="modal.abierto = false" @guardado="alGuardar" />
        <EstructuraFormCargo v-else :organos="datos.organos" :cargo="modal.elemento as Cargo | undefined" :organo-id="modal.organoId" @cerrar="modal.abierto = false" @guardado="alGuardar" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { armarOrganigrama, estaVigente } from '#shared/estructura'
import { ESTADOS_NOMBRAMIENTO, NOMBRE_NOMBRAMIENTO, NOMBRE_ORGANO } from '#shared/schemas/estructura'
import type { EstructuraDto } from '~~/server/services/estructura'

type Organo = EstructuraDto['organos'][number]
type Cargo = Organo['cargos'][number]
type Periodo = EstructuraDto['periodos'][number]
type Nombramiento = EstructuraDto['nombramientos'][number]

const props = defineProps<{ organizacionId: string | null }>()
const api = useApi()
const toast = useToast()
const { alcance } = usePermisos()
// Sólo con alcance total (la Federación) se publican nombramientos en el portal.
const puedePublicar = computed(() => alcance('estructura.administrar') === 'TOTAL')

const clave = `estructura-${props.organizacionId ?? 'federacion'}`
const { data: datos, refresh } = await useAsyncData(clave, () => api<EstructuraDto>('/api/estructura', { query: { organizacionId: props.organizacionId ?? undefined } }))

const route = useRoute()
const pestanas = [
  { label: 'Organigrama', value: 'organigrama', icon: 'i-lucide-network' },
  { label: 'Nombramientos', value: 'nombramientos', icon: 'i-lucide-user-round-check' },
  { label: 'Periodos', value: 'periodos', icon: 'i-lucide-calendar-range' },
  { label: 'Órganos y cargos', value: 'cargos', icon: 'i-lucide-briefcase' },
]
const pestana = ref(typeof route.query.e === 'string' ? route.query.e : 'organigrama')

const todosCargos = computed(() => datos.value?.organos.flatMap(o => o.cargos) ?? [])
const hayCargos = computed(() => todosCargos.value.length > 0)
const cargoDe = (id: string) => todosCargos.value.find(c => c.id === id)?.nombre ?? '—'
const periodoVigente = computed(() => datos.value?.periodos.find(p => estaVigente({ estado: 'VIGENTE', inicio: p.inicio, fin: p.fin })))

// Organigrama con las personas en funciones (incluye los no publicados, marcados).
// ?organo=CONSEJO_CONSULTIVO (u otro tipo) limita la vista a ese tipo de órgano.
const tipoOrgano = computed(() => (typeof route.query.organo === 'string' ? route.query.organo : null))
const organoDeCargo = (cargoId: string) => datos.value?.organos.find(o => o.cargos.some(c => c.id === cargoId))
const organigramas = computed(() => (datos.value?.organos ?? []).filter(o => o.cargos.length && (!tipoOrgano.value || o.tipo === tipoOrgano.value)).map(o => ({
  ...o,
  nodos: armarOrganigrama(o.cargos.filter(c => c.activo).map(c => ({
    id: c.id,
    nombre: c.nombre,
    orden: c.orden,
    superiorId: c.superiorId,
    personas: (datos.value?.nombramientos ?? []).filter(n => n.cargoId === c.id && n.vigente).map(n => ({
      nombre: n.persona.nombre,
      fotoId: n.persona.fotoId,
      procedencia: n.organizacionProcedencia ? (n.organizacionProcedencia.siglas || n.organizacionProcedencia.nombre) : null,
      sinPublicar: !n.publicado,
    })),
  }))),
})))

// --- Filtros de nombramientos
const TODOS = '__todos__'
const filtroPeriodo = ref(TODOS)
const filtroEstado = ref('VIGENTES')
const opcionesPeriodo = computed(() => [{ label: 'Todos los periodos', value: TODOS }, ...(datos.value?.periodos ?? []).map(p => ({ label: p.nombre, value: p.id }))])
const opcionesEstado = [{ label: 'En funciones', value: 'VIGENTES' }, { label: 'Todos', value: TODOS }, ...ESTADOS_NOMBRAMIENTO.map(e => ({ label: NOMBRE_NOMBRAMIENTO[e], value: e }))]
const nombramientos = computed(() => (datos.value?.nombramientos ?? []).filter(n =>
  (!tipoOrgano.value || organoDeCargo(n.cargoId)?.tipo === tipoOrgano.value)
  && (filtroPeriodo.value === TODOS || n.periodoId === filtroPeriodo.value)
  && (filtroEstado.value === TODOS || (filtroEstado.value === 'VIGENTES' ? n.vigente : n.estado === filtroEstado.value))))

// --- Modales
type TipoModal = 'nombramiento' | 'periodo' | 'organo' | 'cargo'
const titulos: Record<TipoModal, string> = { nombramiento: 'Nombramiento', periodo: 'Periodo de gestión', organo: 'Órgano', cargo: 'Cargo' }
const modal = reactive<{ abierto: boolean, tipo: TipoModal, elemento?: unknown, organoId?: string }>({ abierto: false, tipo: 'nombramiento' })
function abrir(tipo: TipoModal, elemento?: unknown, organoId?: string) {
  Object.assign(modal, { abierto: true, tipo, elemento, organoId })
}
function alGuardar() {
  modal.abierto = false
  toast.add({ title: 'Guardado', color: 'success', icon: 'i-lucide-check' })
  refresh()
}

function accionesNombramiento(n: Nombramiento): DropdownMenuItem[][] {
  return [[
    { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => abrir('nombramiento', n) },
    { label: n.fotoId ? 'Cambiar foto' : 'Subir foto', icon: 'i-lucide-camera', onSelect: () => elegirFoto(n.id) },
  ]]
}

// --- Foto del nombramiento
const selectorFoto = useTemplateRef<HTMLInputElement>('selectorFoto')
const fotoPara = ref('')
function elegirFoto(id: string) {
  fotoPara.value = id
  selectorFoto.value?.click()
}
async function subirFoto(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  input.value = ''
  if (!archivo) return
  const datosForm = new FormData()
  datosForm.append('foto', archivo)
  try {
    await api(`/api/estructura/nombramientos/${fotoPara.value}/foto`, { method: 'POST', body: datosForm })
    toast.add({ title: 'Foto actualizada', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
