import { eliminarPublicacion } from '~~/server/services/muro-jornadas'

export default defineEventHandler(async (event) => {
  const { ctx } = await requireGestionJornadas(event)
  const id = idDeRuta(event)
  await eliminarPublicacion(id)
  await auditar(prisma, ctx, { accion: 'ELIMINAR', entidad: 'PublicacionMuro', entidadId: id })
  return { ok: true }
})
