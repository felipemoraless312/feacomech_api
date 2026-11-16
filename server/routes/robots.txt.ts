// robots.txt: el portal público se indexa; la API, el registro en sede y las páginas de
// verificación (datos de personas) no. La plataforma no se menciona para no señalarla: se
// excluye con la cabecera X-Robots-Tag (01.seguridad) y la puerta la oculta (03.puerta).
import { urlPublica } from '~~/server/utils/correo'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /jornadas-2026/registro',
    'Disallow: /verificar',
    '',
    `Sitemap: ${urlPublica('/sitemap.xml')}`,
    '',
  ].join('\n')
})
