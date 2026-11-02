import { eventoSchema } from '~~/shared/schemas/eventos'
import { crearEvento } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const datos = await leerCuerpo(event, eventoSchema)
  setResponseStatus(event, 201)
  return crearEvento(datos, ambito, ctx)
})
