import { rolSchema } from '../../../shared/schemas/rol'
import { actualizarRol } from '../../services/roles'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'rol.administrar')
  const datos = await leerCuerpo(event, rolSchema)
  await actualizarRol(idDeRuta(event), datos, ctx)
  return { ok: true }
})
