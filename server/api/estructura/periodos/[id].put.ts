import { periodoSchema } from '~~/shared/schemas/estructura'
import { ambitoDeEntidad, guardarPeriodo } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const datos = await leerCuerpo(event, periodoSchema)
  const { ctx } = await exigirEstructura(event, await ambitoDeEntidad('periodo', id))
  return guardarPeriodo(id, datos, ctx)
})
