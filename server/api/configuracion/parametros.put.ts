import { z } from 'zod'
import { DEFINICION_PARAMETROS } from '../../../shared/parametros'
import { guardarParametro } from '../../services/configuracion'

const cuerpo = z.object({ sesionInactividadMinutos: DEFINICION_PARAMETROS.sesionInactividadMinutos.schema })

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'config.administrar')
  const datos = await leerCuerpo(event, cuerpo)
  await guardarParametro('sesionInactividadMinutos', datos.sesionInactividadMinutos, ctx)
  return datos
})
