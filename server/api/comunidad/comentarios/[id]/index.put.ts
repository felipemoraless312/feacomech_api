import { comentarioSchema } from '~~/shared/schemas/comunidad'
import { editarComentario } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { contenido } = await leerCuerpo(event, comentarioSchema)
  await editarComentario(usuario.id, idDeRuta(event), contenido, ctx)
  return { ok: true }
})
