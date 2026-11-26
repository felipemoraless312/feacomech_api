import { z } from 'zod'
import { actualizarGanadorRifa } from '~~/server/services/rifa-jornadas'

/** Marcar entregado / no presente (anulado) / pendiente, o cambiar el premio. */
export default defineEventHandler(async (event) => {
  const { ctx } = await requireRifa(event)
  const id = idDeRuta(event)
  const cambios = await leerCuerpo(event, z.object({
    estado: z.enum(['PENDIENTE', 'ENTREGADO', 'ANULADO']).optional(),
    premio: z.string().trim().max(120).nullish(),
  }))
  const g = await actualizarGanadorRifa(id, cambios)
  await auditar(prisma, ctx, { accion: 'ACTUALIZAR', entidad: 'GanadorRifa', entidadId: id, despues: { nombre: g.nombre, ...cambios } })
  return g
})
