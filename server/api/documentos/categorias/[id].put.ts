import { categoriaDocumentoSchema } from '~~/shared/schemas/documentos'
import { guardarCategoria } from '~~/server/services/documentos'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'config.administrar')
  const datos = await leerCuerpo(event, categoriaDocumentoSchema)
  return guardarCategoria(idDeRuta(event), datos, ctx)
})
