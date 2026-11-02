import { actividadSchema } from '~~/shared/schemas/eventos'
import { guardarActividad } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const datos = await leerCuerpo(event, actividadSchema)
  return guardarActividad(idDeRuta(event), null, datos, ambito, ctx)
})
