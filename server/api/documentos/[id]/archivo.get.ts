import { leerDocumento } from '~~/server/services/documentos'

/**
 * Entrega el archivo según el nivel de acceso del documento. Funciona con o sin sesión
 * (los documentos públicos los descarga cualquiera desde el portal).
 * ?descargar=1 fuerza la descarga; si no, PDF e imágenes se muestran en el navegador.
 */
export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const usuarioId = user && !user.debeCambiarPassword ? user.id : null
  exigirFrecuencia(`descarga:${contextoDe(event).ip}`, 120, 60_000)
  const { archivo, datos } = await leerDocumento(usuarioId, idDeRuta(event), contextoDe(event, usuarioId))
  const enLinea = getQuery(event).descargar !== '1' && (archivo.mime === 'application/pdf' || archivo.mime.startsWith('image/'))
  setResponseHeaders(event, {
    'content-type': archivo.mime,
    'content-length': archivo.tamano,
    'content-disposition': `${enLinea ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(archivo.nombreOriginal)}`,
    // Se puede mostrar en la vista previa de la propia plataforma, nunca en otro sitio.
    'x-frame-options': 'SAMEORIGIN',
    'content-security-policy': archivo.mime === 'application/pdf'
      ? 'frame-ancestors \'self\'; script-src \'none\''
      : 'default-src \'none\'; img-src \'self\'; style-src \'unsafe-inline\'; frame-ancestors \'self\'; sandbox',
    'cache-control': 'private, max-age=300',
  })
  return datos
})
