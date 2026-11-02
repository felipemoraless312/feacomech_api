<template>
  <PanelPagina id="vinculacion" titulo="Vinculación" tamano="lg">
    <template #acciones>
      <UButton icon="i-lucide-plus" label="Agregar" @click="abrir()" />
    </template>

    <div class="space-y-8">
      <EncabezadoPagina titulo="Vinculación institucional">
        Instituciones colaboradoras, convenios y organismos relacionados. Sólo lo marcado como publicado aparece en el portal.
      </EncabezadoPagina>

      <EstadoVacio v-if="!vinculos.length" icono="i-lucide-handshake" titulo="Sin registros de vinculación" />
      <GrupoDatos v-for="t in TIPOS_VINCULO.filter(t => vinculos.some(v => v.tipo === t))" :key="t" :titulo="NOMBRE_VINCULO[t]">
        <div v-for="v in vinculos.filter(x => x.tipo === t)" :key="v.id" class="flex items-center gap-4 px-5 py-3.5">
          <button type="button" class="shrink-0" :aria-label="`Logotipo de ${v.nombre}`" @click="elegirLogo(v.id)">
            <LogoOrganizacion :logo-id="v.logoId" :nombre="v.nombre" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">
              {{ v.nombre }}
            </p>
            <p class="truncate text-sm text-muted">
              <template v-if="v.fechaFirma">
                Firmado {{ fechaCorta(v.fechaFirma) }}{{ v.vigenciaHasta ? ` · vigente hasta ${fechaCorta(v.vigenciaHasta)}` : '' }} ·
              </template>{{ v.sitioWeb ?? 'Sin sitio web' }}
            </p>
          </div>
          <EstadoPunto :texto="v.publicado ? 'Publicado' : 'Oculto'" :tono="v.publicado ? 'exito' : 'neutro'" />
          <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="Editar" @click="abrir(v)" />
        </div>
      </GrupoDatos>
      <input ref="selector" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="subirLogo">
      <p v-if="vinculos.length" class="text-xs text-dimmed">
        Toque el logotipo de un registro para cambiarlo.
      </p>
    </div>

    <UModal v-model:open="abierto" :title="editando ? 'Editar' : 'Agregar vinculación'" :ui="{ content: 'sm:max-w-xl' }">
      <template #body>
        <UForm ref="form" :schema="vinculoSchema" :state="estado" class="space-y-4" @submit="guardar">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Tipo" name="tipo" required>
              <USelect v-model="estado.tipo" :items="opcionesTipo" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Orden" name="orden">
              <UInputNumber v-model="estado.orden" :min="0" :max="999" class="w-full" />
            </UFormField>
            <UFormField label="Nombre" name="nombre" required class="sm:col-span-2">
              <UInput v-model="estado.nombre" class="w-full" />
            </UFormField>
            <UFormField label="Descripción" name="descripcion" class="sm:col-span-2">
              <UTextarea v-model="estado.descripcion" :rows="3" autoresize class="w-full" />
            </UFormField>
            <UFormField label="Sitio web" name="sitioWeb" class="sm:col-span-2">
              <UInput v-model="estado.sitioWeb" placeholder="https://…" class="w-full" />
            </UFormField>
            <template v-if="estado.tipo === 'CONVENIO'">
              <UFormField label="Fecha de firma" name="fechaFirma">
                <UInput v-model="estado.fechaFirma" type="date" class="w-full" />
              </UFormField>
              <UFormField label="Vigente hasta" name="vigenciaHasta">
                <UInput v-model="estado.vigenciaHasta" type="date" class="w-full" />
              </UFormField>
            </template>
          </div>
          <USwitch v-model="estado.publicado" label="Publicar en el portal" />
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton v-if="editando" label="Eliminar" color="error" variant="ghost" class="mr-auto" @click="eliminar" />
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abierto = false" />
            <UButton type="submit" label="Guardar" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { EstadoFormulario } from '#shared/schemas/comunes'
import { NOMBRE_VINCULO, TIPOS_VINCULO, vinculoSchema, type VinculoInput } from '#shared/schemas/portal'
import type { VinculoDto } from '~~/server/services/portal'

definePageMeta({ layout: 'plataforma', permiso: 'contenido.administrar' })
useSeoMeta({ title: 'Vinculación' })

const opcionesTipo = TIPOS_VINCULO.map(t => ({ label: NOMBRE_VINCULO[t], value: t }))
const api = useApi()
const toast = useToast()
const { data: vinculos, refresh } = await useAsyncData('vinculos', () => api<VinculoDto[]>('/api/vinculos'), { default: () => [] })

const dia = (v?: string | Date | null) => (v ? new Date(v).toISOString().slice(0, 10) : '')
const abierto = ref(false)
const editando = ref<VinculoDto>()
const estado = reactive<EstadoFormulario<VinculoInput>>({ tipo: 'INSTITUCION', nombre: '', descripcion: '', sitioWeb: '', fechaFirma: '', vigenciaHasta: '', orden: 0, publicado: false })
function abrir(v?: VinculoDto) {
  editando.value = v
  Object.assign(estado, {
    tipo: v?.tipo ?? 'INSTITUCION', nombre: v?.nombre ?? '', descripcion: v?.descripcion ?? '', sitioWeb: v?.sitioWeb ?? '',
    fechaFirma: dia(v?.fechaFirma), vigenciaHasta: dia(v?.vigenciaHasta), orden: v?.orden ?? 0, publicado: v?.publicado ?? false,
  })
  abierto.value = true
}

const form = useTemplateRef<Form<VinculoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)
async function guardar() {
  const r = await enviar(() => editando.value
    ? api<unknown>(`/api/vinculos/${editando.value.id}`, { method: 'PUT', body: estado })
    : api<unknown>('/api/vinculos', { method: 'POST', body: estado }))
  if (r.ok) hecho('Guardado')
}
async function eliminar() {
  if (!confirm('¿Eliminar este registro?')) return
  const r = await enviar(() => api(`/api/vinculos/${editando.value!.id}`, { method: 'DELETE' }))
  if (r.ok) hecho('Eliminado')
}
function hecho(titulo: string) {
  abierto.value = false
  toast.add({ title: titulo, color: 'success', icon: 'i-lucide-check' })
  refresh()
}

const selector = useTemplateRef<HTMLInputElement>('selector')
const logoPara = ref('')
function elegirLogo(id: string) {
  logoPara.value = id
  selector.value?.click()
}
async function subirLogo(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  input.value = ''
  if (!archivo) return
  const datos = new FormData()
  datos.append('logo', archivo)
  try {
    await api(`/api/vinculos/${logoPara.value}/logo`, { method: 'POST', body: datos })
    hecho('Logotipo actualizado')
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>
