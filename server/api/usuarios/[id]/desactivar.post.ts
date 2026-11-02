import { motivoSchema } from '../../../../shared/schemas/comunes'
import { cambiarActivo } from '../../../services/usuarios'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'usuario.administrar')
  const { motivo } = await leerCuerpo(event, motivoSchema)
  return cambiarActivo(idDeRuta(event), false, motivo, ctx)
})
