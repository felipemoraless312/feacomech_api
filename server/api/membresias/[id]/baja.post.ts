import { bajaSchema } from '~~/shared/schemas/organizacion'
import { darDeBaja } from '~~/server/services/membresias'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'afiliacion.validar')
  const datos = await leerCuerpo(event, bajaSchema)
  await darDeBaja(idDeRuta(event), datos, ctx)
  return { ok: true }
})
