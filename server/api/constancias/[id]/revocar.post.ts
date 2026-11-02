import { motivoSchema } from '~~/shared/schemas/comunes'
import { revocarConstancia } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'constancia.emitir')
  const { motivo } = await leerCuerpo(event, motivoSchema)
  await revocarConstancia(idDeRuta(event), motivo, ambito, ctx)
  return { ok: true }
})
