import { z } from 'zod'
import { paginacion } from '../../../../shared/schemas/comunes'
import { listarNotificaciones } from '../../../services/notificaciones'

const query = z.object({ soloNoLeidas: z.enum(['true', 'false']).optional().transform(v => v === 'true'), ...paginacion })

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return listarNotificaciones(usuario.id, leerQuery(event, query))
})
