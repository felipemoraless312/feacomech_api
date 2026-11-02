import { z } from 'zod'
import { ESTADOS_EVENTO } from '~~/shared/schemas/eventos'
import { cambiarEstadoEvento } from '~~/server/services/eventos'

const cuerpo = z.object({ estado: z.enum(ESTADOS_EVENTO) })

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const { estado } = await leerCuerpo(event, cuerpo)
  await cambiarEstadoEvento(idDeRuta(event), estado, ambito, ctx)
  return { ok: true }
})
