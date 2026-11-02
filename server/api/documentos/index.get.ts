import { documentosQuery } from '~~/shared/schemas/documentos'
import { listarDocumentos } from '~~/server/services/documentos'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return listarDocumentos(usuario.id, leerQuery(event, documentosQuery))
})
