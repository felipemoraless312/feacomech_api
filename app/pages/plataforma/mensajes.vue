<template>
  <PanelPagina id="mensajes" titulo="Mensajes de contacto" tamano="lg">
    <template #herramientas>
      <UTabs v-model="filtro" :items="pestanas" :content="false" size="sm" variant="link" />
    </template>

    <div class="overflow-hidden rounded-2xl bg-default shadow-tarjeta">
      <EstadoVacio v-if="status !== 'pending' && !pagina?.datos.length" icono="i-lucide-mail" titulo="No hay mensajes en esta vista" />
      <ul v-else class="divide-y divide-default">
        <li v-for="m in pagina?.datos" :key="m.id">
          <button type="button" class="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/60" @click="abrir(m)">
            <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="m.estado === 'NUEVO' ? 'bg-primary' : 'bg-transparent'" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-highlighted" :class="{ 'font-semibold': m.estado === 'NUEVO' }">
                {{ m.asunto }}
              </p>
              <p class="truncate text-sm text-muted">
                {{ m.nombre }} · {{ m.email }} · {{ formatoFechaHora(m.creadoEn) }}
              </p>
            </div>
            <EstadoPunto :texto="NOMBRE[m.estado]" :tono="m.estado === 'NUEVO' ? 'info' : m.estado === 'ATENDIDO' ? 'exito' : 'neutro'" />
          </button>
        </li>
      </ul>
    </div>
    <div v-if="(pagina?.total ?? 0) > POR_PAGINA" class="mt-6 flex justify-center">
      <UPagination v-model:page="numeroPagina" :total="pagina?.total ?? 0" :items-per-page="POR_PAGINA" />
    </div>

    <USlideover v-model:open="abierto" :title="seleccion?.asunto" :ui="{ content: 'sm:max-w-lg' }">
      <template #body>
        <div v-if="seleccion" class="space-y-6">
          <GrupoDatos>
            <FilaDato etiqueta="Nombre" :valor="seleccion.nombre" />
            <FilaDato etiqueta="Correo">
              <a :href="`mailto:${seleccion.email}?subject=${encodeURIComponent(`Re: ${seleccion.asunto}`)}`" class="text-primary hover:underline">{{ seleccion.email }}</a>
            </FilaDato>
            <FilaDato etiqueta="Teléfono" :valor="seleccion.telefono" />
            <FilaDato etiqueta="Recibido" :valor="formatoFechaHora(seleccion.creadoEn)" />
            <FilaDato v-if="seleccion.atendidoPor" etiqueta="Atendió" :valor="`${seleccion.atendidoPor.nombre} ${seleccion.atendidoPor.apellidoPaterno}`" />
          </GrupoDatos>
          <p class="whitespace-pre-line rounded-2xl bg-muted p-5 text-[15px] leading-relaxed text-highlighted">
            {{ seleccion.mensaje }}
          </p>
          <UFormField label="Nota interna">
            <UTextarea v-model="nota" :rows="3" autoresize class="w-full" placeholder="Cómo se atendió, a quién se turnó…" />
          </UFormField>
          <AlertaError :mensaje="error" />
          <div class="flex flex-wrap justify-end gap-2">
            <UButton v-if="seleccion.estado !== 'ARCHIVADO'" label="Archivar" color="neutral" variant="ghost" :loading="enviando" @click="cambiar('ARCHIVADO')" />
            <UButton v-if="seleccion.estado !== 'NUEVO'" label="Marcar como nuevo" color="neutral" variant="ghost" :loading="enviando" @click="cambiar('NUEVO')" />
            <UButton label="Marcar como atendido" icon="i-lucide-check" :loading="enviando" @click="cambiar('ATENDIDO')" />
          </div>
        </div>
      </template>
    </USlideover>
  </PanelPagina>
</template>

<script setup lang="ts">
import { formatoFechaHora } from '#shared/texto'
import type { MensajeDto } from '~~/server/services/portal'

definePageMeta({ layout: 'plataforma', permiso: 'contacto.ver' })
useSeoMeta({ title: 'Mensajes de contacto' })

const api = useApi()
const toast = useToast()
const route = useRoute()
const NOMBRE: Record<string, string> = { NUEVO: 'Nuevo', ATENDIDO: 'Atendido', ARCHIVADO: 'Archivado' }

const POR_PAGINA = 25
const filtro = ref('NUEVO')
const pestanas = [{ label: 'Nuevos', value: 'NUEVO' }, { label: 'Atendidos', value: 'ATENDIDO' }, { label: 'Archivados', value: 'ARCHIVADO' }, { label: 'Todos', value: 'TODOS' }]
const numeroPagina = ref(1)
watch(filtro, () => (numeroPagina.value = 1))

const { data: pagina, status, refresh } = await useAsyncData(
  'mensajes',
  () => api<{ total: number, nuevos: number, datos: MensajeDto[] }>('/api/mensajes', {
    query: { estado: filtro.value === 'TODOS' ? undefined : filtro.value, pagina: numeroPagina.value, porPagina: POR_PAGINA },
  }),
  { watch: [filtro, numeroPagina] },
)

const abierto = ref(false)
const seleccion = ref<MensajeDto>()
const nota = ref('')
function abrir(m: MensajeDto) {
  seleccion.value = m
  nota.value = m.nota ?? ''
  abierto.value = true
}
// Abrir directo desde la notificación (?id=…)
watch(pagina, (p) => {
  const id = route.query.id
  const m = typeof id === 'string' ? p?.datos.find(x => x.id === id) : undefined
  if (m && !abierto.value) abrir(m)
}, { immediate: true })

const { enviando, error, enviar } = useEnvio()
async function cambiar(estado: 'NUEVO' | 'ATENDIDO' | 'ARCHIVADO') {
  const r = await enviar(() => api(`/api/mensajes/${seleccion.value!.id}`, { method: 'PATCH', body: { estado, nota: nota.value } }))
  if (r.ok) {
    abierto.value = false
    toast.add({ title: 'Mensaje actualizado', color: 'success', icon: 'i-lucide-check' })
    refresh()
  }
}
</script>
