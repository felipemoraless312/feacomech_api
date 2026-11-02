import { z } from 'zod'
import { TIPOS_ORGANO } from '~~/shared/schemas/estructura'
import { estructuraPublica } from '~~/server/services/estructura'

const query = z.object({ tipo: z.enum(TIPOS_ORGANO).optional() })

/** Estructura vigente de la Federación (sólo nombramientos publicados). */
export default defineEventHandler((event) => {
  const { tipo } = leerQuery(event, query)
  return estructuraPublica(null, tipo ? [tipo] : undefined)
})
