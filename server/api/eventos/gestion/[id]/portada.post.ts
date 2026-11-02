import { MAX_PORTADA_EVENTO, guardarPortadaEvento } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'evento.gestionar')
  const { datos, nombre } = await leerImagenSubida(event, 'portada', MAX_PORTADA_EVENTO)
  await guardarPortadaEvento(idDeRuta(event), datos, nombre, ambito, ctx)
  return { ok: true }
})
