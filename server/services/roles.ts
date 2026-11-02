import { createError } from 'h3'
import { PERMISOS, ROL_SUPERADMIN } from '../../shared/permisos'
import type { RolDatos } from '../../shared/schemas/rol'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma, type Tx } from '../utils/prisma'
import { invalidarPermisos } from './permisos'

const SELECT_ROL = {
  id: true,
  clave: true,
  nombre: true,
  descripcion: true,
  sistema: true,
  activo: true,
  permisos: { select: { permiso: true, alcance: true }, orderBy: { permiso: 'asc' } },
  _count: { select: { usuarios: true } },
} as const

export async function listarRoles() {
  const roles = await prisma.rol.findMany({ select: SELECT_ROL, orderBy: [{ sistema: 'desc' }, { creadoEn: 'asc' }] })
  return roles.map(({ _count, ...r }) => ({ ...r, usuarios: _count.usuarios }))
}
export type RolDto = Awaited<ReturnType<typeof listarRoles>>[number]

async function reemplazarPermisos(tx: Tx, rolId: string, permisos: RolDatos['permisos']) {
  await tx.rolPermiso.deleteMany({ where: { rolId } })
  if (permisos.length) await tx.rolPermiso.createMany({ data: permisos.map(p => ({ rolId, ...p })) })
}

export async function crearRol(d: RolDatos & { clave: string }, ctx: ContextoAuditoria) {
  try {
    const rol = await prisma.$transaction(async (tx) => {
      const r = await tx.rol.create({
        data: { clave: d.clave, nombre: d.nombre, descripcion: d.descripcion, activo: d.activo },
      })
      await reemplazarPermisos(tx, r.id, d.permisos)
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Rol', entidadId: r.id, despues: d })
      return r
    })
    return rol
  }
  catch (e) {
    if ((e as { code?: string }).code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Ya existe un rol con esa clave', data: { campos: { clave: 'Ya existe' } } })
    }
    throw e
  }
}

/**
 * Actualiza nombre, descripción, estado y permisos. El superadministrador conserva siempre
 * todo el catálogo y no se desactiva (también lo impide un trigger en la base).
 */
export async function actualizarRol(id: string, d: RolDatos, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const antes = await tx.rol.findUnique({ where: { id }, select: SELECT_ROL })
    if (!antes) throw createError({ statusCode: 404, message: 'Rol no encontrado' })

    const esSuper = antes.clave === ROL_SUPERADMIN
    const permisos = esSuper ? PERMISOS.map(permiso => ({ permiso, alcance: 'TOTAL' as const })) : d.permisos
    if (esSuper && !d.activo) throw createError({ statusCode: 400, message: 'El rol de superadministrador no se puede desactivar' })

    await tx.rol.update({ where: { id }, data: { nombre: d.nombre, descripcion: d.descripcion, activo: d.activo } })
    await reemplazarPermisos(tx, id, permisos)
    await auditar(tx, ctx, {
      accion: 'ACTUALIZAR',
      entidad: 'Rol',
      entidadId: id,
      antes: { nombre: antes.nombre, descripcion: antes.descripcion, activo: antes.activo, permisos: antes.permisos },
      despues: { nombre: d.nombre, descripcion: d.descripcion, activo: d.activo, permisos },
    })
  })
  invalidarPermisos()
}

/** Sólo roles creados desde el panel y sin usuarios asignados. */
export async function eliminarRol(id: string, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const r = await tx.rol.findUnique({ where: { id }, select: SELECT_ROL })
    if (!r) throw createError({ statusCode: 404, message: 'Rol no encontrado' })
    if (r.sistema) throw createError({ statusCode: 400, message: 'Los roles iniciales no se eliminan; puede desactivarlos' })
    if (r._count.usuarios) throw createError({ statusCode: 409, message: `El rol está asignado a ${r._count.usuarios} usuario(s); quíteselo antes de eliminarlo` })
    await tx.rol.delete({ where: { id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Rol', entidadId: id, antes: { clave: r.clave, nombre: r.nombre, permisos: r.permisos } })
  })
  invalidarPermisos()
}
