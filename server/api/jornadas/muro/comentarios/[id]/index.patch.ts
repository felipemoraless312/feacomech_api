import { z } from 'zod'
import { moderarComentario } from '~~/server/services/muro-jornadas'

export default defineEventHandler(async (event) => {
  const { ctx } = await requireGestionJornadas(event)
  const id = idDeRuta(event)
  const { oculto } = await leerCuerpo(event, z.object({ oculto: z.boolean() }))
  await moderarComentario(id, oculto)
  await auditar(prisma, ctx, { accion: 'ACTUALIZAR', entidad: 'ComentarioMuro', entidadId: id, despues: { oculto } })
  return { ok: true }
})
