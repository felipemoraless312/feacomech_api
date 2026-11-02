import { ambitoEstructuraQuery } from '~~/shared/schemas/estructura'
import { obtenerEstructura } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const { organizacionId } = leerQuery(event, ambitoEstructuraQuery)
  await exigirEstructura(event, organizacionId ?? null)
  return obtenerEstructura(organizacionId ?? null)
})
