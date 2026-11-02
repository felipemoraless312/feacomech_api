// Permisos efectivos de un usuario, calculados desde sus roles en la base.
// Se consultan en cada petición protegida, así que se guardan en caché por poco tiempo.
// Cualquier cambio en roles, permisos o asignaciones debe llamar a invalidarPermisos().
//
// Alcance ORGANIZACION: un permiso con ese alcance sólo aplica en las organizaciones a las
// que está ligada la asignación del rol (UsuarioRol.organizacionId). Un rol asignado sin
// organización no da permisos de ese alcance.
import { createError } from 'h3'
import { combinarPermisos, type Alcance, type Permiso, type PermisosEfectivos } from '../../shared/permisos'
import { prisma, type Db } from '../utils/prisma'

export interface RolResumen {
  clave: string
  nombre: string
  organizacion: { id: string, nombre: string } | null
}

export interface AccesoUsuario {
  roles: RolResumen[]
  permisos: PermisosEfectivos
  /** Para los permisos con alcance ORGANIZACION: en qué organizaciones aplican. */
  organizaciones: Partial<Record<Permiso, string[]>>
}

const TTL_MS = 30_000
const cache = new Map<string, { valor: AccesoUsuario, expira: number }>()

export function invalidarPermisos(usuarioId?: string) {
  if (usuarioId) cache.delete(usuarioId)
  else cache.clear()
}

/** Roles activos del usuario y la unión de sus permisos (gana el alcance más amplio). */
export async function accesoDeUsuario(usuarioId: string, db: Db = prisma): Promise<AccesoUsuario> {
  const enCache = cache.get(usuarioId)
  if (enCache && enCache.expira > Date.now()) return enCache.valor

  const asignaciones = await db.usuarioRol.findMany({
    where: { usuarioId, rol: { activo: true } },
    select: {
      organizacionId: true,
      organizacion: { select: { id: true, nombre: true } },
      rol: { select: { clave: true, nombre: true, permisos: { select: { permiso: true, alcance: true } } } },
    },
    orderBy: { asignadoEn: 'asc' },
  })

  const filas: { permiso: string, alcance: Alcance }[] = []
  const organizaciones: Partial<Record<Permiso, Set<string>>> = {}
  for (const a of asignaciones) {
    for (const p of a.rol.permisos) {
      if (p.alcance !== 'ORGANIZACION') {
        filas.push(p)
        continue
      }
      if (!a.organizacionId) continue
      filas.push(p)
      ;(organizaciones[p.permiso as Permiso] ??= new Set()).add(a.organizacionId)
    }
  }

  const permisos = combinarPermisos(filas)
  const valor: AccesoUsuario = {
    roles: asignaciones.map(a => ({ clave: a.rol.clave, nombre: a.rol.nombre, organizacion: a.organizacion })),
    permisos,
    organizaciones: Object.fromEntries(
      Object.entries(organizaciones)
        .filter(([p]) => permisos[p as Permiso] === 'ORGANIZACION')
        .map(([p, ids]) => [p, [...ids!]]),
    ),
  }
  cache.set(usuarioId, { valor, expira: Date.now() + TTL_MS })
  return valor
}

/** Sobre qué organizaciones puede ejercer un permiso: todas, algunas o ninguna (null = sin permiso). */
export type Ambito = { todas: true } | { todas: false, ids: string[] }

export async function ambitoDe(usuarioId: string, permiso: Permiso): Promise<Ambito | null> {
  const a = await accesoDeUsuario(usuarioId)
  const alcance = a.permisos[permiso]
  if (!alcance) return null
  if (alcance === 'TOTAL') return { todas: true }
  return { todas: false, ids: alcance === 'ORGANIZACION' ? a.organizaciones[permiso] ?? [] : [] }
}

export const incluye = (ambito: Ambito, organizacionId: string) => ambito.todas || ambito.ids.includes(organizacionId)

/** Exige el permiso sobre esa organización (403 si no lo tiene). */
export async function exigirEnOrganizacion(usuarioId: string, permiso: Permiso, organizacionId: string) {
  const ambito = await ambitoDe(usuarioId, permiso)
  if (!ambito || !incluye(ambito, organizacionId)) {
    throw createError({ statusCode: 403, message: 'No tiene permiso sobre esta organización' })
  }
  return ambito
}

/** Usuarios activos con un permiso de alcance total (p. ej. para avisarles de solicitudes). */
export function usuariosConPermisoTotal(db: Db, permiso: Permiso) {
  return db.usuario.findMany({
    where: { activo: true, roles: { some: { rol: { activo: true, permisos: { some: { permiso, alcance: 'TOTAL' } } } } } },
    select: { id: true },
  })
}
