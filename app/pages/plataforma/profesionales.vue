<template>
  <PanelPagina id="profesionales" titulo="Profesionales" tamano="xl">
    <template #herramientas>
      <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Nombre, correo o cédula" class="w-full min-w-48 max-w-sm" />
      <USelectMenu v-model="filtroEspecialidad" :items="opcionesEspecialidad" value-key="value" class="w-52 shrink-0" />
      <USelect v-model="filtroValidacion" :items="opcionesValidacion" value-key="value" class="w-44 shrink-0" />
    </template>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio
        v-if="status !== 'pending' && !pagina?.datos.length"
        icono="i-lucide-stethoscope"
        titulo="No hay profesionales en esta vista"
        descripcion="Aparecen aquí quienes han capturado su perfil profesional."
      />
      <ul v-else class="divide-y divide-default">
        <li v-for="p in pagina?.datos" :key="p.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
          <FotoPerfil :foto-id="p.perfil?.fotoId" :nombre="nombreCompleto(p)" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ nombreCompleto(p) }}
            </p>
            <p class="text-sm text-muted">
              {{ [p.perfil?.especialidad?.nombre, p.perfil?.subespecialidad?.nombre].filter(Boolean).join(' · ') || 'Sin especialidad' }}
              <template v-if="p.perfil?.cedulaProfesional">
                · Céd. {{ p.perfil.cedulaProfesional }}
              </template>
            </p>
            <p v-if="p.membresias.length" class="mt-1 flex flex-wrap gap-1">
              <UBadge
                v-for="m in p.membresias"
                :key="m.organizacion.id"
                :label="m.organizacion.siglas || m.organizacion.nombre"
                :color="m.estado === 'ACTIVA' ? 'primary' : 'neutral'"
                variant="soft"
                size="sm"
              />
            </p>
          </div>
          <EstadoPunto v-if="p.perfil" :texto="NOMBRE_VALIDACION[p.perfil.estadoValidacion]" :tono="TONO_VALIDACION[p.perfil.estadoValidacion]" />
          <UButton
            v-if="puede('profesional.validar') && p.perfil?.cedulaProfesional"
            :label="p.perfil.estadoValidacion === 'PENDIENTE' ? 'Validar' : 'Revisar'"
            size="sm"
            :variant="p.perfil.estadoValidacion === 'PENDIENTE' ? 'solid' : 'ghost'"
            :color="p.perfil.estadoValidacion === 'PENDIENTE' ? 'primary' : 'neutral'"
            @click="abrir(p)"
          />
        </li>
      </ul>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>{{ pagina?.total ?? 0 }} profesional(es)</span>
      <UPagination v-if="(pagina?.total ?? 0) > POR_PAGINA" v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <UModal v-model:open="abierto" title="Validar datos profesionales">
      <template #body>
        <div v-if="seleccion" class="space-y-5">
          <p class="font-medium text-highlighted">
            {{ nombreCompleto(seleccion) }}
          </p>
          <GrupoDatos>
            <FilaDato etiqueta="Cédula profesional" :valor="seleccion.perfil?.cedulaProfesional" />
            <FilaDato etiqueta="Especialidad" :valor="seleccion.perfil?.especialidad?.nombre" />
            <FilaDato etiqueta="Subespecialidad" :valor="seleccion.perfil?.subespecialidad?.nombre" />
            <FilaDato etiqueta="Cédula de especialidad" :valor="seleccion.perfil?.cedulaEspecialidad" />
          </GrupoDatos>
          <p class="text-sm text-muted">
            Verifique las cédulas en el
            <a href="https://cedulaprofesional.sep.gob.mx/" target="_blank" rel="noopener" class="text-primary hover:underline">Registro Nacional de Profesionistas (SEP)</a>.
          </p>
          <UTabs v-model="decision" :items="[{ label: 'Validar', value: 'VALIDADO' }, { label: 'Con observaciones', value: 'RECHAZADO' }]" :content="false" />
          <UFormField v-if="decision === 'RECHAZADO'" label="Observación para el profesional" required>
            <UTextarea v-model="motivo" :rows="3" autoresize class="w-full" />
          </UFormField>
          <AlertaError :mensaje="error" />
        </div>
      </template>
      <template #footer>
        <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
        <UButton
          :label="decision === 'VALIDADO' ? 'Marcar como validado' : 'Enviar observación'"
          :color="decision === 'VALIDADO' ? 'primary' : 'error'"
          :loading="enviando"
          :disabled="decision === 'RECHAZADO' && motivo.trim().length < 3"
          @click="validar"
        />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Pagina } from '#shared/schemas/comunes'
import { nombreCompleto } from '#shared/texto'
import type { EspecialidadDto } from '~~/server/services/especialidades'
import type { ProfesionalDto } from '~~/server/services/profesionales'

definePageMeta({ layout: 'plataforma', permiso: 'profesional.ver' })
useSeoMeta({ title: 'Profesionales' })

const api = useApi()
const toast = useToast()
const route = useRoute()
const { puede } = usePermisos()

const TODOS = '__todos__'
const POR_PAGINA = 25
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const filtroEspecialidad = ref(TODOS)
const filtroValidacion = ref(typeof route.query.validacion === 'string' ? route.query.validacion : TODOS)
const numeroPagina = ref(1)
watch([q, filtroEspecialidad, filtroValidacion], () => (numeroPagina.value = 1))

const { data: especialidades } = await useAsyncData('especialidades', () => api<EspecialidadDto[]>('/api/especialidades'), { default: () => [] })
const opcionesEspecialidad = computed(() => [{ label: 'Todas las especialidades', value: TODOS }, ...especialidades.value.map(e => ({ label: e.nombre, value: e.id }))])
const opcionesValidacion = [
  { label: 'Cualquier estado', value: TODOS },
  { label: 'Por validar', value: 'PENDIENTE' },
  { label: 'Validados', value: 'VALIDADO' },
  { label: 'Con observaciones', value: 'RECHAZADO' },
]

const { data: pagina, status, refresh } = await useAsyncData(
  'profesionales',
  () => api<Pagina<ProfesionalDto>>('/api/profesionales', {
    query: {
      q: q.value || undefined,
      especialidadId: filtroEspecialidad.value === TODOS ? undefined : filtroEspecialidad.value,
      estadoValidacion: filtroValidacion.value === TODOS ? undefined : filtroValidacion.value,
      // "Por validar" sólo tiene sentido con cédula capturada.
      conCedula: filtroValidacion.value === 'PENDIENTE' ? 'true' : undefined,
      pagina: numeroPagina.value,
      porPagina: POR_PAGINA,
    },
  }),
  { watch: [q, filtroEspecialidad, filtroValidacion, numeroPagina] },
)

const abierto = ref(false)
const seleccion = ref<ProfesionalDto>()
const decision = ref<'VALIDADO' | 'RECHAZADO'>('VALIDADO')
const motivo = ref('')
function abrir(p: ProfesionalDto) {
  seleccion.value = p
  decision.value = 'VALIDADO'
  motivo.value = p.perfil?.motivoRechazo ?? ''
  abierto.value = true
}

const { enviando, error, enviar } = useEnvio()
async function validar() {
  const cuerpo = decision.value === 'VALIDADO' ? { decision: 'VALIDADO' } : { decision: 'RECHAZADO', motivo: motivo.value }
  const r = await enviar(() => api(`/api/profesionales/${seleccion.value!.id}/validar`, { method: 'POST', body: cuerpo }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Validación registrada', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}
</script>
