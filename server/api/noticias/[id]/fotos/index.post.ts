import { MAX_FOTO_NOTICIA, agregarFotoNoticia } from '~~/server/services/noticias'

/** Agrega una foto a la galería: multipart con "foto" y, opcional, "pie". */
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (largo > MAX_FOTO_NOTICIA + 64 * 1024) throw createError({ statusCode: 413, message: `La foto supera el máximo de ${MAX_FOTO_NOTICIA / 1024 / 1024} MB` })
  const partes = (await readMultipartFormData(event)) ?? []
  const foto = partes.find(p => p.name === 'foto' && p.filename)
  if (!foto) throw createError({ statusCode: 400, message: 'Adjunte una foto' })
  const pie = partes.find(p => p.name === 'pie')?.data.toString('utf8').trim().slice(0, 200) || null
  return agregarFotoNoticia(usuario.id, idDeRuta(event), foto.data, foto.filename!, pie, ctx)
})
