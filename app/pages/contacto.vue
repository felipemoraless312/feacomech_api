<template>
  <div>
    <SitioEncabezado antetitulo="Contacto" titulo="Comuníquese con la Federación" descripcion="Escríbanos para información sobre afiliación, eventos o vinculación institucional." />

    <UContainer class="grid gap-12 py-14 lg:grid-cols-[1fr_1.2fr]">
      <!-- Datos institucionales -->
      <div class="space-y-6">
        <dl v-if="datos.length" class="space-y-5">
          <div v-for="d in datos" :key="d.etiqueta" class="flex gap-4">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-marca-950 dark:text-marca-300">
              <UIcon :name="d.icono" class="size-5" />
            </span>
            <div>
              <dt class="text-sm text-dimmed">
                {{ d.etiqueta }}
              </dt>
              <dd class="text-highlighted">
                <a v-if="d.enlace" :href="d.enlace" class="hover:text-primary" :target="d.externo ? '_blank' : undefined" rel="noopener">{{ d.valor }}</a>
                <template v-else>
                  {{ d.valor }}
                </template>
              </dd>
            </div>
          </div>
        </dl>
        <p v-else class="text-muted">
          Los datos de contacto de la Federación se publicarán próximamente. Mientras tanto, use el formulario.
        </p>

        <div v-if="mapa" class="overflow-hidden rounded-2xl ring-1 ring-default">
          <iframe :src="mapa.embed" title="Ubicación de la Federación" class="h-64 w-full" loading="lazy" referrerpolicy="no-referrer" />
          <a :href="mapa.enlace" target="_blank" rel="noopener" class="block bg-muted px-4 py-2 text-sm text-primary hover:underline">Abrir en el mapa</a>
        </div>
      </div>

      <!-- Formulario -->
      <div class="rounded-xl bg-default p-6 shadow-tarjeta ring-1 ring-default sm:p-8">
        <div v-if="enviado" class="space-y-4 py-10 text-center">
          <span class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600">
            <UIcon name="i-lucide-mail-check" class="size-6" />
          </span>
          <p class="font-display text-2xl font-semibold text-highlighted">
            Mensaje recibido
          </p>
          <p class="text-muted">
            Gracias, {{ estado.nombre.split(' ')[0] }}. Le responderemos a {{ estado.email }}.
          </p>
          <UButton label="Enviar otro mensaje" color="neutral" variant="ghost" @click="reiniciar" />
        </div>
        <UForm v-else ref="form" :schema="contactoSchema" :state="estado" class="space-y-4" @submit="enviarMensaje">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Nombre" name="nombre" required>
              <UInput v-model="estado.nombre" autocomplete="name" class="w-full" />
            </UFormField>
            <UFormField label="Correo" name="email" required>
              <UInput v-model="estado.email" type="email" autocomplete="email" class="w-full" />
            </UFormField>
            <UFormField label="Teléfono" name="telefono">
              <UInput v-model="estado.telefono" type="tel" autocomplete="tel" class="w-full" />
            </UFormField>
            <UFormField label="Asunto" name="asunto" required>
              <UInput v-model="estado.asunto" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Mensaje" name="mensaje" required>
            <UTextarea v-model="estado.mensaje" :rows="5" autoresize class="w-full" />
          </UFormField>
          <!-- Campo trampa para robots: invisible para las personas -->
          <div class="absolute -left-[9999px]" aria-hidden="true">
            <label>Sitio web <input v-model="estado.sitio" type="text" tabindex="-1" autocomplete="off"></label>
          </div>
          <UFormField name="aceptaAviso">
            <UCheckbox v-model="estado.aceptaAviso">
              <template #label>
                He leído el <NuxtLink to="/aviso-de-privacidad" target="_blank" class="text-primary hover:underline">aviso de privacidad</NuxtLink> y autorizo el uso de mis datos para atender este mensaje.
              </template>
            </UCheckbox>
          </UFormField>
          <AlertaError :mensaje="error" />
          <UButton type="submit" label="Enviar mensaje" icon="i-lucide-send" size="lg" block :loading="enviando" />
        </UForm>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { contactoSchema, type ContactoInput } from '#shared/schemas/portal'

useSeoMeta({ title: 'Contacto', description: 'Datos de contacto y formulario para comunicarse con la Federación.' })

const { data: institucion } = await useInstitucion()

const datos = computed(() => {
  const i = institucion.value
  if (!i) return []
  return [
    (i.direccion || i.ciudad) && { etiqueta: 'Dirección', valor: [i.direccion, i.ciudad].filter(Boolean).join(', '), icono: 'i-lucide-map-pin' },
    i.telefono && { etiqueta: 'Teléfono', valor: i.telefono, icono: 'i-lucide-phone', enlace: `tel:${i.telefono.replace(/[^\d+]/g, '')}` },
    i.email && { etiqueta: 'Correo', valor: i.email, icono: 'i-lucide-mail', enlace: `mailto:${i.email}` },
    i.horario && { etiqueta: 'Horario', valor: i.horario, icono: 'i-lucide-clock' },
    i.facebook && { etiqueta: 'Facebook', valor: i.facebook.replace(/^https:\/\/(www\.)?/, ''), icono: 'i-lucide-facebook', enlace: i.facebook, externo: true },
  ].filter(Boolean) as { etiqueta: string, valor: string, icono: string, enlace?: string, externo?: boolean }[]
})

// Mapa de OpenStreetMap a partir de las coordenadas capturadas en el panel.
const mapa = computed(() => {
  const c = institucion.value?.mapaCoordenadas
  if (!c) return null
  const [lat, lon] = c.split(',').map(v => Number(v.trim()))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  const d = 0.006
  return {
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${lon! - d},${lat! - d},${lon! + d},${lat! + d}&layer=mapnik&marker=${lat},${lon}`,
    enlace: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`,
  }
})

const vacio = () => ({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '', aceptaAviso: false as unknown as true, sitio: '' })
const estado = reactive<ContactoInput & { telefono: string }>(vacio())
const enviado = ref(false)
const form = useTemplateRef<Form<ContactoInput>>('form')
const { enviando, error, enviar } = useEnvio(form)

async function enviarMensaje() {
  const r = await enviar(() => $fetch('/api/publico/contacto', { method: 'POST', body: estado }))
  if (r.ok) enviado.value = true
}
function reiniciar() {
  Object.assign(estado, vacio())
  enviado.value = false
}
</script>
