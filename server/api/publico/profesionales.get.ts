import { z } from 'zod'
import { paginacion } from '~~/shared/schemas/comunes'
import { profesionalesPublicos } from '~~/server/services/profesionales'

const query = z.object({ q: z.string().trim().max(80).optional(), especialidadId: z.uuid().optional(), ...paginacion })

export default defineEventHandler((event) => {
  exigirFrecuencia(`directorio:${contextoDe(event).ip}`, 120, 60_000)
  return profesionalesPublicos(leerQuery(event, query))
})
