import { organoSchema } from '~~/shared/schemas/estructura'
import { guardarOrgano } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const datos = await leerCuerpo(event, organoSchema)
  const { ctx } = await exigirEstructura(event, datos.organizacionId)
  setResponseStatus(event, 201)
  return guardarOrgano(null, datos, ctx)
})
