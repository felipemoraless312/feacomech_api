import { grupoSchema } from '~~/shared/schemas/comunidad'
import { crearGrupo } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const datos = await leerCuerpo(event, grupoSchema)
  setResponseStatus(event, 201)
  return crearGrupo(usuario.id, datos, ctx)
})
