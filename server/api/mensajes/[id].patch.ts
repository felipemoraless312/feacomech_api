import { atenderMensajeSchema } from '~~/shared/schemas/portal'
import { atenderMensaje } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'contacto.ver')
  const datos = await leerCuerpo(event, atenderMensajeSchema)
  await atenderMensaje(idDeRuta(event), datos, ctx)
  return { ok: true }
})
