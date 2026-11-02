import { documentoSchema } from '~~/shared/schemas/documentos'
import { actualizarDocumento } from '~~/server/services/documentos'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const datos = await leerCuerpo(event, documentoSchema)
  await actualizarDocumento(usuario.id, idDeRuta(event), datos, ctx)
  return { ok: true }
})
