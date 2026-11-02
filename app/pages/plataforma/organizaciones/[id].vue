<template>
  <PanelPagina id="organizacion" :titulo="org?.siglas || org?.nombre || 'Organización'" tamano="lg">
    <template #acciones>
      <UButton to="/plataforma/organizaciones" icon="i-lucide-arrow-left" label="Todas" color="neutral" variant="ghost" class="hidden sm:inline-flex" />
    </template>

    <div v-if="!org" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else class="space-y-8">
      <!-- Encabezado -->
      <header class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="relative w-fit">
          <LogoOrganizacion :logo-id="org.logoId" :nombre="org.siglas || org.nombre" tamano="xl" />
          <UButton
            v-if="esAdmin"
            icon="i-lucide-camera"
            size="xs"
            color="neutral"
            variant="solid"
            class="absolute -bottom-1 -right-1 rounded-full ring-2 ring-default"
            :loading="subiendo"
            aria-label="Cambiar logotipo"
            @click="selectorLogo?.click()"
          />
          <input ref="selectorLogo" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="subirLogo">
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium uppercase tracking-wide text-dimmed">
            {{ NOMBRE_TIPO[org.tipo] }}<template v-if="org.municipio">
              · {{ org.municipio }}
            </template>
          </p>
          <h1 class="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight text-highlighted sm:text-3xl">
            {{ org.nombre }}
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-3">
            <EstadoPunto :texto="NOMBRE_AFILIACION[org.estadoAfiliacion]" :tono="TONO_AFILIACION[org.estadoAfiliacion]" />
            <UBadge v-if="!org.publica" label="No se publica" color="neutral" variant="soft" size="sm" />
            <NuxtLink v-if="org.publica && org.estadoAfiliacion === 'AFILIADA'" :to="`/directorio/${org.slug}`" target="_blank" class="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Ver ficha pública <UIcon name="i-lucide-external-link" class="size-3.5" />
            </NuxtLink>
          </div>
        </div>
      </header>

      <UTabs v-model="pestana" :items="pestanas" :content="false" variant="link" class="w-full" :ui="{ list: 'overflow-x-auto' }" />

      <OrganizacionesIntegrantes v-if="pestana === 'integrantes'" :organizacion-id="org.id" @cambio="refresh" />

      <div v-else-if="pestana === 'informacion'" class="space-y-6">
        <UAlert
          v-if="org.cambioPendiente"
          color="warning"
          variant="subtle"
          icon="i-lucide-clock"
          title="Hay cambios propuestos pendientes de aprobación"
          :description="`Enviados el ${formatoFechaHora(org.cambioPendiente.creadaEn)}${org.cambioPendiente.solicitadaPor ? ` por ${org.cambioPendiente.solicitadaPor.nombre} ${org.cambioPendiente.solicitadaPor.apellidoPaterno}` : ''}.`"
          :actions="esAdmin ? [{ label: 'Revisar', to: '/plataforma/afiliaciones', color: 'warning', variant: 'outline' }] : []"
        />
        <GrupoDatos titulo="Datos institucionales">
          <template #acciones>
            <UButton v-if="esAdmin" label="Editar" icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" @click="abrirFormulario('editar')" />
            <UButton v-else-if="puedeProponer" label="Proponer cambios" icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" @click="abrirFormulario('proponer')" />
          </template>
          <FilaDato etiqueta="Nombre oficial" :valor="org.nombre" />
          <FilaDato etiqueta="Siglas" :valor="org.siglas" />
          <FilaDato etiqueta="Constitución" :valor="org.fechaConstitucion ? fechaCorta(org.fechaConstitucion) : null" />
          <FilaDato etiqueta="Municipio" :valor="org.municipio" />
          <FilaDato etiqueta="Dirección" :valor="org.direccion" />
          <FilaDato etiqueta="Teléfono" :valor="org.telefono" />
          <FilaDato etiqueta="Correo" :valor="org.email" />
          <FilaDato etiqueta="Sitio web" :valor="org.sitioWeb" />
        </GrupoDatos>
        <GrupoDatos v-if="org.descripcion" titulo="Descripción">
          <p class="whitespace-pre-line px-5 py-4 text-[15px] leading-relaxed text-muted">
            {{ org.descripcion }}
          </p>
        </GrupoDatos>
      </div>

      <OrganizacionesRepresentantes v-else-if="pestana === 'representantes'" :organizacion-id="org.id" :representantes="org.roles" @cambio="refresh" />
      <OrganizacionesAfiliacion v-else-if="pestana === 'afiliacion'" :organizacion-id="org.id" :afiliaciones="org.afiliaciones" :actual="org.estadoAfiliacion" @cambio="refresh" />
      <OrganizacionesEstadisticas v-else-if="pestana === 'estadisticas'" :organizacion-id="org.id" />
      <EstructuraPanel v-else-if="pestana === 'estructura'" :organizacion-id="org.id" />
      <DocumentosBiblioteca v-else-if="pestana === 'documentos'" :organizacion-id="org.id" />
    </div>

    <UModal v-model:open="formularioAbierto" :title="modo === 'editar' ? 'Editar organización' : 'Proponer cambios'" :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <OrganizacionesFormulario v-if="org" :modo="modo" :organizacion="org" @cancelar="formularioAbierto = false" @guardado="alGuardar" />
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NOMBRE_AFILIACION, NOMBRE_TIPO } from '#shared/schemas/organizacion'
import { formatoFechaHora } from '#shared/texto'
import type { OrganizacionDetalle } from '~~/server/services/organizaciones'

definePageMeta({ layout: 'plataforma', permiso: 'organizacion.ver' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const { puede, puedeEn } = usePermisos()
const id = computed(() => String(route.params.id))

const { data: org, refresh } = await useAsyncData(`organizacion-${id.value}`, () => api<OrganizacionDetalle>(`/api/organizaciones/${id.value}`))
useSeoMeta({ title: () => org.value?.siglas || org.value?.nombre || 'Organización' })

const esAdmin = computed(() => puede('organizacion.administrar'))
const puedeProponer = computed(() => puedeEn('organizacion.editar', id.value))

const pestanas = computed(() => [
  { label: 'Integrantes', value: 'integrantes', icon: 'i-lucide-users' },
  { label: 'Información', value: 'informacion', icon: 'i-lucide-info' },
  ...(puedeEn('estructura.administrar', id.value) ? [{ label: 'Mesa directiva', value: 'estructura', icon: 'i-lucide-network' }] : []),
  { label: 'Representantes', value: 'representantes', icon: 'i-lucide-user-round-cog' },
  { label: 'Documentos', value: 'documentos', icon: 'i-lucide-library' },
  { label: 'Afiliación', value: 'afiliacion', icon: 'i-lucide-history' },
  { label: 'Estadísticas', value: 'estadisticas', icon: 'i-lucide-chart-column' },
])
const pestana = ref(typeof route.query.p === 'string' ? route.query.p : 'integrantes')
watch(pestana, p => navigateTo({ query: { ...route.query, p } }, { replace: true }))

const formularioAbierto = ref(false)
const modo = ref<'editar' | 'proponer'>('editar')
function abrirFormulario(m: 'editar' | 'proponer') {
  modo.value = m
  formularioAbierto.value = true
}
function alGuardar() {
  formularioAbierto.value = false
  toast.add({
    title: modo.value === 'editar' ? 'Datos actualizados' : 'Propuesta enviada',
    description: modo.value === 'proponer' ? 'La Federación la revisará.' : undefined,
    color: 'success',
    icon: 'i-lucide-check',
  })
  refresh()
}

// --- Logotipo
const selectorLogo = useTemplateRef<HTMLInputElement>('selectorLogo')
const subiendo = ref(false)
async function subirLogo(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  input.value = ''
  if (!archivo) return
  if (archivo.size > 2 * 1024 * 1024) {
    toast.add({ title: 'El logotipo supera el máximo de 2 MB', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  const datos = new FormData()
  datos.append('logo', archivo)
  subiendo.value = true
  try {
    await api(`/api/organizaciones/${id.value}/logo`, { method: 'POST', body: datos })
    toast.add({ title: 'Logotipo actualizado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
  catch (err) {
    toast.add({ title: errorDeApi(err).mensaje, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    subiendo.value = false
  }
}
</script>
