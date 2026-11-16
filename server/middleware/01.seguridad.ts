// Cabeceras de seguridad para todas las respuestas.
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  })
  // Nada que dependa de la sesión debe quedar en caché de navegador o proxy.
  if (event.path.startsWith('/api/') || event.path.startsWith('/plataforma') || event.path.startsWith('/imprimir') || event.path.startsWith('/acceso')) {
    setResponseHeader(event, 'Cache-Control', 'no-store')
  }
  // La plataforma no se anuncia en robots.txt (sería señalarla): se excluye de buscadores aquí.
  if (event.path.startsWith('/plataforma') || event.path.startsWith('/imprimir') || event.path.startsWith('/acceso')) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
  // Registro en sede de las Jornadas: enlace oculto (QR), fuera de buscadores y cachés.
  if (event.path.startsWith('/jornadas-2026/registro')) {
    setResponseHeaders(event, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' })
  }
})
