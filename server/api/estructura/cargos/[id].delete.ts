import { ambitoDeEntidad, eliminarCargo } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const { ctx } = await exigirEstructura(event, await ambitoDeEntidad('cargo', id))
  await eliminarCargo(id, ctx)
  return { ok: true }
})
