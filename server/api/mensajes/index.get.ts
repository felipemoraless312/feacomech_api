import { mensajesQuery } from '~~/shared/schemas/portal'
import { listarMensajes } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  await requirePermiso(event, 'contacto.ver')
  return listarMensajes(leerQuery(event, mensajesQuery))
})
