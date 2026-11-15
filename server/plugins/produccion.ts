// Salvaguardas de producción: el servidor no arranca con una configuración insegura y todas
// las respuestas exigen HTTPS al navegador (HSTS). En desarrollo no hace nada.
const CLAVE_DE_EJEMPLO = 'cambia-esto-por-una-clave-aleatoria-de-32-caracteres-o-mas'

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return

  const clave = process.env.NUXT_SESSION_PASSWORD ?? ''
  if (clave.length < 32 || clave === CLAVE_DE_EJEMPLO) {
    throw new Error('NUXT_SESSION_PASSWORD debe definirse en producción con una clave aleatoria propia de 32 caracteres o más')
  }
  if (!process.env.NUXT_URL_PUBLICA?.startsWith('https://')) {
    console.warn('[seguridad] NUXT_URL_PUBLICA no está definida con https://; los enlaces de los correos podrían ser incorrectos')
  }

  nitroApp.hooks.hook('request', (event) => {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  })
})
