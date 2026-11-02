// Cabeceras de seguridad para todas las respuestas.
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  })
  // Nada que dependa de la sesión debe quedar en caché de navegador o proxy.
  if (event.path.startsWith('/api/') || event.path.startsWith('/plataforma') || event.path.startsWith('/imprimir')) {
    setResponseHeader(event, 'Cache-Control', 'no-store')
  }
})
