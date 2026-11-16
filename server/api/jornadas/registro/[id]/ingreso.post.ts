import { correccionIngresoSchema } from '~~/shared/registro-jornadas'
import { corregirIngreso } from '~~/server/services/registro-asistentes'

/** Marca o quita el ingreso de un día (correcciones de la mesa de registro). */
export default defineEventHandler(async (event) => {
  const { ctx } = await requireGestionJornadas(event)
  const id = idDeRuta(event)
  const { fecha, presente } = await leerCuerpo(event, correccionIngresoSchema)
  const r = await corregirIngreso(id, fecha, presente)
  await auditar(prisma, ctx, { accion: 'ACTUALIZAR', entidad: 'IngresoAsistente', entidadId: id, despues: { nombre: r.nombre, fecha, presente } })
  return { ok: true }
})
