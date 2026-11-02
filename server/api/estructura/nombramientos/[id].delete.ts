import { ambitoDeEntidad, eliminarNombramiento } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const { ctx } = await exigirEstructura(event, await ambitoDeEntidad('nombramiento', id))
  await eliminarNombramiento(id, ctx)
  return { ok: true }
})
