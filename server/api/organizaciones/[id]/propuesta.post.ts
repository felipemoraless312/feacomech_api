import { datosOrganizacionSchema } from '~~/shared/schemas/organizacion'
import { proponerCambio } from '~~/server/services/organizaciones'

/** El representante propone cambios a los datos; se aplican cuando la Federación los aprueba. */
export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const { ctx } = await requirePermisoEn(event, 'organizacion.editar', id)
  const datos = await leerCuerpo(event, datosOrganizacionSchema)
  return proponerCambio(id, datos, ctx)
})
