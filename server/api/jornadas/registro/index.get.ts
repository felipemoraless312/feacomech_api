import { z } from 'zod'
import { listarRegistrados } from '~~/server/services/registro-asistentes'

export default defineEventHandler(async (event) => {
  await requireGestionJornadas(event)
  const { q } = leerQuery(event, z.object({ q: z.string().max(100).default('') }))
  return listarRegistrados(q)
})
