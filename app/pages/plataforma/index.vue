<template>
  <PanelPagina id="resumen" titulo="Resumen">
    <div class="space-y-10">
      <header class="entrada relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-marca-700 via-marca-600 to-marca-500 px-6 py-8 text-white shadow-flotante sm:px-10 sm:py-10">
        <MarcaRed class="girar-lento pointer-events-none absolute -right-24 -top-24 -z-10 size-80 text-white/10 sm:size-96" />
        <p class="text-[15px] capitalize text-white/75">
          {{ fechaHoy }}
        </p>
        <h1 class="mt-1 font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
          {{ saludo }}, {{ nombreCorto }}.
        </h1>
        <p v-if="roles" class="mt-2 text-[15px] text-white/80">
          {{ roles }}
        </p>
        <div class="mt-6 flex flex-wrap gap-2">
          <UButton to="/plataforma/cuenta/perfil" label="Mi perfil" icon="i-lucide-id-card" size="md" class="bg-white text-marca-800 hover:bg-marca-50" />
          <UButton
            to="/plataforma/notificaciones"
            :label="resumen?.noLeidas ? `${resumen.noLeidas} notificación(es)` : 'Notificaciones'"
            icon="i-lucide-bell"
            size="md"
            class="bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25"
          />
        </div>
      </header>

      <section v-if="resumen?.indicadores.length" class="space-y-4">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
          Indicadores
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <component
            :is="i.to ? NuxtLink : 'div'"
            v-for="(i, n) in resumen.indicadores"
            :key="i.clave"
            :to="i.to"
            class="entrada relative overflow-hidden rounded-2xl bg-default px-5 py-4 shadow-tarjeta"
            :class="{ 'transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante': i.to }"
            :style="{ '--retraso': `${80 + n * 50}ms` }"
          >
            <span class="absolute inset-y-0 left-0 w-1" :class="i.tono === 'alerta' ? 'bg-warning' : 'bg-marca-500'" />
            <p class="text-[13px] leading-snug text-muted">
              {{ i.etiqueta }}
            </p>
            <p class="mt-1 text-2xl font-semibold tabular-nums tracking-tight" :class="i.tono === 'alerta' ? 'text-warning' : 'text-highlighted'">
              {{ i.valor.toLocaleString('es-MX') }}
            </p>
          </component>
        </div>
      </section>

      <NuxtLink to="/plataforma/cuenta/credencial" class="elevar group flex items-center gap-4 rounded-xl bg-gradient-to-r from-marca-50 via-default to-acento-50 p-5 shadow-tarjeta ring-1 ring-default">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-marca-100 text-marca-700 transition-colors duration-300 group-hover:bg-acento-500 group-hover:text-white">
          <UIcon name="i-lucide-badge-check" class="icono-salto size-6" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-display text-lg font-semibold text-highlighted">Mi credencial digital</span>
          <span class="block text-sm text-muted">Con código QR para comprobar su afiliación en cualquier momento. Puede imprimirla.</span>
        </span>
        <UIcon name="i-lucide-arrow-right" class="size-5 shrink-0 text-dimmed transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </NuxtLink>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { ZONA_HORARIA } from '#shared/texto'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Resumen' })

const api = useApi()
const { user } = useUserSession()
const { acceso } = usePermisos()

interface Indicador { clave: string, etiqueta: string, valor: number, to?: string, tono?: 'alerta' }
const { data: resumen } = await useAsyncData('resumen', () => api<{ noLeidas: number, indicadores: Indicador[] }>('/api/resumen'))

const roles = computed(() => acceso.value?.roles.map(r => r.nombre).join(' · ') ?? '')
const nombreCorto = computed(() => user.value?.nombre.split(' ')[0] ?? '')

const ahora = new Date()
const hora = Number(new Intl.DateTimeFormat('es-MX', { hour: 'numeric', hourCycle: 'h23', timeZone: ZONA_HORARIA }).format(ahora))
const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
const fechaHoy = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ZONA_HORARIA }).format(ahora)
</script>
