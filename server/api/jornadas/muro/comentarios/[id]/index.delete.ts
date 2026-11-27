import { eliminarComentario } from '~~/server/services/muro-jornadas'

export default defineEventHandler(async (event) => {
  const { ctx } = await requireGestionJornadas(event)
  const id = idDeRuta(event)
  await eliminarComentario(id)
  await auditar(prisma, ctx, { accion: 'ELIMINAR', entidad: 'ComentarioMuro', entidadId: id })
  return { ok: true }
})
