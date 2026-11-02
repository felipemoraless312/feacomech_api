import { esPorConfirmar } from '../../../shared/parametros'
import { obtenerParametro } from '../../utils/parametros'

// Datos institucionales públicos. Lo pendiente de validar ("[… por confirmar]") se envía vacío.
export default defineEventHandler(async () => {
  const datos = await obtenerParametro('institucion')
  return Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, esPorConfirmar(v) ? '' : v])) as typeof datos
})
