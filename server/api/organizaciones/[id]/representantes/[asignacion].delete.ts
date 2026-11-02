import { quitarRepresentante } from '~~/server/services/organizaciones'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  await quitarRepresentante(idDeRuta(event), idDeRuta(event, 'asignacion'), ctx)
  return { ok: true }
})
