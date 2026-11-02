import { publicacionSchema } from '~~/shared/schemas/comunidad'
import { editarPublicacion } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const datos = await leerCuerpo(event, publicacionSchema)
  await editarPublicacion(usuario.id, idDeRuta(event), datos, ctx)
  return { ok: true }
})
