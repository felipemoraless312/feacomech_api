import { z } from 'zod'
import { publicacionesAprobadas } from '~~/server/services/muro-jornadas'

/** Publicaciones aprobadas, de la más reciente a la más antigua (paginado por cursor). */
export default defineEventHandler(async (event) => {
  const { antesDe } = leerQuery(event, z.object({ antesDe: z.uuid().optional() }))
  return publicacionesAprobadas(antesDe)
})
