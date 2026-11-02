<!-- Definir contraseña con el enlace del correo: recuperación o activación de cuenta nueva -->
<template>
  <PantallaAcceso>
    <div v-if="status === 'pending'" class="flex justify-center py-10">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else-if="listo" class="space-y-4 text-center">
      <span class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600">
        <UIcon name="i-lucide-check" class="size-6" />
      </span>
      <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        {{ esInvitacion ? 'Cuenta activada' : 'Contraseña actualizada' }}
      </h1>
      <p class="text-sm text-muted">
        Ya puede iniciar sesión con su correo y la contraseña que acaba de definir.
      </p>
      <UButton :to="{ path: '/plataforma/login' }" label="Iniciar sesión" block size="xl" />
    </div>

    <div v-else-if="!consulta?.valido" class="space-y-4 text-center">
      <span class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <UIcon name="i-lucide-link-2-off" class="size-6" />
      </span>
      <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        Enlace no válido
      </h1>
      <p class="text-sm text-muted">
        El enlace ya se usó, venció o está incompleto. Solicite uno nuevo.
      </p>
      <UButton to="/plataforma/recuperar" label="Solicitar un enlace nuevo" block size="xl" />
      <UButton to="/plataforma/login" label="Iniciar sesión" color="neutral" variant="ghost" block />
    </div>

    <template v-else>
      <div class="mb-8 space-y-2 text-center">
        <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
          {{ esInvitacion ? 'Active su cuenta' : 'Nueva contraseña' }}
        </h1>
        <p class="text-sm text-muted">
          {{ consulta.nombre }}, defina la contraseña para <strong class="text-highlighted">{{ consulta.email }}</strong>.
        </p>
      </div>
      <UForm ref="form" :schema="restablecerSchema" :state="estado" class="space-y-4" @submit="guardar">
        <UFormField label="Nueva contraseña" name="nueva" required help="Mínimo 10 caracteres, con letras y números.">
          <UInput v-model="estado.nueva" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>
        <UFormField label="Confirmar contraseña" name="confirmacion" required>
          <UInput v-model="estado.confirmacion" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>
        <AlertaError :mensaje="error" />
        <UButton type="submit" :label="esInvitacion ? 'Activar cuenta' : 'Guardar contraseña'" block size="xl" :loading="enviando" />
      </UForm>
    </template>
  </PantallaAcceso>
</template>

<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { restablecerSchema, type RestablecerInput } from '#shared/schemas/auth'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Definir contraseña', robots: 'noindex' })

const route = useRoute()
const token = typeof route.query.token === 'string' ? route.query.token : ''

const { data: consulta, status } = await useFetch(`/api/auth/token/${encodeURIComponent(token || 'x')}`, { server: false })
const esInvitacion = computed(() => consulta.value?.valido && consulta.value.tipo === 'INVITACION')

const form = useTemplateRef<Form<RestablecerInput>>('form')
const estado = reactive<RestablecerInput>({ token, nueva: '', confirmacion: '' })
const listo = ref(false)
const { enviando, error, enviar } = useEnvio(form)

async function guardar() {
  const r = await enviar(() => $fetch('/api/auth/restablecer', { method: 'POST', body: estado }))
  if (r.ok) {
    await useUserSession().clear()
    listo.value = true
  }
}
</script>
