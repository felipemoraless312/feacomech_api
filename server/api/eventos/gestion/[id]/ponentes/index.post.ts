import { ponenteSchema } from '~~/shared/schemas/eventos'
import { guardarPonente } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const datos = await leerCuerpo(event, ponenteSchema)
  return guardarPonente(idDeRuta(event), null, datos, ambito, ctx)
})
