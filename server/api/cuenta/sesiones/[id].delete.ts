import { cerrarSesionPropia } from '../../../services/sesiones'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { sesionId } = await getUserSession(event)
  await cerrarSesionPropia(usuario.id, idDeRuta(event), sesionId, ctx)
  return { ok: true }
})
