import { MAX_BYTES_FOTO, MAX_BYTES_MINIATURA, nuevaPublicacionSchema } from '~~/shared/muro-jornadas'
import { crearPublicacion, huellaDe } from '~~/server/services/muro-jornadas'

/** Nueva publicación: multipart con "datos" (JSON) y, opcionalmente, "foto" + "miniatura". */
export default defineEventHandler(async (event) => {
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (!largo || largo > MAX_BYTES_FOTO + MAX_BYTES_MINIATURA + 64 * 1024) throw createError({ statusCode: 413, message: 'La foto es demasiado grande' })
  const partes = (await readMultipartFormData(event)) ?? []
  let crudo: unknown
  try {
    crudo = JSON.parse(partes.find(p => p.name === 'datos')?.data.toString('utf8') ?? '')
  }
  catch {
    throw createError({ statusCode: 400, message: 'Datos no válidos' })
  }
  return crearPublicacion(huellaDe(event), validar(nuevaPublicacionSchema, crudo), imagenDe(partes))
})

/** Lee del multipart la foto y su miniatura (ambas JPEG ya reducidos por el navegador). */
function imagenDe(partes: { name?: string, data: Buffer }[]) {
  const foto = partes.find(p => p.name === 'foto')?.data
  const miniatura = partes.find(p => p.name === 'miniatura')?.data
  return foto && miniatura ? { foto, miniatura } : null
}
