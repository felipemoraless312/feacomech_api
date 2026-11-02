import { registrarLogout } from '../../services/auth'
import { cerrarSesion } from '../../services/sesiones'

export default defineEventHandler(async (event) => {
  const { user, sesionId } = await getUserSession(event)
  if (sesionId) await cerrarSesion(sesionId, 'LOGOUT')
  if (user) await registrarLogout({ ...contextoDe(event), usuarioId: user.id })
  await clearUserSession(event)
  return { ok: true }
})
