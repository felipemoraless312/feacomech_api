import { transicionNoticiaSchema } from '~~/shared/schemas/portal'
import { transicionNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const datos = await leerCuerpo(event, transicionNoticiaSchema)
  await transicionNoticia(usuario.id, idDeRuta(event), datos, ctx)
  return { ok: true }
})
