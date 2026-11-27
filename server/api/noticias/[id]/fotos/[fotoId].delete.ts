import { eliminarFotoNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  await eliminarFotoNoticia(usuario.id, idDeRuta(event), idDeRuta(event, 'fotoId'), ctx)
  return { ok: true }
})
