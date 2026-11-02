import { obtenerConfiguracion } from '../../services/configuracion'

export default defineEventHandler(async (event) => {
  await requirePermiso(event, 'config.administrar')
  return obtenerConfiguracion()
})
