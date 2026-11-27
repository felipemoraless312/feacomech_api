import { z } from 'zod'
import { ordenarFotosNoticia } from '~~/server/services/noticias'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireAlguno(event, ['noticia.publicar', 'noticia.administrar'])
  const { ids } = await leerCuerpo(event, z.object({ ids: z.array(z.uuid()).max(100) }))
  await ordenarFotosNoticia(usuario.id, idDeRuta(event), ids)
  return { ok: true }
})
