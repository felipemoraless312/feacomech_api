import { eliminarActividad } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  await eliminarActividad(idDeRuta(event), idDeRuta(event, 'actividad'), ambito, ctx)
  return { ok: true }
})
