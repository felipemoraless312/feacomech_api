import { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import { AccionAuditoria } from '../generated/prisma/enums'
import { paginacion } from '../../shared/schemas/comunes'
import { prisma } from '../utils/prisma'

const query = z.object({
  entidad: z.string().trim().max(60).optional(),
  accion: z.enum(AccionAuditoria).optional(),
  usuario: z.string().trim().max(80).optional(),
  desde: z.iso.date().optional(),
  hasta: z.iso.date().optional(),
  ...paginacion,
})

// Bitácora (sólo lectura). Consultarla también queda registrado.
export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'auditoria.ver')
  const q = leerQuery(event, query)
  const inicioDia = (d: string) => new Date(`${d}T00:00:00-06:00`)
  const where: Prisma.AuditoriaWhereInput = {
    ...(q.entidad ? { entidad: { startsWith: q.entidad, mode: 'insensitive' } } : {}),
    ...(q.accion ? { accion: q.accion } : {}),
    ...(q.usuario
      ? { usuario: { OR: [{ email: { contains: q.usuario, mode: 'insensitive' } }, { apellidoPaterno: { contains: q.usuario, mode: 'insensitive' } }, { nombre: { contains: q.usuario, mode: 'insensitive' } }] } }
      : {}),
    ...(q.desde || q.hasta
      ? { fecha: { ...(q.desde ? { gte: inicioDia(q.desde) } : {}), ...(q.hasta ? { lt: new Date(inicioDia(q.hasta).getTime() + 86_400_000) } : {}) } }
      : {}),
  }
  const [total, filas] = await Promise.all([
    prisma.auditoria.count({ where }),
    prisma.auditoria.findMany({
      where,
      orderBy: { fecha: 'desc' },
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      include: { usuario: { select: { email: true, nombre: true, apellidoPaterno: true } } },
    }),
  ])
  await auditar(prisma, ctx, { accion: 'CONSULTAR', entidad: 'Auditoria', entidadId: '-', despues: q })
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos: filas.map(f => ({ ...f, id: f.id.toString() })) }
})
