import { prisma } from '~~/server/utils/prisma'

/** Opciones de filtro del censo (especialidades principales, regiones y organizaciones en ámbito). */
export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'censo.ver')
  const [especialidades, regiones, organizaciones] = await Promise.all([
    prisma.especialidad.findMany({ where: { padreId: null, activo: true }, orderBy: { nombre: 'asc' }, select: { id: true, nombre: true } }),
    prisma.region.findMany({ orderBy: { numero: 'asc' }, select: { id: true, nombre: true, numero: true } }),
    prisma.organizacion.findMany({ where: ambito.todas ? {} : { id: { in: ambito.ids } }, orderBy: { nombre: 'asc' }, select: { id: true, nombre: true, siglas: true } }),
  ])
  return { especialidades, regiones, organizaciones }
})
