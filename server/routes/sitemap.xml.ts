// Mapa del sitio para buscadores: páginas fijas del portal y el contenido público
// (noticias publicadas, eventos publicados y colegios afiliados visibles en el directorio).
import { PERSONAS } from '~~/shared/organizacion'
import { urlPublica } from '~~/server/utils/correo'

const FIJAS = [
  '/', '/organizacion', '/federacion', '/expresidentes', '/admision', '/beneficios', '/directorio',
  '/directorio/mesa-directiva', '/directorio/consejo-consultivo', '/directorio/profesionales',
  '/vinculacion', '/noticias', '/eventos', '/documentos', '/constancias', '/contacto',
  '/jornadas-2026', '/aviso-de-privacidad', '/desarrollo',
]

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const [noticias, eventos, organizaciones] = await Promise.all([
    prisma.noticia.findMany({ where: { estado: 'PUBLICADA' }, select: { slug: true, actualizadoEn: true }, orderBy: { publicadaEn: 'desc' } }),
    prisma.evento.findMany({ where: { estado: 'PUBLICADO' }, select: { slug: true, actualizadoEn: true }, orderBy: { inicio: 'desc' } }),
    prisma.organizacion.findMany({ where: { estadoAfiliacion: 'AFILIADA', publica: true }, select: { slug: true, actualizadoEn: true }, orderBy: { nombre: 'asc' } }),
  ])

  const urls: { ruta: string, fecha?: Date }[] = [
    ...FIJAS.map(ruta => ({ ruta })),
    // Integrantes con reseña curricular (página propia).
    ...PERSONAS.filter(p => p.resena).map(p => ({ ruta: `/organizacion/${p.slug}` })),
    ...noticias.map(n => ({ ruta: `/noticias/${n.slug}`, fecha: n.actualizadoEn })),
    ...eventos.map(e => ({ ruta: `/eventos/${e.slug}`, fecha: e.actualizadoEn })),
    ...organizaciones.map(o => ({ ruta: `/directorio/${o.slug}`, fecha: o.actualizadoEn })),
  ]

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${escapar(urlPublica(u.ruta))}</loc>${u.fecha ? `<lastmod>${u.fecha.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`
})
