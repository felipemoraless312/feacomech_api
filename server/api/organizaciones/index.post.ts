import { organizacionCrearSchema } from '~~/shared/schemas/organizacion'
import { crearOrganizacion } from '~~/server/services/organizaciones'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  const datos = await leerCuerpo(event, organizacionCrearSchema)
  setResponseStatus(event, 201)
  return crearOrganizacion(datos, ctx)
})
