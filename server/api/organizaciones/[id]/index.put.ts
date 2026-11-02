import { organizacionSchema } from '~~/shared/schemas/organizacion'
import { actualizarOrganizacion } from '~~/server/services/organizaciones'

/** Edición directa (Federación). Los representantes proponen cambios con /propuesta. */
export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  const datos = await leerCuerpo(event, organizacionSchema)
  return actualizarOrganizacion(idDeRuta(event), datos, ctx)
})
