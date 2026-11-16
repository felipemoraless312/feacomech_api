// Salvaguardas de producción: el servidor no arranca con una configuración insegura y todas
// las respuestas exigen HTTPS al navegador (HSTS). En desarrollo no hace nada.
const CLAVE_DE_EJEMPLO = 'cambia-esto-por-una-clave-aleatoria-de-32-caracteres-o-mas'

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return

  const clave = process.env.NUXT_SESSION_PASSWORD ?? ''
  if (clave.length < 32 || clave === CLAVE_DE_EJEMPLO) {
    throw new Error('NUXT_SESSION_PASSWORD debe definirse en producción con una clave aleatoria propia de 32 caracteres o más')
  }
  const puerta = (process.env.NUXT_CLAVE_ACCESO ?? '').trim()
  if (puerta && puerta.length < 24) {
    throw new Error('NUXT_CLAVE_ACCESO debe tener 24 caracteres o más (o dejarse vacía para desactivar la puerta)')
  }
  if (!puerta) {
    console.warn('[seguridad] NUXT_CLAVE_ACCESO no está definida: el inicio de sesión queda a la vista de cualquiera')
  }
  if (!process.env.NUXT_URL_PUBLICA?.startsWith('https://')) {
    console.warn('[seguridad] NUXT_URL_PUBLICA no está definida con https://; los enlaces de los correos podrían ser incorrectos')
  }

  nitroApp.hooks.hook('request', (event) => {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  })
})
