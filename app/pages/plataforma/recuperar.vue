<template>
  <PantallaAcceso>
    <div v-if="enviado" class="space-y-4 text-center">
      <span class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600">
        <UIcon name="i-lucide-mail-check" class="size-6" />
      </span>
      <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        Revise su correo
      </h1>
      <p class="text-sm text-muted">
        Si <strong class="text-highlighted">{{ estado.email }}</strong> corresponde a una cuenta activa, recibirá un
        enlace para definir una nueva contraseña. Es válido durante 30 minutos.
      </p>
      <p class="text-xs text-dimmed">
        ¿No llegó? Revise la carpeta de correo no deseado o solicítelo de nuevo en unos minutos.
      </p>
      <UButton to="/plataforma/login" label="Volver a iniciar sesión" color="neutral" variant="ghost" block />
    </div>

    <template v-else>
      <div class="mb-8 space-y-2 text-center">
        <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
          Recuperar contraseña
        </h1>
        <p class="text-sm text-muted">
          Escriba el correo de su cuenta y le enviaremos un enlace para definir una nueva.
        </p>
      </div>
      <UForm :schema="recuperarSchema" :state="estado" class="space-y-4" @submit="enviar">
        <UFormField label="Correo electrónico" name="email" required>
          <UInput v-model="estado.email" type="email" autocomplete="username" placeholder="nombre@correo.com" class="w-full" />
        </UFormField>
        <AlertaError :mensaje="error" />
        <UButton type="submit" label="Enviar enlace" block size="xl" :loading="enviando" />
        <UButton to="/plataforma/login" label="Volver" color="neutral" variant="ghost" block />
      </UForm>
    </template>
  </PantallaAcceso>
</template>

<script setup lang="ts">
import { recuperarSchema } from '#shared/schemas/auth'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Recuperar contraseña' })

const estado = reactive({ email: '' })
const enviado = ref(false)
const { enviando, error, enviar: ejecutar } = useEnvio()

async function enviar() {
  const r = await ejecutar(() => $fetch('/api/auth/recuperar', { method: 'POST', body: estado }))
  if (r.ok) enviado.value = true
}
</script>
