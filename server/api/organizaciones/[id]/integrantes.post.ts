import { altaIntegranteSchema } from '~~/shared/schemas/organizacion'
import { solicitarAlta } from '~~/server/services/membresias'

/** Solicitud de alta de un integrante (la valida la Federación). */
export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const { ctx } = await requirePermisoEn(event, 'afiliacion.solicitar', id)
  const datos = await leerCuerpo(event, altaIntegranteSchema)
  setResponseStatus(event, 201)
  return solicitarAlta(id, datos, ctx)
})
