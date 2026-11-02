<template>
  <PanelPagina id="configuracion" titulo="Configuración" tamano="md">
    <div class="space-y-8">
      <EncabezadoPagina titulo="Configuración">
        Datos de la Federación, catálogos, roles y bitácora.
      </EncabezadoPagina>
      <div class="grid gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="(o, i) in opciones"
          :key="o.to"
          :to="o.to"
          class="entrada group flex gap-4 rounded-2xl bg-default p-5 shadow-tarjeta transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante"
          :style="{ '--retraso': `${i * 50}ms` }"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-marca-950 dark:text-marca-300">
            <UIcon :name="o.icono" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="block font-medium text-highlighted">{{ o.titulo }}</span>
            <span class="mt-0.5 block text-sm text-muted">{{ o.descripcion }}</span>
          </span>
        </NuxtLink>
      </div>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Permiso } from '#shared/permisos'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Configuración' })

const { puede } = usePermisos()

const TODAS: { to: string, titulo: string, descripcion: string, icono: string, permiso: Permiso }[] = [
  { to: '/plataforma/configuracion/institucion', titulo: 'Datos institucionales', descripcion: 'Nombre, contacto, historia, misión y visión que publica el portal.', icono: 'i-lucide-landmark', permiso: 'config.administrar' },
  { to: '/plataforma/configuracion/portada', titulo: 'Página de inicio', descripcion: 'Cifras, trayectoria, cita y líneas de trabajo de la portada.', icono: 'i-lucide-layout-template', permiso: 'contenido.administrar' },
  { to: '/plataforma/configuracion/especialidades', titulo: 'Especialidades', descripcion: 'Catálogo de especialidades y subespecialidades.', icono: 'i-lucide-stethoscope', permiso: 'config.administrar' },
  { to: '/plataforma/configuracion/roles', titulo: 'Roles y permisos', descripcion: 'Qué puede hacer cada rol y con qué alcance.', icono: 'i-lucide-shield', permiso: 'rol.administrar' },
  { to: '/plataforma/configuracion/bitacora', titulo: 'Bitácora', descripcion: 'Registro inalterable de las acciones en la plataforma.', icono: 'i-lucide-scroll-text', permiso: 'auditoria.ver' },
]
const opciones = computed(() => TODAS.filter(o => puede(o.permiso)))
</script>
