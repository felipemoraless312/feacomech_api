import { z } from 'zod'
import { resolverCambio } from '~~/server/services/organizaciones'

const cuerpo = z.object({
  aprobar: z.boolean(),
  motivo: z.string().trim().max(500).optional().nullable().transform(v => (v ? v : null)),
})

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  const { aprobar, motivo } = await leerCuerpo(event, cuerpo)
  await resolverCambio(idDeRuta(event), aprobar, motivo, ctx)
  return { ok: true }
})
