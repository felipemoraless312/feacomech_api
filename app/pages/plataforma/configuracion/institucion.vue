<template>
  <PanelPagina id="institucion" titulo="Datos institucionales" tamano="md">
    <div v-if="!config" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else class="space-y-10">
      <EncabezadoPagina titulo="Datos institucionales">
        Lo que se capture aquí se publica en el portal. Un campo vacío no se muestra. Escriba entre
        corchetes, p. ej. <code class="text-xs">[Por confirmar]</code>, lo que aún falta validar: se guarda pero no se publica.
      </EncabezadoPagina>

      <UForm ref="form" :schema="datosInstitucionSchema" :state="estado" class="space-y-10" @submit="guardar">
        <GrupoDatos titulo="Identidad">
          <div class="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_12rem]">
            <UFormField label="Nombre oficial" name="nombre" required>
              <UInput v-model="estado.nombre" class="w-full" />
            </UFormField>
            <UFormField label="Siglas" name="siglas" required>
              <UInput v-model="estado.siglas" class="w-full" />
            </UFormField>
            <UFormField label="Lema" name="lema" class="sm:col-span-2">
              <UInput v-model="estado.lema" class="w-full" />
            </UFormField>
          </div>
        </GrupoDatos>

        <GrupoDatos titulo="Contacto">
          <div class="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <UFormField label="Dirección" name="direccion" class="sm:col-span-2">
              <UInput v-model="estado.direccion" class="w-full" />
            </UFormField>
            <UFormField label="Ciudad" name="ciudad">
              <UInput v-model="estado.ciudad" class="w-full" />
            </UFormField>
            <UFormField label="Teléfono" name="telefono">
              <UInput v-model="estado.telefono" class="w-full" />
            </UFormField>
            <UFormField label="Correo" name="email">
              <UInput v-model="estado.email" type="email" class="w-full" />
            </UFormField>
            <UFormField label="Horario de atención" name="horario">
              <UInput v-model="estado.horario" class="w-full" />
            </UFormField>
            <UFormField label="Facebook" name="facebook">
              <UInput v-model="estado.facebook" placeholder="https://…" class="w-full" />
            </UFormField>
            <UFormField label="Sitio web" name="sitioWeb">
              <UInput v-model="estado.sitioWeb" placeholder="https://…" class="w-full" />
            </UFormField>
            <UFormField label="Coordenadas del mapa" name="mapaCoordenadas" help="Latitud,longitud. Ej.: 16.7531,-93.1156">
              <UInput v-model="estado.mapaCoordenadas" class="w-full" />
            </UFormField>
          </div>
        </GrupoDatos>

        <GrupoDatos titulo="Contenido institucional">
          <div class="space-y-4 px-5 py-5">
            <UFormField v-for="c in TEXTOS" :key="c.campo" :label="c.etiqueta" :name="c.campo">
              <UTextarea v-model="estado[c.campo]" :rows="c.filas" autoresize class="w-full" />
            </UFormField>
          </div>
        </GrupoDatos>

        <div class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <AlertaError :mensaje="error" class="sm:mr-auto" />
          <UButton type="submit" label="Guardar" icon="i-lucide-check" size="lg" :loading="enviando" class="justify-center" />
        </div>
      </UForm>

      <GrupoDatos titulo="Sesiones">
        <div class="flex flex-wrap items-end gap-3 px-5 py-5">
          <UFormField label="Cerrar sesión tras minutos sin actividad" help="Entre 5 y 480 minutos.">
            <UInputNumber v-model="inactividad" :min="5" :max="480" class="w-36" />
          </UFormField>
          <UButton label="Guardar" color="neutral" variant="soft" :loading="guardandoParametro" @click="guardarInactividad" />
        </div>
      </GrupoDatos>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { datosInstitucionSchema, type DatosInstitucion } from '#shared/parametros'

definePageMeta({ layout: 'plataforma', permiso: 'config.administrar' })
useSeoMeta({ title: 'Datos institucionales' })

const api = useApi()
const toast = useToast()

const TEXTOS = [
  { campo: 'presentacion', etiqueta: 'Presentación', filas: 3 },
  { campo: 'historia', etiqueta: 'Historia y trayectoria', filas: 5 },
  { campo: 'mision', etiqueta: 'Misión', filas: 3 },
  { campo: 'vision', etiqueta: 'Visión', filas: 3 },
  { campo: 'objetivos', etiqueta: 'Objetivos', filas: 4 },
] as const

const { data: config } = await useAsyncData('configuracion', () => api<{ institucion: DatosInstitucion, sesionInactividadMinutos: number }>('/api/configuracion'))

const estado = reactive<DatosInstitucion>({ ...datosInstitucionSchema.parse({ nombre: '-', siglas: '-' }) })
const inactividad = ref(60)
watch(config, (c) => {
  if (!c) return
  Object.assign(estado, c.institucion)
  inactividad.value = c.sesionInactividadMinutos
}, { immediate: true })

const form = useTemplateRef<Form<DatosInstitucion>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const r = await enviar(() => api('/api/configuracion/institucion', { method: 'PUT', body: estado }))
  if (r.ok) {
    toast.add({ title: 'Datos guardados', description: 'El portal mostrará los cambios en un minuto.', color: 'success', icon: 'i-lucide-check' })
    refreshNuxtData('institucion')
  }
}

const guardandoParametro = ref(false)
async function guardarInactividad() {
  guardandoParametro.value = true
  try {
    await api('/api/configuracion/parametros', { method: 'PUT', body: { sesionInactividadMinutos: inactividad.value } })
    toast.add({ title: 'Parámetro guardado', color: 'success', icon: 'i-lucide-check' })
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    guardandoParametro.value = false
  }
}
</script>
