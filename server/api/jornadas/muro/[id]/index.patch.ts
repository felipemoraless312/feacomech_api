import { moderarPublicacionSchema } from '~~/shared/muro-jornadas'
import { moderarPublicacion } from '~~/server/services/muro-jornadas'

/** Aprobar, rechazar, destacar o marcar como compartida en redes. */
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireGestionJornadas(event)
  const id = idDeRuta(event)
  const cambios = await leerCuerpo(event, moderarPublicacionSchema)
  const r = await moderarPublicacion(id, usuario.id, cambios)
  if (cambios.estado) await auditar(prisma, ctx, { accion: cambios.estado === 'RECHAZADA' ? 'RECHAZAR' : 'VALIDAR', entidad: 'PublicacionMuro', entidadId: id, despues: cambios })
  return r
})
