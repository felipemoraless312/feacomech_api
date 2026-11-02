import { organizacionListaQuery } from '~~/shared/schemas/organizacion'
import { listarOrganizaciones } from '~~/server/services/organizaciones'

// Con alcance de organización sólo ve las suyas.
export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'organizacion.ver')
  return listarOrganizaciones(leerQuery(event, organizacionListaQuery), ambito)
})
