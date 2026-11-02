import { vinculoSchema } from '~~/shared/schemas/portal'
import { guardarVinculo } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'contenido.administrar')
  const datos = await leerCuerpo(event, vinculoSchema)
  setResponseStatus(event, 201)
  return guardarVinculo(null, datos, ctx)
})
