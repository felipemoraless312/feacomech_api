import { obtenerNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  return obtenerNoticia(usuario.id, idDeRuta(event))
})
