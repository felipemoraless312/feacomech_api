import { contenidoFoto } from '~~/server/services/muro-jornadas'

/** Imagen para el personal (cualquier estado). Con ?descargar=1 se baja como archivo. */
export default defineEventHandler(async (event) => {
  await requireGestionJornadas(event)
  const id = idDeRuta(event)
  const tam = getRouterParam(event, 'tam')
  if (tam !== 'grande' && tam !== 'mini') throw createError({ statusCode: 404, message: 'No encontrado' })
  const { datos } = await contenidoFoto(id, tam, false)
  setResponseHeaders(event, {
    'content-type': 'image/jpeg',
    'content-length': datos.length,
    'content-disposition': getQuery(event).descargar ? `attachment; filename="jornadas-feacomech-${id.slice(-8)}.jpg"` : 'inline',
    'content-security-policy': 'default-src \'none\'; sandbox',
    'cache-control': 'private, max-age=600',
  })
  return datos
})
