import { estadoAfiliacionSchema } from '~~/shared/schemas/organizacion'
import { cambiarEstadoAfiliacion } from '~~/server/services/organizaciones'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  const datos = await leerCuerpo(event, estadoAfiliacionSchema)
  await cambiarEstadoAfiliacion(idDeRuta(event), datos, ctx)
  return { ok: true }
})
