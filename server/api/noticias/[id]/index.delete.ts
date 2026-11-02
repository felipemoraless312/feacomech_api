import { eliminarNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  await eliminarNoticia(usuario.id, idDeRuta(event), ctx)
  return { ok: true }
})
