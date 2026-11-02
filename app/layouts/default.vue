<!-- Portal público. Separado de la plataforma privada (layout "plataforma"). -->
<template>
  <div>
    <UHeader to="/" :ui="{ root: 'bg-default/80' }">
      <template #left>
        <NuxtLink to="/" aria-label="Inicio">
          <MarcaLogo />
        </NuxtLink>
      </template>

      <UNavigationMenu :items="enlaces" variant="link" color="neutral" :ui="{ link: 'text-[13px] font-normal' }" />

      <template #right>
        <UButton to="/plataforma" icon="i-lucide-lock" label="Plataforma" size="sm" color="primary" variant="soft" class="hidden sm:inline-flex" />
        <UButton to="/plataforma" icon="i-lucide-lock" size="sm" color="primary" variant="soft" class="sm:hidden" aria-label="Plataforma" />
      </template>

      <template #body>
        <UNavigationMenu :items="enlaces" orientation="vertical" color="neutral" class="-mx-2.5" />
        <UButton to="/plataforma" icon="i-lucide-lock" label="Acceso a la plataforma" block class="mt-6" />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <footer class="border-t border-default bg-muted">
      <UContainer class="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div class="space-y-4">
          <MarcaLogo grande />
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

const enlaces: NavigationMenuItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Directorio', to: '/directorio' },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Vinculación', to: '/vinculacion' },
  { label: 'Contacto', to: '/contacto' },
]
</script>
