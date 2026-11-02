import { categoriaDocumentoSchema } from '~~/shared/schemas/documentos'
import { guardarCategoria } from '~~/server/services/documentos'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'config.administrar')
  const datos = await leerCuerpo(event, categoriaDocumentoSchema)
  setResponseStatus(event, 201)
  return guardarCategoria(null, datos, ctx)
})
