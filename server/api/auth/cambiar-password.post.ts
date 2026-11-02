import { cambiarPasswordSchema } from '../../../shared/schemas/auth'
import { cambiarContrasena } from '../../services/auth'

export default defineEventHandler(async (event) => {
  const actual = await requireUsuario(event)
  const { sesionId } = await getUserSession(event)
  const datos = await leerCuerpo(event, cambiarPasswordSchema)
  const usuario = await cambiarContrasena(actual.id, datos, contextoDe(event, actual.id), sesionId)
  // La versión de sesión cambió: se emite una cookie nueva para esta sesión (las demás se cerraron).
  await replaceUserSession(event, { user: usuario, sesionId })
  return { usuario }
})
