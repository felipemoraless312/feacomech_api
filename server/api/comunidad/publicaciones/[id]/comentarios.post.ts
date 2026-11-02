import { comentarioSchema } from '~~/shared/schemas/comunidad'
import { comentar } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`comentar:${usuario.id}`, 60, 60 * 60_000)
  const datos = await leerCuerpo(event, comentarioSchema)
  setResponseStatus(event, 201)
  return comentar(usuario.id, idDeRuta(event), datos, ctx)
})
