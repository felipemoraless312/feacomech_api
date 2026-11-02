<template>
  <PantallaAcceso>
    <div class="mb-8 space-y-2 text-center">
      <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        Cambiar contraseña
      </h1>
      <p class="text-sm text-muted">
        <template v-if="user?.debeCambiarPassword">
          Por seguridad, defina una contraseña personal antes de continuar.
        </template>
        <template v-else>
          Al cambiarla se cerrarán sus sesiones abiertas en otros equipos.
        </template>
      </p>
    </div>

    <UForm ref="form" :schema="cambiarPasswordSchema" :state="estado" class="space-y-4" @submit="guardar">
      <UFormField label="Contraseña actual" name="actual" required>
        <UInput v-model="estado.actual" type="password" autocomplete="current-password" class="w-full" />
      </UFormField>
      <UFormField label="Nueva contraseña" name="nueva" required help="Mínimo 10 caracteres, con letras y números.">
        <UInput v-model="estado.nueva" type="password" autocomplete="new-password" class="w-full" />
      </UFormField>
      <UFormField label="Confirmar nueva contraseña" name="confirmacion" required>
        <UInput v-model="estado.confirmacion" type="password" autocomplete="new-password" class="w-full" />
      </UFormField>

      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

      <UButton type="submit" label="Guardar contraseña" block size="xl" :loading="enviando" class="mt-2" />
      <UButton v-if="!user?.debeCambiarPassword" to="/plataforma" label="Cancelar" color="neutral" variant="ghost" block />
    </UForm>
  </PantallaAcceso>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { cambiarPasswordSchema, type CambiarPasswordInput } from '#shared/schemas/auth'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Cambiar contraseña' })

const { user, fetch: refrescarSesion } = useUserSession()
const toast = useToast()

const form = useTemplateRef<Form<CambiarPasswordInput>>('form')
const estado = reactive<CambiarPasswordInput>({ actual: '', nueva: '', confirmacion: '' })
const enviando = ref(false)
const error = ref('')

async function guardar() {
  enviando.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/cambiar-password', { method: 'POST', body: estado })
    await refrescarSesion()
    toast.add({ title: 'Contraseña actualizada', color: 'success', icon: 'i-lucide-check' })
    await navigateTo('/plataforma')
  }
  catch (e) {
    const { mensaje, campos } = errorDeApi(e)
    error.value = mensaje
    form.value?.setErrors(Object.entries(campos).map(([name, message]) => ({ name, message })))
  }
  finally {
    enviando.value = false
  }
}
</script>
