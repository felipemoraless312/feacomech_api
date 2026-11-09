// Constancias de participación en las Jornadas: búsqueda pública por correo o folio y
// consulta por código (QR). Los participantes no necesitan cuenta en la plataforma.
import { createError } from 'h3'
import { prisma } from '../utils/prisma'

const FOLIO = /^[A-Z0-9]{2,8}-\d{2}-\d{4}$/i

export interface ConstanciaJornadaResumen {
  codigo: string
  folio: string
  tipo: string
  nombre: string
  detalle: string | null
  revocada: boolean
}

/**
 * Busca por correo exacto (sin distinguir mayúsculas) o por folio exacto.
 * Nunca hace búsquedas parciales: así no se pueden listar participantes ajenos.
 */
export async function buscarConstancias(eventoSlug: string, consulta: string): Promise<ConstanciaJornadaResumen[]> {
  const q = consulta.trim()
  const esFolio = FOLIO.test(q)
  const esCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)
  if (!esFolio && !esCorreo) {
    throw createError({ statusCode: 400, message: 'Escriba el correo con el que se registró o el folio de su constancia.' })
  }
  const filas = await prisma.participacionEvento.findMany({
    where: {
      eventoSlug,
      ...(esFolio ? { folio: q.toUpperCase() } : { correo: { equals: q, mode: 'insensitive' } }),
    },
    orderBy: [{ tipo: 'asc' }, { folio: 'asc' }],
    select: { codigo: true, folio: true, tipo: true, nombre: true, detalle: true, revocadaEn: true },
  })
  return filas.map(f => ({ codigo: f.codigo, folio: f.folio, tipo: f.tipo, nombre: f.nombre, detalle: f.detalle, revocada: !!f.revocadaEn }))
}

/** Constancia completa para mostrar, imprimir o verificar (el código del QR es secreto y no adivinable). */
export async function constanciaPorCodigo(codigo: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(codigo)) throw createError({ statusCode: 404, message: 'Constancia no encontrada' })
  const c = await prisma.participacionEvento.findUnique({
    where: { codigo },
    select: { codigo: true, folio: true, tipo: true, nombre: true, detalle: true, horas: true, eventoSlug: true, emitidaEn: true, revocadaEn: true, motivoRevocacion: true },
  })
  if (!c) throw createError({ statusCode: 404, message: 'Constancia no encontrada' })
  return c
}
