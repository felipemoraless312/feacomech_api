import { listarSesiones } from '../../../services/sesiones'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const { sesionId } = await getUserSession(event)
  return listarSesiones(usuario.id, sesionId)
})
