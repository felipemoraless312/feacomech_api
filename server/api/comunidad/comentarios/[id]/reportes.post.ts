import { reporteSchema } from '~~/shared/schemas/comunidad'
import { reportar } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`reportar:${usuario.id}`, 20, 60 * 60_000)
  const datos = await leerCuerpo(event, reporteSchema)
  await reportar(usuario.id, { comentarioId: idDeRuta(event) }, datos, ctx)
  return { ok: true }
})
