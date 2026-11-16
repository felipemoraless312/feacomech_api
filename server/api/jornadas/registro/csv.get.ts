import { registradosCsv } from '~~/server/services/registro-asistentes'

export default defineEventHandler(async (event) => {
  const { ctx } = await requireGestionJornadas(event)
  const csv = await registradosCsv()
  await auditar(prisma, ctx, { accion: 'DESCARGAR', entidad: 'RegistroAsistente', entidadId: 'jornadas-2026' })
  setResponseHeaders(event, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': 'attachment; filename="registro-jornadas-2026.csv"',
  })
  return csv
})
