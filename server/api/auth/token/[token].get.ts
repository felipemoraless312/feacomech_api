import { consultarToken } from '../../../services/accesos'
import { abrirPuerta } from '../../../utils/puerta'

/** ¿El enlace de recuperación o invitación sigue vigente? (para mostrar el formulario o un aviso) */
export default defineEventHandler(async (event) => {
  exigirFrecuencia(`token:${contextoDe(event).ip}`, 30, 15 * 60_000)
  const token = getRouterParam(event, 'token') ?? ''
  if (!/^[\w-]{43}$/.test(token)) return { valido: false as const }
  const r = await consultarToken(token)
  // Quien recibió un enlace vigente por correo ya puede ver el inicio de sesión.
  if (r.valido) abrirPuerta(event)
  return r
})
