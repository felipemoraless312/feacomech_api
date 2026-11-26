import { z } from 'zod'
import { girarRifa } from '~~/server/services/rifa-jornadas'

/** Sortea los ganadores de un giro (el sorteo real ocurre aquí, no en el navegador). */
export default defineEventHandler(async (event) => {
  const { ctx } = await requireRifa(event)
  const { fecha, cantidad, premio } = await leerCuerpo(event, z.object({
    fecha: fechaRifaSchema,
    cantidad: z.number().int().min(1).max(20).default(1),
    premio: z.string().trim().max(120).nullish().transform(p => p || null),
  }))
  const ganadores = await girarRifa(fecha, cantidad, premio)
  await auditar(prisma, ctx, { accion: 'CREAR', entidad: 'GanadorRifa', entidadId: ganadores[0]!.id, despues: { fecha, premio, ganadores: ganadores.map(g => `#${g.numero} ${g.nombre}`) } })
  return ganadores
})
