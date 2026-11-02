import { prisma } from '~~/server/utils/prisma'

/** Municipios de Chiapas con su región (para el perfil y los filtros del censo). */
export default defineEventHandler(async (event) => {
  await requireUsuarioActivo(event)
  return prisma.municipio.findMany({ orderBy: { nombre: 'asc' }, select: { id: true, nombre: true, region: { select: { id: true, nombre: true, numero: true } } } })
})
