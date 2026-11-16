<!-- Créditos: perfil profesional de quien desarrolló la plataforma web y su contacto.
     Enlazada desde el pie de página y desde /contacto. Datos en shared/desarrollo.ts.
     El teléfono y el correo se arman sólo en el navegador (no van en el HTML del servidor). -->
<template>
  <div>
    <SitioEncabezado antetitulo="Créditos" titulo="Desarrollo de la plataforma" />

    <UContainer class="space-y-16 py-14 sm:py-20">
      <!-- Presentación y contacto -->
      <article class="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-marca-50 via-default to-acento-50 p-6 shadow-flotante ring-1 ring-default sm:p-10 lg:p-14 dark:from-marca-950 dark:via-default dark:to-marca-950">
        <MarcaRed class="girar-lento pointer-events-none absolute -right-40 -top-40 -z-10 size-[34rem] text-marca-200/50 dark:text-white/5" />

        <!-- En pantallas grandes la foto flota a la izquierda, alineada con el rótulo, y el texto
             la rodea (sin huecos debajo de la foto). En el celular, todo apilado y centrado. -->
        <div class="flow-root">
          <SitioRetratoInstitucional
            v-revelar.izquierda
            :src="d.retrato"
            :recorte="d.recorte"
            :alt="`Fotografía de ${d.nombre}`"
            class="mb-10 !max-w-80 sm:w-80 lg:float-left lg:mb-6 lg:mr-14 lg:w-80"
          />

          <div v-revelar="80" class="text-center lg:text-left">
            <p class="rotulo">
              Diseño y desarrollo web
            </p>
            <h2 class="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-highlighted text-balance sm:text-5xl">
              {{ d.nombre }}
            </h2>
            <p class="mt-2 text-lg font-semibold text-marca-700 dark:text-marca-300">
              {{ d.cargo }}
            </p>
            <p
              v-for="(p, i) in d.resumen"
              :key="i"
              class="mt-5 leading-relaxed text-pretty"
              :class="i === 0 ? 'text-lg text-highlighted sm:text-xl sm:leading-relaxed' : 'text-[17px] text-toned'"
            >
              {{ p }}
            </p>

            <div class="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <a
                v-for="c in contactos"
                :key="c.etiqueta"
                :href="c.enlace"
                :target="c.externo ? '_blank' : undefined"
                :rel="c.externo ? 'noopener' : undefined"
                :class="{ 'sm:col-span-2': c.etiqueta === 'Correo' }"
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
          </div>
        </div>
      </article>

      <!-- Áreas de especialidad -->
      <section class="mx-auto max-w-6xl space-y-6">
        <div v-revelar class="text-center lg:text-left">
          <p class="rotulo">
            Experiencia
          </p>
          <h2 class="mt-2 font-display text-3xl font-bold tracking-tight text-highlighted">
            Áreas de especialidad
          </h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="(e, n) in d.especialidades"
            :key="e.titulo"
            v-revelar="(n % 2) * 80"
            class="elevar group relative overflow-hidden rounded-2xl bg-default p-6 shadow-tarjeta ring-1 ring-default"
          >
            <span class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-marca-600 via-marca-400 to-acento-500" aria-hidden="true" />
            <div class="flex items-center gap-3">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-100 text-marca-700 transition-colors duration-300 group-hover:bg-acento-500 group-hover:text-white dark:bg-marca-900 dark:text-marca-200">
                <UIcon :name="e.icono" class="icono-salto size-5" />
              </span>
              <p class="font-display text-lg font-semibold leading-tight text-highlighted">
                {{ e.titulo }}
              </p>
            </div>
            <p class="mt-3 text-[15px] leading-relaxed text-muted">
              {{ e.texto }}
            </p>
          </div>
        </div>
      </section>

      <!-- Proyectos destacados -->
      <section class="mx-auto max-w-6xl space-y-6">
        <h2 v-revelar class="text-center font-display text-3xl font-bold tracking-tight text-highlighted lg:text-left">
          Proyectos destacados
        </h2>
        <ul class="grid gap-4 sm:grid-cols-2">
          <li
            v-for="(p, n) in d.proyectos"
            :key="p.titulo"
            v-revelar="(n % 2) * 80"
            class="flex gap-4 rounded-2xl bg-default p-5 shadow-tarjeta ring-1 ring-default"
          >
            <UIcon name="i-lucide-circle-check-big" class="mt-0.5 size-5 shrink-0 text-acento-500" />
            <div class="min-w-0">
              <p class="font-semibold leading-snug text-highlighted">
                {{ p.titulo }}
              </p>
              <p class="mt-1 text-sm leading-relaxed text-muted">
                {{ p.texto }}
              </p>
              <a v-if="'enlace' in p" :href="p.enlace" target="_blank" rel="noopener" class="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Nota en {{ p.fuente }} <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
              </a>
            </div>
          </li>
        </ul>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { DESARROLLADOR as d } from '#shared/desarrollo'

const descripcion = d.resumen[0].slice(0, 200)
useSeoMeta({ title: 'Desarrollo de la plataforma', description: descripcion })
useCompartir({ titulo: `Desarrollo de la plataforma · ${d.nombre}`, descripcion, imagen: d.retrato })

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
