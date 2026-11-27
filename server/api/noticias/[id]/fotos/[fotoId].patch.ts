import { z } from 'zod'
import { editarFotoNoticia } from '~~/server/services/noticias'

/** Cambia el pie de foto. */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const { pie } = await leerCuerpo(event, z.object({ pie: z.string().trim().max(200).nullable() }))
  await editarFotoNoticia(usuario.id, idDeRuta(event), idDeRuta(event, 'fotoId'), pie || null)
  return { ok: true }
})
