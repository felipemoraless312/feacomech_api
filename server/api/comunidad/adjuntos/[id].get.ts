import { leerAdjunto } from '~~/server/services/comunidad'

/** Adjuntos de la comunidad: sólo para quien puede ver la publicación. */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const { archivo, datos } = await leerAdjunto(usuario.id, idDeRuta(event))
  const descarga = getQuery(event).descargar === '1' || archivo.mime === 'application/pdf'
  setResponseHeaders(event, {
    'content-type': archivo.mime,
    'content-length': archivo.tamano,
    'content-disposition': `${descarga && getQuery(event).descargar === '1' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(archivo.nombreOriginal)}`,
    'content-security-policy': 'default-src \'none\'; img-src \'self\'; style-src \'unsafe-inline\'; sandbox',
    'cache-control': 'private, max-age=600',
  })
  return datos
})
