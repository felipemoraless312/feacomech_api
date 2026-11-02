import { obtenerParametro } from '~~/server/utils/parametros'

export default defineEventHandler(async (event) => {
  await requirePermiso(event, 'contenido.administrar')
  return obtenerParametro('portada')
})
