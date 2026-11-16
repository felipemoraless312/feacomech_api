import { registroAsistenteSchema } from '~~/shared/registro-jornadas'
import { registrarAsistente } from '~~/server/services/registro-asistentes'

/** Registro desde la mesa (personal de la Federación). */
export default defineEventHandler(async (event) => {
  const { ctx } = await requireGestionJornadas(event)
  const r = await registrarAsistente(await leerCuerpo(event, registroAsistenteSchema), 'MESA')
  if (!r.yaRegistrado) await auditar(prisma, ctx, { accion: 'CREAR', entidad: 'RegistroAsistente', entidadId: r.id, despues: { nombre: r.nombre } })
  return r
})
