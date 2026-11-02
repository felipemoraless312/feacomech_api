import { quitarAdjunto } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  await quitarAdjunto(usuario.id, idDeRuta(event), ctx)
  return { ok: true }
})
