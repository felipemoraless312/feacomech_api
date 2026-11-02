import { usuarioAdminSchema } from '../../../shared/schemas/usuario'
import { crearUsuario } from '../../services/usuarios'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'usuario.administrar')
  const datos = await leerCuerpo(event, usuarioAdminSchema)
  setResponseStatus(event, 201)
  return crearUsuario(datos, ctx)
})
