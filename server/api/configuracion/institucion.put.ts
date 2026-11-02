import { datosInstitucionSchema } from '../../../shared/parametros'
import { guardarParametro } from '../../services/configuracion'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'config.administrar')
  const datos = await leerCuerpo(event, datosInstitucionSchema)
  await guardarParametro('institucion', datos, ctx)
  return datos
})
