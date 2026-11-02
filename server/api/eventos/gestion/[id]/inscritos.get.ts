import { listarInscritos } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'evento.gestionar')
  return listarInscritos(idDeRuta(event), ambito)
})
