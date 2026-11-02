import { rolCrearSchema } from '../../../shared/schemas/rol'
import { crearRol } from '../../services/roles'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'rol.administrar')
  const datos = await leerCuerpo(event, rolCrearSchema)
  setResponseStatus(event, 201)
  return crearRol(datos, ctx)
})
