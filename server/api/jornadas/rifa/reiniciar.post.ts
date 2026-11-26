import { z } from 'zod'
import { reiniciarRifa } from '~~/server/services/rifa-jornadas'

/** Borra los ganadores del día: todos vuelven a participar. No toca la asistencia. */
export default defineEventHandler(async (event) => {
  const { ctx } = await requireRifa(event)
  const { fecha, confirmacion } = await leerCuerpo(event, z.object({ fecha: fechaRifaSchema, confirmacion: z.string() }))
  if (confirmacion.trim().toUpperCase() !== 'REINICIAR') throw createError({ statusCode: 400, message: 'Escriba REINICIAR para confirmar' })
  const borrados = await reiniciarRifa(fecha)
  await auditar(prisma, ctx, { accion: 'ELIMINAR', entidad: 'GanadorRifa', entidadId: fecha, despues: { fecha, borrados }, motivo: 'Reinicio de la rifa' })
  return { borrados }
})
