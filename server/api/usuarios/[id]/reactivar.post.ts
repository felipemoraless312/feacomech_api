import { cambiarActivo } from '../../../services/usuarios'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'usuario.administrar')
  return cambiarActivo(idDeRuta(event), true, null, ctx)
})
