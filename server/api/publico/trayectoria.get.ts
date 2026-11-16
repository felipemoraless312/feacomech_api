import { obtenerParametro } from '~~/server/utils/parametros'

/** Hitos de la trayectoria de la Federación (se capturan en Configuración → Página de inicio). */
export default defineEventHandler(async () => {
  const portada = await obtenerParametro('portada')
  return portada.hitos
})
