import { publicacionSchema } from '~~/shared/schemas/comunidad'
import { publicar } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`publicar:${usuario.id}`, 20, 60 * 60_000)
  const datos = await leerCuerpo(event, publicacionSchema)
  setResponseStatus(event, 201)
  return publicar(usuario.id, idDeRuta(event, 'ref'), datos, ctx)
})
