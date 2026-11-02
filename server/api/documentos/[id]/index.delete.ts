import { eliminarDocumento } from '~~/server/services/documentos'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  await eliminarDocumento(usuario.id, idDeRuta(event), ctx)
  return { ok: true }
})
