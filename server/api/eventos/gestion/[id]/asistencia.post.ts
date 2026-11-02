import { asistenciaSchema } from '~~/shared/schemas/eventos'
import { registrarAsistencia } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const datos = await leerCuerpo(event, asistenciaSchema)
  await registrarAsistencia(idDeRuta(event), datos, ambito, ctx)
  return { ok: true }
})
