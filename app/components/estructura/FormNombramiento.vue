<template>
  <UForm ref="form" :schema="nombramientoSchema" :state="estado" class="space-y-5" @submit="guardar">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Cargo" name="cargoId" required>
        <USelect v-model="estado.cargoId" :items="opcionesCargo" value-key="value" placeholder="Elija el cargo" class="w-full" />
      </UFormField>
      <UFormField label="Periodo" name="periodoId">
        <USelect v-model="periodo" :items="opcionesPeriodo" value-key="value" class="w-full" />
      </UFormField>
    </div>

    <div class="space-y-3 rounded-xl bg-muted p-4">
      <UTabs v-model="modoPersona" :items="[{ label: 'Usuario de la plataforma', value: 'usuario' }, { label: 'Sólo nombre', value: 'nombre' }]" :content="false" size="sm" />
      <UFormField v-if="modoPersona === 'usuario'" label="Persona" name="usuarioId" help="Usa su nombre y su foto de perfil.">
        <USelectMenu
          v-model="estado.usuarioId"
          v-model:search-term="busqueda"
          :items="opcionesUsuario"
          value-key="value"
          ignore-filter
          :loading="status === 'pending'"
          placeholder="Buscar por nombre o correo"
          class="w-full"
        />
      </UFormField>
      <UFormField v-else label="Nombre completo" name="nombrePersona" help="Para quien no tiene cuenta en la plataforma.">
        <UInput v-model="estado.nombrePersona" class="w-full" />
      </UFormField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Inicio" name="inicio" required>
        <UInput v-model="estado.inicio" type="date" class="w-full" />
      </UFormField>
      <UFormField label="Conclusión" name="fin">
        <UInput v-model="estado.fin" type="date" class="w-full" />
      </UFormField>
      <UFormField label="Estado" name="estado">
        <USelect v-model="estado.estado" :items="opcionesEstado" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Organización de procedencia" name="organizacionProcedenciaId">
        <USelectMenu v-model="procedencia" :items="opcionesOrganizacion" value-key="value" class="w-full" />
      </UFormField>
      <UFormField label="Descripción" name="descripcion" class="sm:col-span-2" help="Semblanza breve o atribuciones (se publica junto al nombre).">
        <UTextarea v-model="estado.descripcion" :rows="3" autoresize class="w-full" />
      </UFormField>
    </div>

    <USwitch
      v-model="estado.publicado"
      :disabled="!puedePublicar"
      label="Publicar en el portal"
      :description="puedePublicar ? 'Publique sólo nombramientos validados por la Federación.' : 'La Federación publica los nombramientos una vez validados.'"
    />

    <AlertaError :mensaje="error" />
    <div class="flex justify-end gap-2">
      <UButton v-if="nombramiento" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cerrar')" />
      <UButton type="submit" label="Guardar" :loading="enviando" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { refDebounced } from '@vueuse/core'
import type { EstadoFormulario, Pagina } from '#shared/schemas/comunes'
import { ESTADOS_NOMBRAMIENTO, NOMBRE_NOMBRAMIENTO, nombramientoSchema, type NombramientoInput } from '#shared/schemas/estructura'
import { nombreCompleto } from '#shared/texto'
import type { EstructuraDto } from '~~/server/services/estructura'
import type { UsuarioDto } from '~~/server/services/usuarios'

const opcionesEstado = ESTADOS_NOMBRAMIENTO.map(e => ({ label: NOMBRE_NOMBRAMIENTO[e], value: e }))
const props = defineProps<{ estructura: EstructuraDto, nombramiento?: EstructuraDto['nombramientos'][number], puedePublicar: boolean }>()
const emit = defineEmits<{ cerrar: [], guardado: [] }>()
const api = useApi()
const { puede } = usePermisos()
const dia = (v?: string | Date | null) => (v ? new Date(v).toISOString().slice(0, 10) : '')

const n = props.nombramiento
const vigente = props.estructura.periodos.find(p => !p.fin || dia(p.fin) >= dia(new Date()))
const estado = reactive<EstadoFormulario<NombramientoInput>>({
  cargoId: n?.cargoId ?? '',
  periodoId: n?.periodoId ?? vigente?.id ?? undefined,
  usuarioId: n?.usuarioId ?? undefined,
  nombrePersona: n?.nombrePersona ?? '',
  organizacionProcedenciaId: n?.organizacionProcedenciaId ?? undefined,
  descripcion: n?.descripcion ?? '',
  inicio: dia(n?.inicio) || dia(vigente?.inicio) || dia(new Date()),
  fin: dia(n?.fin) || dia(vigente?.fin),
  estado: n?.estado ?? 'VIGENTE',
  publicado: n?.publicado ?? false,
})
const modoPersona = ref<'usuario' | 'nombre'>(n && !n.usuarioId ? 'nombre' : puede('usuario.ver') ? 'usuario' : 'nombre')
watch(modoPersona, (m) => {
  if (m === 'nombre') estado.usuarioId = undefined
  else estado.nombrePersona = ''
})

const opcionesCargo = computed(() => props.estructura.organos.flatMap(o => o.cargos.filter(c => c.activo || c.id === n?.cargoId).map(c => ({ label: `${c.nombre} · ${o.nombre}`, value: c.id }))))

const NINGUNO = '__ninguno__'
const opcionesPeriodo = computed(() => [{ label: 'Sin periodo', value: NINGUNO }, ...props.estructura.periodos.map(p => ({ label: p.nombre, value: p.id }))])
const periodo = computed({ get: () => estado.periodoId ?? NINGUNO, set: (v: string) => { estado.periodoId = v === NINGUNO ? undefined : v } })

const { data: organizaciones } = await useAsyncData('organizaciones-disponibles', () => api<{ id: string, nombre: string }[]>('/api/organizaciones/disponibles'), { default: () => [] })
const opcionesOrganizacion = computed(() => [{ label: 'Ninguna', value: NINGUNO }, ...organizaciones.value.map(o => ({ label: o.nombre, value: o.id }))])
const procedencia = computed({ get: () => estado.organizacionProcedenciaId ?? NINGUNO, set: (v: string) => { estado.organizacionProcedenciaId = v === NINGUNO ? undefined : v } })

// Búsqueda de usuarios (dentro de lo que el usuario puede ver).
const busqueda = ref('')
const termino = refDebounced(busqueda, 300)
const { data: usuarios, status } = await useAsyncData(
  'usuarios-nombramiento',
  () => api<Pagina<UsuarioDto>>('/api/usuarios', { query: { q: termino.value || undefined, activo: 'true', porPagina: 20 } }),
  { watch: [termino], immediate: puede('usuario.ver') },
)
const opcionesUsuario = computed(() => {
  const lista = (usuarios.value?.datos ?? []).map(u => ({ label: `${nombreCompleto(u)} · ${u.email}`, value: u.id }))
  // Conserva visible al usuario ya elegido aunque no esté en la búsqueda actual.
  if (n?.usuarioId && !lista.some(o => o.value === n.usuarioId)) lista.unshift({ label: n.persona.nombre, value: n.usuarioId })
  return lista
})

const form = useTemplateRef<Form<NombramientoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => n
    ? api<unknown>(`/api/estructura/nombramientos/${n.id}`, { method: 'PUT', body: estado })
    : api<unknown>('/api/estructura/nombramientos', { method: 'POST', body: estado }))
  if (r.ok) emit('guardado')
}
async function eliminar() {
  if (!confirm('¿Eliminar este registro? Para terminar un cargo, márquelo como concluido: así se conserva en el historial.')) return
  const r = await enviar(() => api(`/api/estructura/nombramientos/${n!.id}`, { method: 'DELETE' }))
  if (r.ok) emit('guardado')
}
</script>
