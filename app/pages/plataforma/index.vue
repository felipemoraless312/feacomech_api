<!-- Inicio de la plataforma: primero lo que requiere atención, luego accesos rápidos y cifras. -->
<template>
  <PanelPagina id="resumen" titulo="Inicio">
    <div class="space-y-10">
      <header class="entrada relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-marca-700 via-marca-600 to-marca-500 px-6 py-7 text-white shadow-flotante sm:px-10 sm:py-8">
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
      </header>

      <!-- Pendientes: sólo para quien administra algo -->
      <section v-if="resumen && resumen.indicadores.length" class="space-y-3">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
          Requiere su atención
        </h2>
        <div v-if="pendientes.length" class="divide-y divide-default overflow-hidden rounded-xl bg-default shadow-tarjeta">
          <NuxtLink
            v-for="p in pendientes"
            :key="p.clave"
            :to="p.to"
            class="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-elevated/60"
          >
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/10 text-sm font-semibold tabular-nums text-warning">
              {{ p.valor > 99 ? '99+' : p.valor }}
            </span>
            <span class="min-w-0 flex-1 text-[15px] font-medium text-highlighted">{{ p.etiqueta }}</span>
            <span class="hidden text-sm text-muted sm:inline">Revisar</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-dimmed transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </NuxtLink>
        </div>
        <p v-else class="flex items-center gap-3 rounded-xl bg-default px-5 py-4 text-[15px] text-muted shadow-tarjeta">
          <UIcon name="i-lucide-circle-check" class="size-5 text-success" />
          Todo al día: no hay solicitudes, reportes ni revisiones pendientes.
        </p>
      </section>

      <!-- Lo más usado por cualquier afiliado -->
      <section class="space-y-3">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
          Accesos rápidos
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="(d, n) in accesos"
            :key="d.to"
            :to="d.to"
            :target="d.target"
            class="entrada elevar group flex items-center gap-4 rounded-xl bg-default p-4 shadow-tarjeta ring-1 ring-default"
            :style="{ '--retraso': `${60 + n * 40}ms` }"
          >
            <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-700 transition-colors duration-300 group-hover:bg-acento-500 group-hover:text-white dark:bg-marca-950 dark:text-marca-300">
              <UIcon :name="d.icon" class="size-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-medium text-highlighted">{{ d.label }}</span>
              <span class="block truncate text-sm text-muted">{{ d.descripcion }}</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-dimmed transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </NuxtLink>
        </div>
        <p class="hidden text-sm text-muted lg:block">
          Para ir a cualquier sección, presione <UKbd value="meta" /> <UKbd value="K" /> y escriba su nombre.
        </p>
      </section>

      <section v-if="cifras.length" class="space-y-3">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
          Cifras
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <component
            :is="i.to ? NuxtLink : 'div'"
            v-for="i in cifras"
            :key="i.clave"
            :to="i.to"
            class="relative overflow-hidden rounded-xl bg-default px-5 py-4 shadow-tarjeta"
            :class="{ 'transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-flotante': i.to }"
          >
            <p class="text-[13px] leading-snug text-muted">
              {{ i.etiqueta }}
            </p>
            <p class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-highlighted">
              {{ i.valor.toLocaleString('es-MX') }}
            </p>
          </component>
        </div>
      </section>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { ZONA_HORARIA } from '#shared/texto'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Inicio' })

const api = useApi()
const { user } = useUserSession()
const { acceso } = usePermisos()
const { comunidad, cuenta } = useMenuPlataforma()

interface Indicador { clave: string, etiqueta: string, valor: number, to?: string, tono?: 'alerta' }
const { data: resumen } = await useAsyncData('resumen', () => api<{ noLeidas: number, indicadores: Indicador[] }>('/api/resumen'))

// Las alertas con algo pendiente van arriba; el resto de los indicadores son cifras de consulta.
const pendientes = computed(() => (resumen.value?.indicadores ?? []).filter(i => i.tono === 'alerta' && i.valor > 0))
const cifras = computed(() => (resumen.value?.indicadores ?? []).filter(i => !(i.tono === 'alerta' && i.valor > 0)))

const porRuta = (to: string) => [...comunidad, ...cuenta].find(d => d.to === to)!
const accesos = [
  porRuta('/plataforma/cuenta/credencial'),
  porRuta('/plataforma/eventos'),
  porRuta('/plataforma/comunidad'),
  porRuta('/plataforma/documentos'),
]

const roles = computed(() => acceso.value?.roles.map(r => r.nombre).join(' · ') ?? '')
const nombreCorto = computed(() => user.value?.nombre.split(' ')[0] ?? '')

const ahora = new Date()
const hora = Number(new Intl.DateTimeFormat('es-MX', { hour: 'numeric', hourCycle: 'h23', timeZone: ZONA_HORARIA }).format(ahora))
const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
const fechaHoy = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ZONA_HORARIA }).format(ahora)
</script>
