import { MAX_BYTES_FOTO, MAX_BYTES_MINIATURA } from '~~/shared/muro-jornadas'
import { agregarFoto, huellaDe } from '~~/server/services/muro-jornadas'

/** Otra foto para una publicación recién creada: multipart con "clave", "foto" y "miniatura". */
export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (!largo || largo > MAX_BYTES_FOTO + MAX_BYTES_MINIATURA + 64 * 1024) throw createError({ statusCode: 413, message: 'La foto es demasiado grande' })
  const partes = (await readMultipartFormData(event)) ?? []
  const clave = partes.find(p => p.name === 'clave')?.data.toString('utf8') ?? ''
  const img = imagenDe(partes)
  if (!img) throw createError({ statusCode: 400, message: 'Adjunte una foto' })
  return agregarFoto(id, huellaDe(event), clave, img)
})

/** Lee del multipart la foto y su miniatura (ambas JPEG ya reducidos por el navegador). */
function imagenDe(partes: { name?: string, data: Buffer }[]) {
  const foto = partes.find(p => p.name === 'foto')?.data
  const miniatura = partes.find(p => p.name === 'miniatura')?.data
  return foto && miniatura ? { foto, miniatura } : null
}
