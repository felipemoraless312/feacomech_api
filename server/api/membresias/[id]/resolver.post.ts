import { resolverSchema } from '~~/shared/schemas/organizacion'
import { resolverMembresia } from '~~/server/services/membresias'

/** La Federación valida o rechaza una solicitud de alta. */
export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'afiliacion.validar')
  const datos = await leerCuerpo(event, resolverSchema)
  return resolverMembresia(idDeRuta(event), datos, ctx)
})
