import { prisma, type Db } from '../utils/prisma'

export interface NuevaNotificacion {
  tipo: 'CUENTA' | 'SEGURIDAD' | 'AFILIACION' | 'EVENTO' | 'COMUNIDAD' | 'DOCUMENTO'
  titulo: string
  cuerpo?: string
  /** Ruta interna (empieza con /plataforma). */
  enlace?: string
}

/** Crea una notificación. Llamar con el `tx` de la operación que la origina. */
export async function notificar(db: Db, usuarioId: string, n: NuevaNotificacion) {
  await db.notificacion.create({
    data: { usuarioId, tipo: n.tipo, titulo: n.titulo, cuerpo: n.cuerpo ?? null, enlace: n.enlace ?? null },
  })
}

export async function listarNotificaciones(usuarioId: string, q: { soloNoLeidas?: boolean, pagina: number, porPagina: number }) {
  const where = { usuarioId, ...(q.soloNoLeidas ? { leidaEn: null } : {}) }
  const [total, datos] = await Promise.all([
    prisma.notificacion.count({ where }),
    prisma.notificacion.findMany({
      where,
      orderBy: { creadaEn: 'desc' },
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      select: { id: true, tipo: true, titulo: true, cuerpo: true, enlace: true, leidaEn: true, creadaEn: true },
    }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos }
}

export function contarNoLeidas(usuarioId: string) {
  return prisma.notificacion.count({ where: { usuarioId, leidaEn: null } })
}

/** Marca como leídas las indicadas (o todas). Sólo las del propio usuario. */
export async function marcarLeidas(usuarioId: string, ids?: string[]) {
  const r = await prisma.notificacion.updateMany({
    where: { usuarioId, leidaEn: null, ...(ids ? { id: { in: ids } } : {}) },
    data: { leidaEn: new Date() },
  })
  return { marcadas: r.count }
}
