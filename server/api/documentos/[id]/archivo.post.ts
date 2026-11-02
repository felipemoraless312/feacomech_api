import { z } from 'zod'
import { MAX_DOCUMENTO, reemplazarArchivo } from '~~/server/services/documentos'

/** Nueva versión del archivo (multipart con "archivo"). */
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { archivo } = await leerDatosYArchivo(event, z.unknown(), MAX_DOCUMENTO)
  await reemplazarArchivo(usuario.id, idDeRuta(event), archivo!, ctx)
  return { ok: true }
})
