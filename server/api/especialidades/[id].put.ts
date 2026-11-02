import { especialidadSchema } from '../../../shared/schemas/perfil'
import { actualizarEspecialidad } from '../../services/especialidades'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'config.administrar')
  const datos = await leerCuerpo(event, especialidadSchema)
  return actualizarEspecialidad(idDeRuta(event), datos, ctx)
})
