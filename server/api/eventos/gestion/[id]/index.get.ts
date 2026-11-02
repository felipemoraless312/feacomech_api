import { obtenerEventoGestion } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'evento.gestionar')
  return obtenerEventoGestion(idDeRuta(event), ambito)
})
