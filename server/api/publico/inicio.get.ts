import { estructuraPublica } from '~~/server/services/estructura'
import { eventosPublicos } from '~~/server/services/eventos'
import { noticiasPublicas } from '~~/server/services/noticias'
import { vinculosPublicos } from '~~/server/services/portal'
import { obtenerParametro } from '~~/server/utils/parametros'
import { prisma } from '~~/server/utils/prisma'

/** Lo que muestra la página de inicio del portal, todo de la base y agregado. */
export default defineEventHandler(async () => {
  const [colegios, asociaciones, afiliados, noticias, actividades, vinculos, estructura, eventos, portada] = await Promise.all([
    prisma.organizacion.count({ where: { tipo: 'COLEGIO', estadoAfiliacion: 'AFILIADA' } }),
    prisma.organizacion.count({ where: { tipo: 'ASOCIACION', estadoAfiliacion: 'AFILIADA' } }),
    prisma.membresia.groupBy({ by: ['usuarioId'], where: { estado: 'ACTIVA', organizacion: { estadoAfiliacion: 'AFILIADA' } } }).then(f => f.length),
    noticiasPublicas({ pagina: 1, porPagina: 3 }),
    noticiasPublicas({ tipo: 'ACTIVIDAD', pagina: 1, porPagina: 3 }),
    vinculosPublicos(),
    estructuraPublica(null, ['MESA_DIRECTIVA']),
    eventosPublicos({ periodo: 'proximos', pagina: 1, porPagina: 3 }),
    obtenerParametro('portada'),
  ])
  return {
    cifras: { colegios, asociaciones, afiliados },
    portada,
    noticias: noticias.datos,
    eventos: eventos.datos.filter(e => e.estado === 'PUBLICADO'),
    actividades: actividades.datos,
    vinculos: vinculos.slice(0, 12),
    periodo: estructura.periodo,
    presidencia: estructura.organos[0]?.organigrama[0] ?? null,
  }
})
