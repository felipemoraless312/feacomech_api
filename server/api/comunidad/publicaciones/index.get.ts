import { publicacionesQuery } from '~~/shared/schemas/comunidad'
import { listarPublicaciones } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return listarPublicaciones(usuario.id, leerQuery(event, publicacionesQuery))
})
