import { noticiaSchema } from '~~/shared/schemas/portal'
import { crearNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const datos = await leerCuerpo(event, noticiaSchema)
  setResponseStatus(event, 201)
  return crearNoticia(usuario.id, datos, ctx)
})
