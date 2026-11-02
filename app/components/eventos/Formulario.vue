<!-- Datos generales de un evento (alta y edición) -->
<template>
  <UForm ref="form" :schema="eventoSchema" :state="estado" class="space-y-6" @submit="guardar">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Tipo" name="tipo" required>
        <USelect v-model="estado.tipo" :items="opcionesTipo" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Organiza" name="organizacionId" :help="soloOrganizacion ? 'Sus eventos se publican a nombre de su organización.' : 'Vacío = la Federación'">
        <USelectMenu v-model="organizacion" :items="opcionesOrganizacion" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Título" name="titulo" required class="sm:col-span-2">
        <UInput v-model="estado.titulo" size="xl" class="w-full" />
      </UFormField>
      <UFormField label="Descripción" name="descripcion" required class="sm:col-span-2" help="Separe los párrafos con una línea en blanco.">
        <UTextarea v-model="estado.descripcion" :rows="6" autoresize class="w-full" />
      </UFormField>
      <UFormField label="Inicio" name="inicio" required help="Hora de Chiapas">
        <UInput v-model="estado.inicio" type="datetime-local" class="w-full" />
      </UFormField>
      <UFormField label="Fin" name="fin" required>
        <UInput v-model="estado.fin" type="datetime-local" class="w-full" />
      </UFormField>
      <UFormField label="Modalidad" name="modalidad" required>
        <USelect v-model="estado.modalidad" :items="opcionesModalidad" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Cupo" name="capacidad" help="Vacío = sin límite. Al llenarse, las inscripciones pasan a lista de espera.">
        <UInputNumber v-model="capacidad" :min="1" :max="100000" placeholder="Sin límite" class="w-full" />
      </UFormField>
      <template v-if="estado.modalidad !== 'VIRTUAL'">
        <UFormField label="Sede" name="sede" required>
          <UInput v-model="estado.sede" placeholder="Hotel, auditorio, hospital…" class="w-full" />
        </UFormField>
        <UFormField label="Dirección" name="direccion">
          <UInput v-model="estado.direccion" class="w-full" />
        </UFormField>
      </template>
      <UFormField v-if="estado.modalidad !== 'PRESENCIAL'" label="Enlace de la sesión virtual" name="enlaceVirtual" class="sm:col-span-2" help="Sólo lo ven los inscritos confirmados.">
        <UInput v-model="estado.enlaceVirtual" placeholder="https://…" class="w-full" />
      </UFormField>
      <UFormField label="Organizador (texto)" name="organizador" help="Ej.: Comité académico">
        <UInput v-model="estado.organizador" class="w-full" />
      </UFormField>
      <UFormField label="Valor curricular" name="valorCurricular" help="Ej.: 20 horas, 4 puntos">
        <UInput v-model="estado.valorCurricular" class="w-full" />
      </UFormField>
      <UFormField label="Requisitos de inscripción" name="requisitos" class="sm:col-span-2">
        <UTextarea v-model="estado.requisitos" :rows="2" autoresize class="w-full" />
      </UFormField>
    </div>
    <USwitch v-model="estado.inscripcionAbierta" label="Inscripción abierta" />
    <AlertaError :mensaje="error" />
    <div class="flex justify-end gap-2">
      <UButton v-if="cancelable" label="Cancelar" color="neutral" variant="ghost" @click="emit('cancelar')" />
      <UButton type="submit" :label="evento ? 'Guardar cambios' : 'Crear evento'" icon="i-lucide-check" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { MODALIDADES, NOMBRE_MODALIDAD, NOMBRE_TIPO_EVENTO, TIPOS_EVENTO, eventoSchema, type EventoInput } from '#shared/schemas/eventos'
import type { EventoGestion } from '~~/server/services/eventos'

const props = defineProps<{ evento?: EventoGestion, cancelable?: boolean }>()
const emit = defineEmits<{ cancelar: [], guardado: [id: string] }>()
const api = useApi()
const { alcance, acceso } = usePermisos()
const soloOrganizacion = computed(() => alcance('evento.gestionar') === 'ORGANIZACION')

const opcionesTipo = TIPOS_EVENTO.map(t => ({ label: NOMBRE_TIPO_EVENTO[t], value: t }))
const opcionesModalidad = MODALIDADES.map(m => ({ label: NOMBRE_MODALIDAD[m], value: m }))

/** Instante → "2026-11-20T09:00" en hora de Chiapas (UTC−6). */
const local = (v?: string | Date | null) => (v ? new Date(new Date(v).getTime() - 6 * 3_600_000).toISOString().slice(0, 16) : '')

const e = props.evento
const estado = reactive<EstadoFormulario<EventoInput>>({
  tipo: e?.tipo ?? 'CURSO',
  titulo: e?.titulo ?? '',
  descripcion: e?.descripcion ?? '',
  inicio: local(e?.inicio),
  fin: local(e?.fin),
  modalidad: e?.modalidad ?? 'PRESENCIAL',
  sede: e?.sede ?? '',
  direccion: e?.direccion ?? '',
  enlaceVirtual: e?.enlaceVirtual ?? '',
  organizacionId: e?.organizacionId ?? undefined,
  organizador: e?.organizador ?? '',
  capacidad: e?.capacidad ?? undefined,
  requisitos: e?.requisitos ?? '',
  valorCurricular: e?.valorCurricular ?? '',
  inscripcionAbierta: e?.inscripcionAbierta ?? true,
})
const capacidad = computed({ get: () => estado.capacidad ?? undefined, set: (v: number | undefined | null) => { estado.capacidad = v ?? undefined } })

const { data: organizaciones } = await useAsyncData('organizaciones-disponibles', () => api<{ id: string, nombre: string }[]>('/api/organizaciones/disponibles'), { default: () => [] })
const NINGUNA = '__federacion__'
const opcionesOrganizacion = computed(() => {
  const propias = soloOrganizacion.value ? acceso.value?.organizaciones['evento.gestionar'] ?? [] : null
  const lista = organizaciones.value.filter(o => !propias || propias.includes(o.id)).map(o => ({ label: o.nombre, value: o.id }))
  return soloOrganizacion.value ? lista : [{ label: 'La Federación', value: NINGUNA }, ...lista]
})
const organizacion = computed({
  get: () => estado.organizacionId ?? (soloOrganizacion.value ? undefined : NINGUNA),
  set: (v: string | undefined) => { estado.organizacionId = !v || v === NINGUNA ? undefined : v },
})
if (soloOrganizacion.value && !estado.organizacionId) estado.organizacionId = acceso.value?.organizaciones['evento.gestionar']?.[0]

const form = useTemplateRef<Form<EventoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => e
    ? api<{ id?: string }>(`/api/eventos/gestion/${e.id}`, { method: 'PUT', body: estado })
    : api<{ id: string }>('/api/eventos/gestion', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado', e?.id ?? r.valor.id!)
}
</script>
