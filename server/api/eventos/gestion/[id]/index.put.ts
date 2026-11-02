import { eventoSchema } from '~~/shared/schemas/eventos'
import { actualizarEvento } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const datos = await leerCuerpo(event, eventoSchema)
  await actualizarEvento(idDeRuta(event), datos, ambito, ctx)
  return { ok: true }
})
