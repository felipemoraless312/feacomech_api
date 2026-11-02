import { eliminarVinculo } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'contenido.administrar')
  await eliminarVinculo(idDeRuta(event), ctx)
  return { ok: true }
})
