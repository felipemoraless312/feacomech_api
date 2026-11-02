import type { User } from '#auth-utils'
import type { H3Event } from 'h3'
import type { Alcance, Permiso } from '../../shared/permisos'
import { accesoDeUsuario, ambitoDe, exigirEnOrganizacion, type Ambito } from '../services/permisos'
import type { ContextoAuditoria } from './auditoria'

/** IP y navegador de la petición, más el usuario si lo hay, para la bitácora. */
export function contextoDe(event: H3Event, usuarioId: string | null = null): ContextoAuditoria {
  return {
    usuarioId,
    ip: getRequestIP(event, { xForwardedFor: true }) ?? null,
    userAgent: getRequestHeader(event, 'user-agent') ?? null,
  }
}

/** Usuario con sesión válida (401 si no hay). */
export async function requireUsuario(event: H3Event): Promise<User> {
  const { user } = await requireUserSession(event, { message: 'Inicie sesión para continuar' })
  return user
}

/** Usuario con sesión válida que ya definió su contraseña personal. */
export async function requireUsuarioActivo(event: H3Event): Promise<{ usuario: User, ctx: ContextoAuditoria }> {
  const usuario = await requireUsuario(event)
  if (usuario.debeCambiarPassword) {
    throw createError({ statusCode: 403, message: 'Debe cambiar su contraseña antes de continuar' })
  }
  return { usuario, ctx: contextoDe(event, usuario.id) }
}

export interface UsuarioAutorizado {
  usuario: User
  alcance: Alcance
  ctx: ContextoAuditoria
}

/**
 * Exige que el usuario tenga el permiso (403 si no). Devuelve el alcance con el que lo tiene;
 * el servicio de dominio aplica ORGANIZACION/PROPIO.
 * Mientras deba cambiar su contraseña, no puede hacer nada más.
 */
export async function requirePermiso(event: H3Event, permiso: Permiso): Promise<UsuarioAutorizado & { ambito: Ambito }> {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const alcance = (await accesoDeUsuario(usuario.id)).permisos[permiso]
  if (!alcance) throw createError({ statusCode: 403, message: 'No tiene permiso para esta acción' })
  return { usuario, alcance, ctx, ambito: (await ambitoDe(usuario.id, permiso))! }
}

/** Exige el permiso sobre una organización concreta (TOTAL, o ORGANIZACION si es una de las suyas). */
export async function requirePermisoEn(event: H3Event, permiso: Permiso, organizacionId: string) {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const ambito = await exigirEnOrganizacion(usuario.id, permiso, organizacionId)
  return { usuario, ctx, ambito }
}

/** Exige al menos uno de los permisos; el servicio de dominio decide el alcance de cada operación. */
export async function requireAlguno(event: H3Event, permisos: Permiso[]): Promise<{ usuario: User, ctx: ContextoAuditoria }> {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const efectivos = (await accesoDeUsuario(usuario.id)).permisos
  if (!permisos.some(p => efectivos[p])) {
    throw createError({ statusCode: 403, message: 'No tiene permiso para esta acción' })
  }
  return { usuario, ctx }
}

/** Valida el parámetro de ruta `:id` como UUID. */
export function idDeRuta(event: H3Event, nombre = 'id'): string {
  const id = getRouterParam(event, nombre)
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw createError({ statusCode: 404, message: 'No encontrado' })
  }
  return id
}
