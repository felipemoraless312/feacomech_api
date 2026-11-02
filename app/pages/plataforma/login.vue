<template>
  <PantallaAcceso>
    <UAuthForm
      title="Iniciar sesión"
      description="Plataforma FEACOMECH"
      :ui="{ title: 'font-display text-2xl font-semibold tracking-tight', description: 'text-[15px]', header: 'mb-8' }"
      :fields="campos"
      :schema="loginSchema"
      :loading="enviando"
      :submit="{ label: 'Continuar', block: true, size: 'xl' }"
      @submit="entrar"
    >
      <template #validation>
        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />
        <UAlert v-else-if="route.query.motivo === 'sesion'" color="warning" variant="subtle" icon="i-lucide-clock" title="Su sesión se cerró. Ingrese de nuevo." />
      </template>
      <template #footer>
        <p class="text-center text-sm">
          <NuxtLink to="/plataforma/recuperar" class="font-medium text-primary hover:underline">
            ¿Olvidó su contraseña?
          </NuxtLink>
        </p>
      </template>
    </UAuthForm>
  </PantallaAcceso>
</template>

<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginInput } from '#shared/schemas/auth'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Iniciar sesión' })

const route = useRoute()
const { fetch: refrescarSesion } = useUserSession()
const { limpiar } = usePermisos()

const campos: AuthFormField[] = [
  { name: 'email', type: 'email', label: 'Correo electrónico', placeholder: 'nombre@correo.com', required: true, autocomplete: 'username' },
  { name: 'password', type: 'password', label: 'Contraseña', required: true, autocomplete: 'current-password' },
]

const enviando = ref(false)
const error = ref('')

async function entrar(e: FormSubmitEvent<LoginInput>) {
  enviando.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: e.data })
    limpiar()
    await refrescarSesion()
    const destino = typeof route.query.r === 'string' && route.query.r.startsWith('/plataforma') ? route.query.r : '/plataforma'
    await navigateTo(destino)
  }
  catch (err) {
    error.value = errorDeApi(err).mensaje
  }
  finally {
    enviando.value = false
  }
}
</script>
