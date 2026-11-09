<!-- Portal público. Separado de la plataforma privada (layout "plataforma"). -->
<template>
  <div>
    <!-- Aviso del evento vigente -->
    <NuxtLink v-if="avisoJornadas" to="/jornadas-2026" class="block bg-marca-950 text-white hover:bg-marca-900">
      <UContainer class="flex items-center justify-center gap-3 py-2 text-[13px]">
        <span class="hidden rounded-sm bg-acento-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline">Inscripciones abiertas</span>
        <span class="truncate"><strong class="font-semibold">VII Jornadas Académicas FEACOMECH 2026</strong> · 26 al 28 de noviembre · Polyforum Chiapas</span>
        <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0" />
      </UContainer>
    </NuxtLink>
    <div class="filete-marca" />
    <UHeader to="/" :ui="{ root: 'bg-default' }">
      <template #left>
        <NuxtLink to="/" aria-label="Inicio">
          <MarcaLogo />
        </NuxtLink>
      </template>

      <UNavigationMenu :items="enlaces" variant="link" color="neutral" :ui="{ link: 'text-[13px] font-medium' }" />

      <template #right>
        <UButton to="/jornadas-2026" label="Jornadas 2026" size="sm" class="hidden bg-acento-500 text-white hover:bg-acento-600 lg:inline-flex" />
        <UButton to="/plataforma" icon="i-lucide-lock" label="Plataforma" size="sm" color="primary" class="hidden sm:inline-flex" />
        <UButton to="/plataforma" icon="i-lucide-lock" size="sm" color="primary" variant="soft" class="sm:hidden" aria-label="Plataforma" />
      </template>

      <template #body>
        <UNavigationMenu :items="enlaces" orientation="vertical" color="neutral" class="-mx-2.5" />
        <UButton to="/jornadas-2026" label="Jornadas Académicas 2026" block class="mt-6 bg-acento-500 text-white hover:bg-acento-600" />
        <UButton to="/plataforma" icon="i-lucide-lock" label="Acceso a la plataforma" block class="mt-3" />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <footer class="bg-marca-950 text-white/80 [--ui-text-muted:rgb(255_255_255/0.7)] [--ui-text-highlighted:#fff] [--ui-text-dimmed:rgb(255_255_255/0.5)] [--ui-border:rgb(255_255_255/0.12)]">
      <div class="filete-marca" />
      <UContainer class="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div class="space-y-4">
          <MarcaLogo grande claro />
          <p class="max-w-sm text-sm leading-relaxed text-muted">
            {{ institucion?.nombre }}
          </p>
          <p v-if="contacto" class="text-sm text-muted">
            {{ contacto }}
          </p>
        </div>
        <nav class="space-y-3 text-sm" aria-label="Secciones">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Secciones
          </p>
          <NuxtLink v-for="e in enlaces" :key="e.label" :to="e.to" class="block text-muted hover:text-highlighted">
            {{ e.label }}
          </NuxtLink>
        </nav>
        <div class="space-y-3 text-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Comunidad
          </p>
          <NuxtLink to="/plataforma" class="block text-muted hover:text-highlighted">
            Plataforma para afiliados
          </NuxtLink>
          <NuxtLink to="/documentos" class="block text-muted hover:text-highlighted">
            Documentos institucionales
          </NuxtLink>
          <NuxtLink to="/directorio/profesionales" class="block text-muted hover:text-highlighted">
            Directorio de profesionales
          </NuxtLink>
          <a v-if="institucion?.facebook" :href="institucion.facebook" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-muted hover:text-highlighted">
            <UIcon name="i-lucide-facebook" class="size-4" /> Facebook
          </a>
        </div>
      </UContainer>
      <UContainer class="flex flex-wrap items-center justify-between gap-3 border-t border-default py-5 text-xs text-dimmed">
        <span>© {{ new Date().getFullYear() }} {{ institucion?.siglas ?? 'FEACOMECH' }}</span>
        <NuxtLink to="/aviso-de-privacidad" class="hover:text-muted">
          Aviso de privacidad
        </NuxtLink>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { data: institucion } = await useInstitucion()

const contacto = computed(() => [
  institucion.value?.direccion,
  institucion.value?.ciudad,
  institucion.value?.telefono && `Tel. ${institucion.value.telefono}`,
  institucion.value?.email,
].filter(Boolean).join(' · '))

// El aviso superior se muestra hasta que concluyen las Jornadas.
const avisoJornadas = new Date() < new Date('2026-11-28T16:00:00-06:00')

const enlaces: NavigationMenuItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Directorio', to: '/directorio' },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Jornadas 2026', to: '/jornadas-2026', class: 'lg:hidden' },
  { label: 'Vinculación', to: '/vinculacion' },
  { label: 'Contacto', to: '/contacto' },
]
</script>
