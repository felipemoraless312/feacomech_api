// Protege la plataforma privada y las vistas de impresión. El servidor valida de nuevo
// cada llamada a la API (requirePermiso) y oculta todo con la puerta (server/middleware/03.puerta).
export default defineNuxtRouteMiddleware(async (to) => {
  // Vue Router no distingue mayúsculas: /Plataforma/Login también abre la página.
  const ruta = to.path.toLowerCase().replace(/\/+$/, '') || '/'
  if (!ruta.startsWith('/plataforma') && !ruta.startsWith('/imprimir')) return

  const { loggedIn, user, clear } = useUserSession()
  const { cargar, puede, tieneRol, limpiar } = usePermisos()

  // Enlace del correo (activar cuenta / restablecer): el token es la credencial.
  if (ruta === '/plataforma/restablecer') return

  if (!loggedIn.value || !user.value) {
    // Al navegar dentro del sitio el servidor no interviene: se le pregunta si la puerta está
    // abierta. Si no, la plataforma "no existe" (mismo 404 que cualquier página inexistente).
    if (!(await puertaAbierta())) {
      throw createError({ statusCode: 404, statusMessage: `Page not found: ${to.fullPath}`, fatal: true })
    }
    if (ruta === '/plataforma/login' || ruta === '/plataforma/recuperar') return
    return navigateTo({ path: '/plataforma/login', query: { r: to.fullPath } })
  }

  if (ruta === '/plataforma/login') return navigateTo('/plataforma')
  if (ruta === '/plataforma/recuperar') return
  if (user.value.debeCambiarPassword) {
    return ruta === '/plataforma/cambiar-password' ? undefined : navigateTo('/plataforma/cambiar-password')
  }

  try {
    await cargar()
  }
  catch {
    // La sesión ya no es válida en el servidor (vencida, desactivada, contraseña cambiada).
    limpiar()
    await clear()
    return navigateTo({ path: '/plataforma/login', query: { r: to.fullPath, motivo: 'sesion' } })
  }

  if ((to.meta.permiso && !puede(to.meta.permiso)) || (to.meta.rol && !tieneRol(to.meta.rol))) {
    throw createError({ statusCode: 403, statusMessage: 'No tiene permiso para ver esta página', fatal: true })
  }
})
