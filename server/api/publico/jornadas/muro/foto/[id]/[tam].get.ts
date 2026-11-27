import { contenidoFoto } from '~~/server/services/muro-jornadas'

/** Imagen de una publicación aprobada ("grande" o "mini"). */
export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const tam = getRouterParam(event, 'tam')
  if (tam !== 'grande' && tam !== 'mini') throw createError({ statusCode: 404, message: 'No encontrado' })
  const { datos, creadoEn } = await contenidoFoto(id, tam, true)
  setResponseHeaders(event, {
    'content-type': 'image/jpeg',
    'content-length': datos.length,
    'content-disposition': 'inline',
    'content-security-policy': 'default-src \'none\'; sandbox',
    'cache-control': 'public, max-age=600',
    'last-modified': creadoEn.toUTCString(),
  })
  return datos
})
