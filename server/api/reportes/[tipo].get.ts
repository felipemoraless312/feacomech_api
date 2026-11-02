import { z } from 'zod'
import { TIPOS_REPORTE, reporteQuery } from '~~/shared/schemas/censo'
import { generarReporte } from '~~/server/services/reportes'

export default defineEventHandler(async (event) => {
  const { ambito, ctx } = await requirePermiso(event, 'reporte.ver')
  const tipo = validar(z.enum(TIPOS_REPORTE), getRouterParam(event, 'tipo'))
  const q = leerQuery(event, reporteQuery)
  const csv = await generarReporte(tipo, q, ambito)
  await auditar(prisma, ctx, { accion: 'DESCARGAR', entidad: 'Reporte', entidadId: tipo, despues: q })
  setResponseHeaders(event, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="${tipo}-${new Date().toISOString().slice(0, 10)}.csv"`,
  })
  return csv
})
