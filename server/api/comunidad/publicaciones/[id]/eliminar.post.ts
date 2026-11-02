import { eliminarContenidoSchema } from '~~/shared/schemas/comunidad'
import { eliminarPublicacion } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { motivo } = await leerCuerpo(event, eliminarContenidoSchema)
  await eliminarPublicacion(usuario.id, idDeRuta(event), motivo, ctx)
  return { ok: true }
})
