import { especialidadSchema } from '../../../shared/schemas/perfil'
import { crearEspecialidad } from '../../services/especialidades'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'config.administrar')
  const datos = await leerCuerpo(event, especialidadSchema)
  setResponseStatus(event, 201)
  return crearEspecialidad(datos, ctx)
})
