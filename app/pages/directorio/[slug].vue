<template>
  <div v-if="org">
    <section class="relative isolate overflow-hidden bg-gradient-to-b from-marca-50 to-default">
      <MarcaRed class="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] text-marca-200" />
      <UContainer class="py-14 sm:py-20">
        <NuxtLink to="/directorio" class="inline-flex items-center gap-1 text-sm text-muted hover:text-highlighted">
          <UIcon name="i-lucide-arrow-left" class="size-4" /> Directorio
        </NuxtLink>
        <div class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <LogoOrganizacion :logo-id="org.logoId" :nombre="org.siglas || org.nombre" tamano="xl" class="entrada" />
          <div class="min-w-0">
            <p class="entrada text-sm font-semibold uppercase tracking-[0.16em] text-marca-700" style="--retraso: 60ms">
              {{ NOMBRE_TIPO[org.tipo] }}<template v-if="org.municipio">
                · {{ org.municipio }}
              </template>
            </p>
            <h1 class="entrada mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-highlighted sm:text-4xl" style="--retraso: 120ms">
              {{ org.nombre }}
            </h1>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="grid gap-10 py-12 lg:grid-cols-[1fr_20rem]">
      <div class="space-y-10">
        <section v-if="org.descripcion" v-revelar>
          <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
            Acerca de
          </h2>
          <p class="mt-3 whitespace-pre-line text-[17px] leading-relaxed text-muted">
            {{ org.descripcion }}
          </p>
        </section>

        <section v-if="org.mesaDirectiva.organos.length" v-revelar class="space-y-5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
              Mesa directiva
            </h2>
            <span v-if="org.mesaDirectiva.periodo" class="text-sm text-muted">Periodo {{ org.mesaDirectiva.periodo.nombre }}</span>
          </div>
          <SitioOrganoPublico v-for="o in org.mesaDirectiva.organos" :key="o.nombre" :organigrama="o.organigrama" />
        </section>

        <section v-revelar>
          <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
            Profesionales
          </h2>
          <p class="mt-1 text-sm text-muted">
            {{ org.integrantes }} integrante(s) activo(s). Se muestran sólo quienes autorizaron aparecer en el directorio.
          </p>
          <ul v-if="org.profesionales.length" class="mt-5 grid gap-3 sm:grid-cols-2">
            <li v-for="p in org.profesionales" :key="p.nombre" class="flex items-center gap-3 rounded-2xl bg-default p-4 shadow-tarjeta ring-1 ring-default">
              <FotoPerfil :foto-id="p.fotoId" :nombre="p.nombre" tamano="lg" />
              <div class="min-w-0">
                <p class="font-medium text-highlighted">
                  {{ p.nombre }}
                </p>
                <p class="truncate text-sm text-muted">
                  {{ [p.especialidad, p.subespecialidad].filter(Boolean).join(' · ') || 'Medicina' }}
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <aside v-revelar class="h-fit space-y-4 rounded-2xl bg-muted p-6">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-dimmed">
          Contacto
        </h2>
        <dl class="space-y-3 text-sm">
          <div v-for="c in contacto" :key="c.etiqueta">
            <dt class="text-dimmed">
              {{ c.etiqueta }}
            </dt>
            <dd class="mt-0.5 break-words text-highlighted">
              <a v-if="c.enlace" :href="c.enlace" :target="c.externo ? '_blank' : undefined" rel="noopener" class="text-primary hover:underline">{{ c.valor }}</a>
              <template v-else>
                {{ c.valor }}
              </template>
            </dd>
          </div>
        </dl>
        <p v-if="!contacto.length" class="text-sm text-muted">
          Sin datos de contacto publicados.
        </p>
      </aside>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { NOMBRE_TIPO } from '#shared/schemas/organizacion'
import type { EstructuraPublicaDto } from '~~/server/services/estructura'

const route = useRoute()
interface Ficha {
  slug: string, tipo: 'COLEGIO' | 'ASOCIACION', nombre: string, siglas: string | null, descripcion: string | null, fechaConstitucion: string | null
  municipio: string | null, direccion: string | null, telefono: string | null, email: string | null, sitioWeb: string | null, logoId: string | null
  mesaDirectiva: EstructuraPublicaDto
  integrantes: number, profesionales: { nombre: string, especialidad: string | null, subespecialidad: string | null, fotoId: string | null }[]
}
const { data: org, error } = await useFetch<Ficha>(`/api/publico/organizaciones/${route.params.slug}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Organización no encontrada', fatal: true })

useSeoMeta({ title: () => org.value?.nombre ?? 'Organización', description: () => org.value?.descripcion?.slice(0, 160) ?? undefined })

const contacto = computed(() => {
  const o = org.value
  if (!o) return []
  return [
    o.direccion && { etiqueta: 'Dirección', valor: [o.direccion, o.municipio].filter(Boolean).join(', ') },
    o.telefono && { etiqueta: 'Teléfono', valor: o.telefono, enlace: `tel:${o.telefono.replace(/[^\d+]/g, '')}` },
    o.email && { etiqueta: 'Correo', valor: o.email, enlace: `mailto:${o.email}` },
    o.sitioWeb && { etiqueta: 'Sitio web', valor: o.sitioWeb.replace(/^https:\/\//, ''), enlace: o.sitioWeb, externo: true },
    o.fechaConstitucion && { etiqueta: 'Constitución', valor: fechaCorta(o.fechaConstitucion) },
  ].filter(Boolean) as { etiqueta: string, valor: string, enlace?: string, externo?: boolean }[]
})
</script>
