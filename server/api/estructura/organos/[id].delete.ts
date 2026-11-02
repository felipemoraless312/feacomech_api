import { ambitoDeEntidad, eliminarOrgano } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const { ctx } = await exigirEstructura(event, await ambitoDeEntidad('organo', id))
  await eliminarOrgano(id, ctx)
  return { ok: true }
})
