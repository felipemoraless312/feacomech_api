import { representanteSchema } from '~~/shared/schemas/organizacion'
import { asignarRepresentante } from '~~/server/services/organizaciones'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  const { usuarioId, rolId } = await leerCuerpo(event, representanteSchema)
  await asignarRepresentante(idDeRuta(event), usuarioId, rolId, ctx)
  return { ok: true }
})
