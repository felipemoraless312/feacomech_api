import { cerrarOtrasSesiones } from '../../../services/sesiones'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { sesionId } = await getUserSession(event)
  return cerrarOtrasSesiones(usuario.id, sesionId, ctx)
})
