import { organoSchema } from '~~/shared/schemas/estructura'
import { ambitoDeEntidad, guardarOrgano } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const datos = await leerCuerpo(event, organoSchema)
  const actual = await ambitoDeEntidad('organo', id)
  if (actual !== datos.organizacionId) throw createError({ statusCode: 400, message: 'El órgano no puede cambiar de ámbito' })
  const { ctx } = await exigirEstructura(event, actual)
  return guardarOrgano(id, datos, ctx)
})
