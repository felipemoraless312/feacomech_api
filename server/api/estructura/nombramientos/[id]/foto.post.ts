import { MAX_FOTO_NOMBRAMIENTO, ambitoDeEntidad, guardarFotoNombramiento } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const { ctx } = await exigirEstructura(event, await ambitoDeEntidad('nombramiento', id))
  const { datos, nombre } = await leerImagenSubida(event, 'foto', MAX_FOTO_NOMBRAMIENTO)
  await guardarFotoNombramiento(id, datos, nombre, ctx)
  return { ok: true }
})
