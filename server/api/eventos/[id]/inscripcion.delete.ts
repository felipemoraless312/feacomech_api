import { cancelarInscripcion } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  await cancelarInscripcion(idDeRuta(event), usuario.id, ctx)
  return { ok: true }
})
