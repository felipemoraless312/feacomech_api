import { censoQuery } from '~~/shared/schemas/censo'
import { estadisticasCenso } from '~~/server/services/censo'

export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'censo.ver')
  return estadisticasCenso(leerQuery(event, censoQuery), ambito)
})
