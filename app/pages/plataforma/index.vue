<template>
  <PanelPagina id="resumen" titulo="Resumen">
    <div class="space-y-10">
      <header class="entrada relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-marca-700 to-marca-950 px-6 py-8 text-white shadow-flotante sm:px-10 sm:py-10">
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

      <GrupoDatos titulo="Estado de la plataforma">
        <div class="flex gap-4 px-5 py-4 text-[15px]">
          <UIcon name="i-lucide-hammer" class="mt-0.5 size-5 shrink-0 text-marca-600" />
          <p class="text-muted">
            La plataforma se construye por fases. Los módulos marcados como
            <span class="font-medium text-highlighted">«Pronto»</span> en el menú se habilitarán
            conforme se terminen, y sus indicadores aparecerán aquí con datos reales.
          </p>
        </div>
      </GrupoDatos>
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
