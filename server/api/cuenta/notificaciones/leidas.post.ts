import { z } from 'zod'
import { marcarLeidas } from '../../../services/notificaciones'

/** Sin `ids` marca todas como leídas. */
const cuerpo = z.object({ ids: z.array(z.uuid()).max(100).optional() })

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const { ids } = await leerCuerpo(event, cuerpo)
  return marcarLeidas(usuario.id, ids)
})
