import { eventosQuery } from '~~/shared/schemas/eventos'
import { listarEventosGestion } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'evento.gestionar')
  return listarEventosGestion(leerQuery(event, eventosQuery), ambito)
})
