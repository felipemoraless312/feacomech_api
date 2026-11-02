import { MAX_ADJUNTO, MAX_ADJUNTOS_POR_PUBLICACION, adjuntar } from '~~/server/services/comunidad'

// multipart/form-data con uno o varios campos "archivo" (JPG, PNG, WebP o PDF; 10 MB c/u).
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`adjuntar:${usuario.id}`, 30, 60 * 60_000)
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (largo > MAX_ADJUNTO * MAX_ADJUNTOS_POR_PUBLICACION + 256 * 1024) throw createError({ statusCode: 413, message: 'Los archivos superan el tamaño permitido' })
  const partes = (await readMultipartFormData(event))?.filter(p => p.name === 'archivo' && p.filename) ?? []
  if (!partes.length) throw createError({ statusCode: 400, message: 'Adjunte al menos un archivo' })
  await adjuntar(usuario.id, idDeRuta(event), partes.map(p => ({ datos: p.data, nombre: p.filename! })), ctx)
  return { ok: true }
})
