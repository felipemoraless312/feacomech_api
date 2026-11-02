<!-- Datos de una organización. Modos:
     crear    – la Federación registra una organización (con su estado de afiliación inicial);
     editar   – la Federación corrige datos directamente;
     proponer – el representante propone cambios, que se aplican al aprobarlos la Federación. -->
<template>
  <UForm ref="form" :schema="esquema" :state="estado" class="space-y-6" @submit="guardar">
    <UAlert v-if="modo === 'proponer'" color="info" variant="subtle" icon="i-lucide-info" title="Los cambios se aplicarán cuando la Federación los apruebe." />

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField v-if="modo !== 'proponer'" label="Tipo" name="tipo" required>
        <USelect v-model="estado.tipo" :items="opcionesTipo" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Siglas" name="siglas">
        <UInput v-model="estado.siglas" class="w-full" />
      </UFormField>
      <UFormField label="Nombre oficial" name="nombre" required class="sm:col-span-2">
        <UInput v-model="estado.nombre" class="w-full" />
      </UFormField>
      <UFormField label="Descripción" name="descripcion" class="sm:col-span-2">
        <UTextarea v-model="estado.descripcion" :rows="3" autoresize class="w-full" />
      </UFormField>
      <UFormField label="Fecha de constitución" name="fechaConstitucion">
        <UInput v-model="estado.fechaConstitucion" type="date" class="w-full" />
      </UFormField>
      <UFormField label="Municipio" name="municipio">
        <UInput v-model="estado.municipio" class="w-full" />
      </UFormField>
      <UFormField label="Dirección" name="direccion" class="sm:col-span-2">
        <UInput v-model="estado.direccion" class="w-full" />
      </UFormField>
      <UFormField label="Teléfono" name="telefono">
        <UInput v-model="estado.telefono" type="tel" class="w-full" />
      </UFormField>
      <UFormField label="Correo" name="email">
        <UInput v-model="estado.email" type="email" class="w-full" />
      </UFormField>
      <UFormField label="Sitio web" name="sitioWeb" class="sm:col-span-2">
        <UInput v-model="estado.sitioWeb" placeholder="https://…" class="w-full" />
      </UFormField>
    </div>

    <template v-if="modo === 'crear'">
      <div class="grid gap-4 rounded-xl bg-muted p-4 sm:grid-cols-2">
        <UFormField label="Estado de afiliación inicial" name="estadoAfiliacion">
          <USelect v-model="estado.estadoAfiliacion" :items="opcionesAfiliacion" value-key="value" class="w-full" />
        </UFormField>
        <UFormField label="Desde" name="afiliadaDesde" help="Vacío = hoy">
          <UInput v-model="estado.afiliadaDesde" type="date" class="w-full" />
        </UFormField>
      </div>
    </template>

    <USwitch v-if="modo !== 'proponer'" v-model="estado.publica" label="Mostrar en el directorio público" description="Sólo aparece si además está afiliada." />

    <AlertaError :mensaje="error" />

    <div class="flex justify-end gap-2">
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cancelar')" />
      <UButton type="submit" :label="ETIQUETA[modo]" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import {
  ESTADOS_AFILIACION, NOMBRE_AFILIACION, NOMBRE_TIPO, TIPOS_ORGANIZACION,
  datosOrganizacionSchema, organizacionCrearSchema, organizacionSchema, type OrganizacionCrearInput,
} from '#shared/schemas/organizacion'

type Datos = Partial<Record<'nombre' | 'siglas' | 'descripcion' | 'municipio' | 'direccion' | 'telefono' | 'email' | 'sitioWeb', string | null>> & {
  id?: string
  tipo?: 'COLEGIO' | 'ASOCIACION'
  publica?: boolean
  fechaConstitucion?: string | Date | null
}

const props = defineProps<{ modo: 'crear' | 'editar' | 'proponer', organizacion?: Datos }>()
const emit = defineEmits<{ cancelar: [], guardado: [] }>()

const api = useApi()
const ETIQUETA = { crear: 'Registrar', editar: 'Guardar cambios', proponer: 'Enviar propuesta' } as const
const esquema = computed(() => ({ crear: organizacionCrearSchema, editar: organizacionSchema, proponer: datosOrganizacionSchema })[props.modo])

const opcionesTipo = TIPOS_ORGANIZACION.map(t => ({ label: NOMBRE_TIPO[t], value: t }))
const opcionesAfiliacion = ESTADOS_AFILIACION.map(e => ({ label: NOMBRE_AFILIACION[e], value: e }))

const o = props.organizacion
const fecha = (v: string | Date | null | undefined) => (v ? new Date(v).toISOString().slice(0, 10) : '')
const estado = reactive<EstadoFormulario<OrganizacionCrearInput>>({
  tipo: o?.tipo ?? 'COLEGIO',
  nombre: o?.nombre ?? '',
  siglas: o?.siglas ?? '',
  descripcion: o?.descripcion ?? '',
  fechaConstitucion: fecha(o?.fechaConstitucion),
  municipio: o?.municipio ?? '',
  direccion: o?.direccion ?? '',
  telefono: o?.telefono ?? '',
  email: o?.email ?? '',
  sitioWeb: o?.sitioWeb ?? '',
  publica: o?.publica ?? true,
  estadoAfiliacion: 'EN_TRAMITE',
  afiliadaDesde: '',
})

const form = useTemplateRef<Form<OrganizacionCrearInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const { estadoAfiliacion: _e, afiliadaDesde: _a, tipo, publica, ...datos } = estado
  const r = await enviar(() => ({
    crear: () => api<unknown>('/api/organizaciones', { method: 'POST', body: estado }),
    editar: () => api<unknown>(`/api/organizaciones/${o!.id}`, { method: 'PUT', body: { ...datos, tipo, publica } }),
    proponer: () => api<unknown>(`/api/organizaciones/${o!.id}/propuesta`, { method: 'POST', body: datos }),
  })[props.modo]())
  if (r.ok) emit('guardado')
}
</script>
