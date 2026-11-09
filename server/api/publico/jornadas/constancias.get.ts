import { z } from 'zod'
import { JORNADAS_2026 } from '~~/shared/jornadas2026'
import { buscarConstancias } from '~~/server/services/participaciones'

/** Búsqueda pública de constancias de las Jornadas por correo o folio exactos. */
export default defineEventHandler(async (event) => {
  const { ip } = contextoDe(event)
  exigirFrecuencia(`constancias-jornadas:${ip}`, 20, 10 * 60_000)
  const { q } = await getValidatedQuery(event, z.object({ q: z.string().max(200) }).parse)
  return buscarConstancias(JORNADAS_2026.slug, q)
})
