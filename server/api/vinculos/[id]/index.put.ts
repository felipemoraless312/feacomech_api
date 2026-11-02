import { vinculoSchema } from '~~/shared/schemas/portal'
import { guardarVinculo } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'contenido.administrar')
  const datos = await leerCuerpo(event, vinculoSchema)
  return guardarVinculo(idDeRuta(event), datos, ctx)
})
