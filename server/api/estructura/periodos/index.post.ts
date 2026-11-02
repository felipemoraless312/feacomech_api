import { periodoSchema } from '~~/shared/schemas/estructura'
import { guardarPeriodo } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const datos = await leerCuerpo(event, periodoSchema)
  const { ctx } = await exigirEstructura(event, datos.organizacionId)
  setResponseStatus(event, 201)
  return guardarPeriodo(null, datos, ctx)
})
