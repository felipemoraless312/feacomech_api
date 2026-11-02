// Protege la plataforma privada y las vistas de impresión. El servidor valida de nuevo
// cada llamada a la API (requirePermiso).
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/plataforma') && !to.path.startsWith('/imprimir')) return

  const { loggedIn, user, clear } = useUserSession()
  const { cargar, puede, limpiar } = usePermisos()

  if (to.path === '/plataforma/login') {
    return loggedIn.value ? navigateTo('/plataforma') : undefined
  }
  // Recuperar contraseña y activar cuenta: públicas (el enlace del correo es la credencial).
  if (to.path === '/plataforma/recuperar' || to.path === '/plataforma/restablecer') return
  if (!loggedIn.value || !user.value) {
    return navigateTo({ path: '/plataforma/login', query: { r: to.fullPath } })
  }
  if (user.value.debeCambiarPassword) {
    return to.path === '/plataforma/cambiar-password' ? undefined : navigateTo('/plataforma/cambiar-password')
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

  if (to.meta.permiso && !puede(to.meta.permiso)) {
    throw createError({ statusCode: 403, statusMessage: 'No tiene permiso para ver esta página', fatal: true })
  }
})
