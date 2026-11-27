import { z } from 'zod'
import { comentariosModeracion } from '~~/server/services/muro-jornadas'

export default defineEventHandler(async (event) => {
  await requireGestionJornadas(event)
  const { filtro } = leerQuery(event, z.object({ filtro: z.enum(['reportados', 'todos']).default('reportados') }))
  return comentariosModeracion(filtro === 'reportados')
})
