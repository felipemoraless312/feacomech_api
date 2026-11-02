import { moderarSchema } from '~~/shared/schemas/comunidad'
import { resolverReporte } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const datos = await leerCuerpo(event, moderarSchema)
  await resolverReporte(usuario.id, idDeRuta(event), datos, ctx)
  return { ok: true }
})
