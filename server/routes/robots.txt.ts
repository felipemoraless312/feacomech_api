// robots.txt: el portal público se indexa; la plataforma, las impresiones, la API, el
// registro en sede y las páginas de verificación (datos de personas) no.
import { urlPublica } from '~~/server/utils/correo'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /plataforma',
    'Disallow: /imprimir',
    'Disallow: /api/',
    'Disallow: /jornadas-2026/registro',
    'Disallow: /verificar',
    '',
    `Sitemap: ${urlPublica('/sitemap.xml')}`,
    '',
  ].join('\n')
})
