import { noticiaSchema } from '~~/shared/schemas/portal'
import { actualizarNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const datos = await leerCuerpo(event, noticiaSchema)
  await actualizarNoticia(usuario.id, idDeRuta(event), datos, ctx)
  return { ok: true }
})
