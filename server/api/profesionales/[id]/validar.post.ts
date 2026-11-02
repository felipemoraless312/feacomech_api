import { validarPerfilSchema } from '~~/shared/schemas/organizacion'
import { validarPerfil } from '~~/server/services/profesionales'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'profesional.validar')
  const datos = await leerCuerpo(event, validarPerfilSchema)
  await validarPerfil(idDeRuta(event), datos, ctx)
  return { ok: true }
})
