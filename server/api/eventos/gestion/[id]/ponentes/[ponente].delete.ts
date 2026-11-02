import { eliminarPonente } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  await eliminarPonente(idDeRuta(event), idDeRuta(event, 'ponente'), ambito, ctx)
  return { ok: true }
})
