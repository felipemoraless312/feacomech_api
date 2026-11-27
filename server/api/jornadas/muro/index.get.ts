import { z } from 'zod'
import { ESTADOS_PUBLICACION } from '~~/shared/muro-jornadas'
import { publicacionesModeracion } from '~~/server/services/muro-jornadas'

export default defineEventHandler(async (event) => {
  await requireGestionJornadas(event)
  const { estado } = leerQuery(event, z.object({ estado: z.enum(ESTADOS_PUBLICACION).default('PENDIENTE') }))
  return publicacionesModeracion(estado)
})
