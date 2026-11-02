import { noticiasQuery } from '~~/shared/schemas/portal'
import { listarNoticias } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  return listarNoticias(usuario.id, leerQuery(event, noticiasQuery))
})
