import { profesionalesQuery } from '~~/shared/schemas/organizacion'
import { listarProfesionales } from '~~/server/services/profesionales'

export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'profesional.ver')
  return listarProfesionales(leerQuery(event, profesionalesQuery), ambito)
})
