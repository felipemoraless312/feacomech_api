import { usuarioAdminSchema } from '../../../../shared/schemas/usuario'
import { actualizarUsuario } from '../../../services/usuarios'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'usuario.administrar')
  const datos = await leerCuerpo(event, usuarioAdminSchema)
  return actualizarUsuario(idDeRuta(event), datos, ctx)
})
