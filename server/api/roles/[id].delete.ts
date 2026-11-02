import { eliminarRol } from '../../services/roles'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'rol.administrar')
  await eliminarRol(idDeRuta(event), ctx)
  return { ok: true }
})
