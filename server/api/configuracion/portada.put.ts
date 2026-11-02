import { portadaSchema } from '~~/shared/parametros'
import { guardarParametro } from '~~/server/services/configuracion'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'contenido.administrar')
  const datos = await leerCuerpo(event, portadaSchema)
  await guardarParametro('portada', datos, ctx)
  return datos
})
