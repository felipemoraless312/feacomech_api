import { z } from 'zod'
import { resolverSolicitudGrupo } from '~~/server/services/comunidad'

const cuerpo = z.object({ aprobar: z.boolean() })

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { aprobar } = await leerCuerpo(event, cuerpo)
  await resolverSolicitudGrupo(usuario.id, idDeRuta(event, 'ref'), idDeRuta(event, 'usuario'), aprobar, ctx)
  return { ok: true }
})
