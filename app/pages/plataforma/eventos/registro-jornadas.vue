<!-- Registro en sede de las Jornadas 2026: asistentes por día, QR del enlace oculto para
     imprimir, lista de registrados y correcciones de ingreso desde la mesa. -->
<template>
  <PanelPagina id="registro-jornadas" titulo="Registro en sede · Jornadas 2026" tamano="xl">
    <template #acciones>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" aria-label="Actualizar" :loading="statusResumen === 'pending'" @click="actualizar" />
      <UButton icon="i-lucide-download" label="CSV" color="neutral" variant="outline" href="/api/jornadas/registro/csv" external />
      <UButton icon="i-lucide-user-plus" label="Registrar" @click="abiertoAlta = true" />
    </template>

    <div v-if="r" class="space-y-6">
      <!-- Cifras -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Registrados</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(r.total) }}</p>
          <p class="mt-1 text-xs text-muted">{{ nf(r.porOrigen.AUTOREGISTRO ?? 0) }} por QR · {{ nf(r.porOrigen.MESA ?? 0) }} en mesa</p>
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta ring-2 ring-acento-400">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">{{ r.dia ? `Hoy · ${r.dia.etiqueta}` : 'Hoy' }}</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(hoyIngresos) }}</p>
          <p class="mt-1 text-xs text-muted">{{ r.dia ? 'asistentes que ingresaron' : 'no es día del evento' }}</p>
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Asistieron los {{ r.dias.length }} días</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(r.todosLosDias) }}</p>
          <p class="mt-1 text-xs text-muted">candidatos a constancia completa</p>
        </div>
        <div class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Registrados sin ingreso</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-highlighted">{{ nf(r.sinIngreso) }}</p>
          <p class="mt-1 text-xs text-muted">se registraron, aún no entran</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Por día -->
        <section class="rounded-2xl bg-default p-5 shadow-tarjeta lg:col-span-2">
          <h2 class="font-display text-base font-bold text-highlighted">Asistentes por día</h2>
          <div class="mt-5 grid grid-cols-3 gap-4">
            <div v-for="d in r.porDia" :key="d.fecha" class="text-center">
              <div class="relative mx-auto flex h-40 w-full max-w-24 items-end overflow-hidden rounded-md bg-muted">
                <div class="w-full rounded-md transition-[height] duration-700" :class="d.fecha === r.hoy ? 'bg-acento-500' : 'bg-marca-700'" :style="{ height: `${Math.max(2, (d.ingresos / maxDia) * 100)}%` }" />
              </div>
              <p class="mt-2 font-display text-2xl font-bold tabular-nums text-highlighted">{{ nf(d.ingresos) }}</p>
              <p class="text-sm font-medium text-highlighted">{{ d.etiqueta }}</p>
              <p class="text-xs text-muted">{{ nf(d.nuevos) }} registro(s) nuevos</p>
            </div>
          </div>
          <p v-if="r.otrosDias.length" class="mt-4 text-xs text-dimmed">
            Ingresos de prueba fuera de las fechas del evento: {{ r.otrosDias.map(o => `${o.fecha} (${o.ingresos})`).join(', ') }}.
          </p>
        </section>

        <!-- Enlace oculto -->
        <section class="rounded-2xl bg-default p-5 shadow-tarjeta">
          <h2 class="font-display text-base font-bold text-highlighted">Código QR del registro</h2>
          <p class="mt-1 text-sm text-muted">Enlace oculto: no aparece en el sitio. Imprímalo para el módulo de registro.</p>
          <div class="mx-auto mt-4 w-44 rounded-md bg-white p-2 ring-1 ring-default" v-html="r.qr" />
          <UInput :model-value="r.url" readonly size="sm" class="mt-4 w-full" :ui="{ base: 'font-mono text-xs' }" />
          <div class="mt-3 grid grid-cols-3 gap-2">
            <UButton icon="i-lucide-copy" label="Copiar" size="sm" color="neutral" variant="outline" block @click="copiar" />
            <UButton icon="i-lucide-printer" label="Cartel" size="sm" color="neutral" variant="outline" block @click="imprimirCartel" />
            <UButton icon="i-lucide-external-link" label="Abrir" size="sm" color="neutral" variant="outline" block :href="r.url" target="_blank" external />
          </div>
        </section>
      </div>

      <!-- Categorías -->
      <section v-if="r.porCategoria.length" class="rounded-2xl bg-default p-5 shadow-tarjeta">
        <h2 class="font-display text-base font-bold text-highlighted">Registrados por categoría</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <UBadge v-for="c in r.porCategoria" :key="c.categoria" :label="`${c.etiqueta}: ${nf(c.total)}`" color="neutral" variant="soft" size="lg" />
        </div>
      </section>

      <!-- Lista -->
      <section class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
        <div class="flex flex-wrap items-center gap-3 border-b border-default px-5 py-3">
          <h2 class="font-display text-base font-bold text-highlighted">Registrados</h2>
          <UInput v-model="busqueda" icon="i-lucide-search" placeholder="Nombre, correo o procedencia" size="sm" class="ml-auto w-full sm:w-72" />
        </div>
        <EstadoVacio v-if="statusLista !== 'pending' && !lista?.length" icono="i-lucide-users" :titulo="busqueda ? 'Sin coincidencias' : 'Aún no hay registrados'" />
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-xs uppercase tracking-wide text-dimmed">
              <tr>
                <th class="px-5 py-2 font-medium">Nombre</th>
                <th class="hidden px-3 py-2 font-medium md:table-cell">Categoría</th>
                <th v-for="d in r.dias" :key="d.fecha" class="px-2 py-2 text-center font-medium">{{ d.corta }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="p in lista" :key="p.id">
                <td class="px-5 py-2.5">
                  <p class="font-medium text-highlighted">{{ p.nombre }}</p>
                  <p class="text-xs text-muted">{{ p.correo }}<template v-if="p.telefono"> · {{ p.telefono }}</template></p>
                  <p v-if="p.procedencia" class="text-xs text-dimmed">{{ p.procedencia }}</p>
                </td>
                <td class="hidden px-3 py-2.5 text-muted md:table-cell">{{ NOMBRE_CATEGORIA[p.categoria] }}</td>
                <td v-for="d in r.dias" :key="d.fecha" class="px-2 py-2.5 text-center">
                  <UTooltip :text="p.dias.includes(d.fecha) ? `Quitar ingreso del ${d.etiqueta}` : `Marcar ingreso del ${d.etiqueta}`">
                    <UButton
                      :icon="p.dias.includes(d.fecha) ? 'i-lucide-circle-check' : 'i-lucide-circle'"
                      :color="p.dias.includes(d.fecha) ? 'success' : 'neutral'"
                      variant="ghost"
                      size="sm"
                      :loading="cambiando === `${p.id}:${d.fecha}`"
                      :aria-label="`${p.nombre}, ${d.etiqueta}`"
                      @click="alternar(p, d.fecha)"
                    />
                  </UTooltip>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="(lista?.length ?? 0) >= 300" class="px-5 py-3 text-xs text-dimmed">Se muestran los 300 más recientes; use la búsqueda o descargue el CSV.</p>
        </div>
      </section>
    </div>

    <!-- Alta desde la mesa -->
    <UModal v-model:open="abiertoAlta" title="Registrar asistente" :description="r?.ingresoAbierto ? 'Se registra y se marca su ingreso de hoy.' : 'Hoy no es día del evento: sólo se registra.'">
      <template #body>
        <UForm ref="form" :schema="registroAsistenteSchema" :state="alta" class="space-y-4" @submit="registrar">
          <UFormField label="Nombre completo (como en la INE)" name="nombre" required>
            <UInput v-model="alta.nombre" class="w-full" />
          </UFormField>
          <UFormField label="Correo" name="correo" required>
            <UInput v-model="alta.correo" type="email" class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Teléfono" name="telefono">
              <UInput v-model="alta.telefono" type="tel" class="w-full" />
            </UFormField>
            <UFormField label="Categoría" name="categoria" required>
              <USelect v-model="alta.categoria" :items="categorias" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Procedencia" name="procedencia">
            <UInput v-model="alta.procedencia" class="w-full" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="abiertoAlta = false" />
            <UButton type="submit" label="Registrar" icon="i-lucide-check" :loading="enviando" />
          </div>
        </UForm>
      </template>
    </UModal>
  </PanelPagina>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { refDebounced, useIntervalFn } from '@vueuse/core'
import { JORNADAS_2026 as J } from '#shared/jornadas2026'
import { CATEGORIAS_ASISTENTE, NOMBRE_CATEGORIA, registroAsistenteSchema, type CategoriaAsistente, type RegistroAsistenteEntrada } from '#shared/registro-jornadas'
import type { RegistradoDto, ResultadoIngreso, resumenRegistro } from '~~/server/services/registro-asistentes'

definePageMeta({ layout: 'plataforma', permiso: 'evento.gestionar' })
useSeoMeta({ title: 'Registro en sede · Jornadas 2026' })

type Resumen = Awaited<ReturnType<typeof resumenRegistro>> & { url: string, qr: string }

const api = useApi()
const toast = useToast()
const nf = (n: number) => n.toLocaleString('es-MX')

const { data: r, status: statusResumen, refresh: refrescarResumen } = await useAsyncData('registro-jornadas-resumen', () => api<Resumen>('/api/jornadas/registro/resumen'))
const busqueda = ref('')
const q = refDebounced(busqueda, 300)
const { data: lista, status: statusLista, refresh: refrescarLista } = await useAsyncData('registro-jornadas-lista', () => api<RegistradoDto[]>('/api/jornadas/registro', { query: { q: q.value } }), { watch: [q] })

const hoyIngresos = computed(() => r.value?.porDia.find(d => d.fecha === r.value?.hoy)?.ingresos ?? r.value?.otrosDias.find(o => o.fecha === r.value?.hoy)?.ingresos ?? 0)
const maxDia = computed(() => Math.max(1, ...(r.value?.porDia.map(d => d.ingresos) ?? [])))

function actualizar() {
  refrescarResumen()
  refrescarLista()
}
// Durante el evento las cifras se actualizan solas.
useIntervalFn(() => { if (r.value?.ingresoAbierto && document.visibilityState === 'visible') actualizar() }, 30_000)

const cambiando = ref('')
async function alternar(p: RegistradoDto, fecha: string) {
  const presente = !p.dias.includes(fecha)
  cambiando.value = `${p.id}:${fecha}`
  try {
    await api(`/api/jornadas/registro/${p.id}/ingreso`, { method: 'POST', body: { fecha, presente } })
    p.dias = presente ? [...p.dias, fecha].sort() : p.dias.filter(d => d !== fecha)
    refrescarResumen()
  }
  catch (e) {
    toast.add({ title: errorDeApi(e).mensaje, color: 'error' })
  }
  finally {
    cambiando.value = ''
  }
}

async function copiar() {
  await navigator.clipboard.writeText(r.value!.url)
  toast.add({ title: 'Enlace copiado', color: 'success' })
}

/** Abre una hoja con el QR en grande para imprimir y pegar en la sede. */
function imprimirCartel() {
  const w = window.open('', '_blank')
  if (!w || !r.value) return
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>QR registro · Jornadas 2026</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;margin:0;padding:48px 32px;color:#1f2a6b}
h1{font-size:44px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.04em}p{font-size:22px;margin:6px 0}
.qr{width:420px;margin:32px auto}.qr svg{width:100%;height:auto}small{color:#666;font-size:14px}</style></head><body>
<p><strong>${J.edicion} Jornadas Académicas FEACOMECH</strong></p><h1>Registro de asistencia</h1>
<p>Escanee con la cámara de su teléfono para registrarse y marcar su ingreso del día.</p>
<div class="qr">${r.value.qr}</div><p>${J.fechas} · ${J.sede.nombre}</p>
<small>Escanéelo cada día al llegar.</small><script>window.onload=()=>window.print()<\/script></body></html>`)
  w.document.close()
}

// Alta desde la mesa
const categorias = CATEGORIAS_ASISTENTE.map(c => ({ value: c, label: NOMBRE_CATEGORIA[c] }))
const vacio = (): RegistroAsistenteEntrada => ({ nombre: '', correo: '', telefono: '', categoria: undefined as unknown as CategoriaAsistente, procedencia: '' })
const alta = reactive(vacio())
const abiertoAlta = ref(false)
const form = useTemplateRef<Form<RegistroAsistenteEntrada>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function registrar() {
  const res = await enviar(() => api<ResultadoIngreso>('/api/jornadas/registro', { method: 'POST', body: alta }))
  if (!res.ok) return
  const v = res.valor
  toast.add({
    title: v.yaRegistrado ? `${v.nombre} ya estaba registrado` : `${v.nombre} registrado`,
    description: v.ingresoHoy ? (v.ingresoRepetido ? 'Su ingreso de hoy ya estaba marcado.' : 'Ingreso de hoy marcado.') : undefined,
    color: 'success',
  })
  Object.assign(alta, vacio())
  abiertoAlta.value = false
  actualizar()
}
</script>
