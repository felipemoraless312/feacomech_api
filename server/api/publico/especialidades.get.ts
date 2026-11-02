import { prisma } from '~~/server/utils/prisma'

/** Especialidades activas (para filtrar el directorio público). */
export default defineEventHandler(() =>
  prisma.especialidad.findMany({ where: { activo: true, padreId: null }, orderBy: { nombre: 'asc' }, select: { id: true, nombre: true } }))
