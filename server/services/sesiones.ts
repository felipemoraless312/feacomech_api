// Sesiones abiertas por dispositivo. La cookie sellada lleva el id de la sesión;
// el middleware 02.sesion valida contra esta tabla en cada petición.
import { createError } from 'h3'
import type { ContextoAuditoria } from '../utils/auditoria'
import { auditar } from '../utils/auditoria'
import { obtenerParametro } from '../utils/parametros'
import { prisma, type Db } from '../utils/prisma'

/** Vida máxima absoluta de una sesión (igual que la cookie, nuxt.config: session.maxAge). */
export const VIDA_MAXIMA_MS = 12 * 60 * 60_000
/** La actividad se registra como máximo una vez por minuto. */
const RENOVAR_MS = 60_000

export type MotivoCierre = 'LOGOUT' | 'INACTIVIDAD' | 'VENCIDA' | 'CERRADA_POR_USUARIO' | 'CAMBIO_CONTRASENA' | 'DESACTIVADO'

export async function abrirSesion(usuarioId: string, ctx: ContextoAuditoria) {
  const s = await prisma.sesion.create({
    data: { usuarioId, ip: ctx.ip ?? null, userAgent: ctx.userAgent?.slice(0, 300) ?? null },
    select: { id: true },
  })
  return s.id
}

/**
 * ¿Sigue vigente la sesión? Exige que exista, no esté cerrada, sea del usuario, que éste
 * siga activo con la misma versión de sesión, y que no haya vencido por inactividad o por
 * vida máxima. Si venció, la cierra. Si está vigente, registra la actividad.
 */
export async function validarSesion(sesionId: string, usuarioId: string, versionSesion: number, ahora = new Date()): Promise<boolean> {
  const s = await prisma.sesion.findUnique({
    where: { id: sesionId },
    select: { usuarioId: true, cerradaEn: true, creadaEn: true, ultimaActividad: true, usuario: { select: { activo: true, versionSesion: true } } },
  })
  if (!s || s.cerradaEn || s.usuarioId !== usuarioId) return false
  if (!s.usuario.activo || s.usuario.versionSesion !== versionSesion) return false

  const limiteInactividad = (await obtenerParametro('sesionInactividadMinutos')) * 60_000
  const motivo: MotivoCierre | null = ahora.getTime() - s.ultimaActividad.getTime() > limiteInactividad
    ? 'INACTIVIDAD'
    : ahora.getTime() - s.creadaEn.getTime() > VIDA_MAXIMA_MS ? 'VENCIDA' : null
  if (motivo) {
    await prisma.sesion.updateMany({ where: { id: sesionId, cerradaEn: null }, data: { cerradaEn: ahora, motivoCierre: motivo } })
    return false
  }

  if (ahora.getTime() - s.ultimaActividad.getTime() > RENOVAR_MS) {
    await prisma.sesion.update({ where: { id: sesionId }, data: { ultimaActividad: ahora } })
  }
  return true
}

/** Cierra sesiones abiertas del usuario (todas, o todas menos `excepto`). */
export async function cerrarSesiones(db: Db, usuarioId: string, motivo: MotivoCierre, excepto?: string) {
  const r = await db.sesion.updateMany({
    where: { usuarioId, cerradaEn: null, ...(excepto ? { id: { not: excepto } } : {}) },
    data: { cerradaEn: new Date(), motivoCierre: motivo },
  })
  return r.count
}

export async function cerrarSesion(sesionId: string, motivo: MotivoCierre) {
  await prisma.sesion.updateMany({ where: { id: sesionId, cerradaEn: null }, data: { cerradaEn: new Date(), motivoCierre: motivo } })
}

/** Sesiones vigentes del usuario, la actual primero. */
export async function listarSesiones(usuarioId: string, sesionActual: string | undefined, ahora = new Date()) {
  const limiteInactividad = (await obtenerParametro('sesionInactividadMinutos')) * 60_000
  const filas = await prisma.sesion.findMany({
    where: {
      usuarioId,
      cerradaEn: null,
      ultimaActividad: { gt: new Date(ahora.getTime() - limiteInactividad) },
      creadaEn: { gt: new Date(ahora.getTime() - VIDA_MAXIMA_MS) },
    },
    orderBy: { ultimaActividad: 'desc' },
    select: { id: true, creadaEn: true, ultimaActividad: true, ip: true, userAgent: true },
  })
  return filas
    .map(s => ({ ...s, dispositivo: describirDispositivo(s.userAgent), actual: s.id === sesionActual }))
    .sort((a, b) => Number(b.actual) - Number(a.actual))
}

/** El usuario cierra una de sus sesiones (no la actual: para eso está "Cerrar sesión"). */
export async function cerrarSesionPropia(usuarioId: string, sesionId: string, sesionActual: string | undefined, ctx: ContextoAuditoria) {
  if (sesionId === sesionActual) throw createError({ statusCode: 400, message: 'Para cerrar esta sesión use “Cerrar sesión”' })
  const r = await prisma.sesion.updateMany({
    where: { id: sesionId, usuarioId, cerradaEn: null },
    data: { cerradaEn: new Date(), motivoCierre: 'CERRADA_POR_USUARIO' },
  })
  if (!r.count) throw createError({ statusCode: 404, message: 'Sesión no encontrada' })
  await auditar(prisma, ctx, { accion: 'ACTUALIZAR', entidad: 'Sesion', entidadId: sesionId, motivo: 'Cerrada por el usuario' })
}

export async function cerrarOtrasSesiones(usuarioId: string, sesionActual: string | undefined, ctx: ContextoAuditoria) {
  const n = await cerrarSesiones(prisma, usuarioId, 'CERRADA_POR_USUARIO', sesionActual)
  if (n) await auditar(prisma, ctx, { accion: 'ACTUALIZAR', entidad: 'Sesion', entidadId: usuarioId, motivo: `Cerró ${n} sesión(es) en otros dispositivos` })
  return { cerradas: n }
}

/** "Chrome en Windows", "Safari en iPhone"… a partir del User-Agent. */
export function describirDispositivo(ua: string | null): string {
  if (!ua) return 'Dispositivo desconocido'
  const navegador = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : null
  const sistema = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : null
  if (navegador && sistema) return `${navegador} en ${sistema}`
  return navegador ?? sistema ?? 'Dispositivo desconocido'
}
