import { leerArchivo } from '../../utils/almacen'
import { prisma } from '../../utils/prisma'

// Entrega un archivo subido según su visibilidad. Los RESTRINGIDOS los sirve cada módulo
// con su propia regla de acceso (documentos, adjuntos del foro…), no esta ruta.
export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const a = await prisma.archivo.findUnique({ where: { id }, select: { ruta: true, mime: true, tamano: true, visibilidad: true, creadoEn: true } })
  if (!a || a.visibilidad === 'RESTRINGIDO') throw createError({ statusCode: 404, message: 'No encontrado' })
  if (a.visibilidad === 'AUTENTICADO') await requireUsuarioActivo(event)

  const datos = await leerArchivo(a.ruta).catch(() => {
    throw createError({ statusCode: 404, message: 'No encontrado' })
  })
  setResponseHeaders(event, {
    'content-type': a.mime,
    'content-length': a.tamano,
    'content-disposition': 'inline',
    // Ningún archivo subido se interpreta como página (scripts, estilos, marcos).
    'content-security-policy': 'default-src \'none\'; img-src \'self\'; style-src \'unsafe-inline\'; sandbox',
    'cache-control': a.visibilidad === 'PUBLICO' ? 'public, max-age=3600' : 'private, max-age=600',
    'last-modified': a.creadoEn.toUTCString(),
  })
  return datos
})
