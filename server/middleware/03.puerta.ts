// Oculta la plataforma privada a quien no tenga sesión ni la cookie de la puerta
// (ver server/utils/puerta.ts). Corre después de 02.sesion, que ya descartó sesiones vencidas.
import {
  abrirPuerta,
  esClaveCorrecta,
  esEnlaceDeCorreo,
  esPrivada,
  noEncontrado,
  PREFIJO_ENLACE,
  puertaActiva,
  rutaNormalizada,
  tienePuerta,
} from '../utils/puerta'

export default defineEventHandler(async (event) => {
  if (!puertaActiva()) return
  const ruta = rutaNormalizada(event.path)

  // Enlace secreto: /acceso/<clave>. Con clave incorrecta sigue su curso y da el 404 normal.
  if (ruta.startsWith(PREFIJO_ENLACE)) {
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'desconocida'
    // Frena el barrido de claves: tras 20 intentos por hora, ni la correcta funciona.
    if (!permitirIntento(`puerta:${ip}`, 20, 60 * 60_000)) return
    const candidata = (event.path.split('?')[0] ?? '').slice(PREFIJO_ENLACE.length).replace(/\/+$/, '')
    if (esClaveCorrecta(candidata)) {
      abrirPuerta(event)
      setResponseHeaders(event, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer' })
      return sendRedirect(event, '/plataforma/login', 302)
    }
    return
  }

  if (!esPrivada(ruta)) return
  if (tienePuerta(event)) return

  const { user } = await getUserSession(event)
  if (user) {
    // Sesiones abiertas antes de activar la puerta: reciben la cookie sin notarlo.
    abrirPuerta(event)
    return
  }
  if (esEnlaceDeCorreo(ruta, getQuery(event).token)) return

  throw noEncontrado(event.path)
})
