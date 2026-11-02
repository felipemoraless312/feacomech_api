import { inscritosCsv } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ambito, ctx } = await requirePermiso(event, 'evento.gestionar')
  const id = idDeRuta(event)
  const csv = await inscritosCsv(id, ambito)
  await auditar(prisma, ctx, { accion: 'DESCARGAR', entidad: 'Evento.inscritos', entidadId: id })
  setResponseHeaders(event, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="inscritos-${id.slice(0, 8)}.csv"`,
  })
  return csv
})
