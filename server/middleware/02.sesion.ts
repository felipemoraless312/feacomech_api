// Valida en cada petición que la sesión siga vigente (tabla Sesion):
//  - no fue cerrada (logout, desde otro dispositivo, cambio de contraseña…);
//  - el usuario sigue activo y su versionSesion no cambió;
//  - no venció por inactividad (parámetro sesionInactividadMinutos) ni por vida máxima.
// Si no es válida, borra la cookie: la API responde 401 y el cliente lleva al inicio de sesión.
import { validarSesion } from '../services/sesiones'

const ESTATICO = /^\/(_nuxt|__nuxt|_ipx|_fonts|favicon)|\.[a-z0-9]{2,5}$/i

export default defineEventHandler(async (event) => {
  if (ESTATICO.test(event.path)) return

  const sesion = await getUserSession(event)
  if (!sesion.user) return

  const vigente = sesion.sesionId
    ? await validarSesion(sesion.sesionId, sesion.user.id, sesion.user.versionSesion)
    : false
  if (!vigente) await clearUserSession(event)
})
