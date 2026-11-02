import { integrantesQuery } from '~~/shared/schemas/organizacion'
import { listarIntegrantes } from '~~/server/services/membresias'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  await requirePermisoEn(event, 'organizacion.ver', id)
  return listarIntegrantes(id, leerQuery(event, integrantesQuery))
})
