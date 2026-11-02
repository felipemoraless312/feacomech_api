import { documentoSchema } from '~~/shared/schemas/documentos'
import { MAX_DOCUMENTO, crearDocumento } from '~~/server/services/documentos'

// multipart/form-data: "datos" (JSON) y "archivo".
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`documento:${usuario.id}`, 60, 60 * 60_000)
  const { datos, archivo } = await leerDatosYArchivo(event, documentoSchema, MAX_DOCUMENTO)
  setResponseStatus(event, 201)
  return crearDocumento(usuario.id, datos, archivo!, ctx)
})
