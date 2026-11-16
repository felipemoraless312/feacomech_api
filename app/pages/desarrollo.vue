<!-- Créditos: quién desarrolló la plataforma web — resumen del perfil y contacto profesional.
     Enlazada desde el pie de página y desde /contacto. Datos en shared/desarrollo.ts.
     El teléfono y el correo se arman sólo en el navegador (no van en el HTML del servidor). -->
<template>
  <div>
    <SitioEncabezado antetitulo="Créditos" titulo="Desarrollo de la plataforma" />

    <UContainer class="py-14 sm:py-20">
      <article class="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-marca-50 via-default to-acento-50 p-6 shadow-flotante ring-1 ring-default sm:p-10 lg:p-14 dark:from-marca-950 dark:via-default dark:to-marca-950">
        <MarcaRed class="girar-lento pointer-events-none absolute -right-40 -top-40 -z-10 size-[34rem] text-marca-200/50 dark:text-white/5" />

        <div class="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SitioRetratoInstitucional
            v-revelar.izquierda
            :src="d.retrato"
            :recorte="d.recorte"
            :alt="`Fotografía de ${d.nombre}`"
            class="!max-w-80 sm:w-80 lg:w-96 lg:!max-w-96"
          />

          <!-- En el celular todo va centrado; en pantallas grandes, alineado a la izquierda -->
          <div v-revelar="80" class="min-w-0 text-center lg:text-left">
            <p class="rotulo">
              Diseño y desarrollo web
            </p>
            <h2 class="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-highlighted text-balance sm:text-5xl">
              {{ d.nombre }}
            </h2>
            <p class="mt-2 text-lg font-semibold text-marca-700 dark:text-marca-300">
              {{ d.cargo }}
            </p>
            <p class="mt-6 text-lg leading-relaxed text-toned text-pretty sm:text-xl sm:leading-relaxed">
              {{ d.resumen }}
            </p>

            <!-- Contacto -->
            <div class="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <a
                v-for="c in contactos"
                :key="c.etiqueta"
                :href="c.enlace"
                :class="{ 'sm:col-span-2': c.etiqueta === 'Correo' }"
                :target="c.externo ? '_blank' : undefined"
                :rel="c.externo ? 'noopener' : undefined"
                class="group flex items-center gap-3 rounded-2xl bg-default/90 p-4 shadow-tarjeta ring-1 ring-default transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-flotante"
              >
                <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-100 text-marca-700 transition-colors duration-300 group-hover:bg-acento-500 group-hover:text-white dark:bg-marca-900 dark:text-marca-200">
                  <UIcon :name="c.icono" class="size-5" />
                </span>
                <span class="min-w-0">
                  <span class="block text-xs font-medium uppercase tracking-wide text-dimmed">{{ c.etiqueta }}</span>
                  <span class="block truncate font-medium text-highlighted">{{ c.valor }}</span>
                </span>
              </a>
            </div>

            <UButton :to="d.nota.enlace" target="_blank" :label="d.nota.texto" trailing-icon="i-lucide-arrow-up-right" color="neutral" variant="outline" size="lg" class="mt-6 rounded-full" />
          </div>
        </div>
      </article>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { DESARROLLADOR as d } from '#shared/desarrollo'

useSeoMeta({ title: 'Desarrollo de la plataforma', description: d.resumen.slice(0, 200) })
useCompartir({ titulo: `Desarrollo de la plataforma · ${d.nombre}`, descripcion: d.resumen.slice(0, 200), imagen: d.retrato })

// Se arma después de montar (sólo en el navegador): el HTML del servidor no lleva el dato completo.
const listo = ref(false)
onMounted(() => (listo.value = true))

const contactos = computed(() => {
  const tel = d.contacto.telefono.join('')
  const correo = d.contacto.correo.join('@')
  return [
    { etiqueta: 'WhatsApp', icono: 'i-lucide-message-circle', valor: listo.value ? d.contacto.telefono.join(' ') : 'Enviar mensaje', enlace: listo.value ? `https://wa.me/52${tel}` : undefined, externo: true },
    { etiqueta: 'Teléfono', icono: 'i-lucide-phone', valor: listo.value ? d.contacto.telefono.join(' ') : 'Llamar', enlace: listo.value ? `tel:+52${tel}` : undefined, externo: false },
    { etiqueta: 'Correo', icono: 'i-lucide-mail', valor: listo.value ? correo : 'Escribir', enlace: listo.value ? `mailto:${correo}` : undefined, externo: false },
  ]
})
</script>
