import { MAX_PORTADA, guardarPortada } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const { datos, nombre } = await leerImagenSubida(event, 'portada', MAX_PORTADA)
  await guardarPortada(usuario.id, idDeRuta(event), datos, nombre, ctx)
  return { ok: true }
})
