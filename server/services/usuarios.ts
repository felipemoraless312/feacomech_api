import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { Prisma } from '../generated/prisma/client'

import { ROL_SUPERADMIN } from '../../shared/permisos'
import type { UsuarioAdminDatos, usuarioListaQuery } from '../../shared/schemas/usuario'
import type { z } from 'zod'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { hashContrasena } from '../utils/contrasenas'
import { prisma, type Tx } from '../utils/prisma'
import { enviarInvitacion } from './accesos'
import { notificar } from './notificaciones'
import { invalidarPermisos, type Ambito } from './permisos'
import { cerrarSesiones } from './sesiones'

type ListaQuery = z.output<typeof usuarioListaQuery>

const SELECT_USUARIO = {
  id: true,
  email: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  telefono: true,
  activo: true,
  bloqueadoHasta: true,
  ultimoAcceso: true,
  creadoEn: true,
  roles: {
    select: { rol: { select: { id: true, clave: true, nombre: true } }, organizacion: { select: { id: true, nombre: true } } },
    orderBy: { asignadoEn: 'asc' },
  },
  perfil: { select: { estadoValidacion: true, fotoId: true, especialidad: { select: { nombre: true } } } },
} as const satisfies Prisma.UsuarioSelect

type FilaUsuario = Prisma.UsuarioGetPayload<{ select: typeof SELECT_USUARIO }>

function aDto(u: FilaUsuario) {
  const { roles, perfil, ...resto } = u
  return {
    ...resto,
    /** Roles generales (los edita este formulario). */
    roles: roles.filter(r => !r.organizacion).map(r => r.rol),
    /** Roles ligados a una organización (se administran desde la organización). */
    rolesEnOrganizaciones: roles.filter(r => r.organizacion).map(r => ({ ...r.rol, organizacion: r.organizacion! })),
    especialidad: perfil?.especialidad?.nombre ?? null,
    estadoValidacion: perfil?.estadoValidacion ?? null,
    fotoId: perfil?.fotoId ?? null,
    /** Nunca ha entrado: la invitación sigue pendiente. */
    sinActivar: !u.ultimoAcceso,
  }
}
export type UsuarioDto = ReturnType<typeof aDto>

export async function listarUsuarios(q: ListaQuery, ambito: Ambito) {
  const where: Prisma.UsuarioWhereInput = {
    activo: q.activo,
    ...(q.rolId ? { roles: { some: { rolId: q.rolId } } } : {}),
    ...(q.q
      ? {
          OR: (['nombre', 'apellidoPaterno', 'apellidoMaterno', 'email'] as const).map(campo => ({
            [campo]: { contains: q.q, mode: 'insensitive' as const },
          })),
        }
      : {}),
    // Alcance ORGANIZACION: sólo integrantes (o solicitantes) y representantes de sus organizaciones.
    ...(ambito.todas
      ? {}
      : {
          AND: [{
            OR: [
              { membresias: { some: { organizacionId: { in: ambito.ids }, estado: { in: ['SOLICITADA', 'ACTIVA'] } } } },
              { roles: { some: { organizacionId: { in: ambito.ids } } } },
            ],
          }],
        }),
  }
  const [total, filas] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      select: SELECT_USUARIO,
      orderBy: [{ apellidoPaterno: 'asc' }, { nombre: 'asc' }],
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
    }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos: filas.map(aDto) }
}

export async function obtenerUsuario(id: string) {
  const u = await prisma.usuario.findUnique({ where: { id }, select: SELECT_USUARIO })
  if (!u) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
  return aDto(u)
}

export async function esSuperadmin(usuarioId: string, db: Tx | typeof prisma = prisma) {
  return !!(await db.usuarioRol.findFirst({ where: { usuarioId, organizacionId: null, rol: { clave: ROL_SUPERADMIN } }, select: { id: true } }))
}

/** Superadministradores activos con el rol asignado. */
function contarSuperadmins(tx: Tx, excepto?: string) {
  return tx.usuario.count({
    where: { activo: true, roles: { some: { rol: { clave: ROL_SUPERADMIN } } }, ...(excepto ? { id: { not: excepto } } : {}) },
  })
}

/** Verifica que los roles existan y estén activos; sólo un superadministrador asigna ese rol. */
async function validarRoles(tx: Tx, rolIds: string[]) {
  const unicos = [...new Set(rolIds)]
  const roles = await tx.rol.findMany({ where: { id: { in: unicos } }, select: { id: true, clave: true, activo: true } })
  if (roles.length !== unicos.length || roles.some(r => !r.activo)) {
    throw createError({ statusCode: 400, message: 'Algún rol no existe o está desactivado', data: { campos: { rolIds: 'Rol inválido' } } })
  }
  return { ids: unicos, incluyeSuperadmin: roles.some(r => r.clave === ROL_SUPERADMIN) }
}

function conflictoCorreo(e: unknown): never {
  if ((e as { code?: string }).code === 'P2002') {
    throw createError({ statusCode: 409, message: 'Ese correo ya está registrado', data: { campos: { email: 'Ya existe' } } })
  }
  throw e
}

/**
 * Crea la cuenta y envía la invitación para que el usuario defina su contraseña.
 * La contraseña inicial es aleatoria y nadie la conoce.
 */
export async function crearUsuario(d: UsuarioAdminDatos, ctx: ContextoAuditoria) {
  const autorEsSuperadmin = !!ctx.usuarioId && await esSuperadmin(ctx.usuarioId)
  const passwordHash = await hashContrasena(randomUUID())
  let usuario: UsuarioDto
  try {
    usuario = await prisma.$transaction(async (tx) => {
      const roles = await validarRoles(tx, d.rolIds)
      if (roles.incluyeSuperadmin && !autorEsSuperadmin) {
        throw createError({ statusCode: 403, message: 'Sólo un superadministrador puede asignar ese rol' })
      }
      const u = await tx.usuario.create({
        data: {
          email: d.email,
          nombre: d.nombre,
          apellidoPaterno: d.apellidoPaterno,
          apellidoMaterno: d.apellidoMaterno,
          telefono: d.telefono,
          passwordHash,
          debeCambiarPassword: false,
          roles: { create: roles.ids.map(rolId => ({ rolId, asignadoPorId: ctx.usuarioId ?? null })) },
        },
        select: SELECT_USUARIO,
      })
      const dto = aDto(u)
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Usuario', entidadId: u.id, despues: dto })
      return dto
    })
  }
  catch (e) {
    conflictoCorreo(e)
  }
  const invitacion = await enviarInvitacion(usuario.id, ctx)
  return { usuario, invitacion }
}

export async function actualizarUsuario(id: string, d: UsuarioAdminDatos, ctx: ContextoAuditoria) {
  const autorEsSuperadmin = !!ctx.usuarioId && await esSuperadmin(ctx.usuarioId)
  let resultado: { dto: UsuarioDto, cambianRoles: boolean }
  try {
    resultado = await prisma.$transaction(async (tx) => {
      const filaAntes = await tx.usuario.findUnique({ where: { id }, select: SELECT_USUARIO })
      if (!filaAntes) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
      const antes = aDto(filaAntes)
      const roles = await validarRoles(tx, d.rolIds)

      const teniaSuper = antes.roles.some(r => r.clave === ROL_SUPERADMIN)
      if (teniaSuper !== roles.incluyeSuperadmin) {
        if (!autorEsSuperadmin) throw createError({ statusCode: 403, message: 'Sólo un superadministrador puede asignar o quitar ese rol' })
        if (teniaSuper && id === ctx.usuarioId) throw createError({ statusCode: 400, message: 'No puede quitarse a sí mismo el rol de superadministrador' })
        if (teniaSuper && antes.activo && (await contarSuperadmins(tx, id)) === 0) {
          throw createError({ statusCode: 400, message: 'Debe quedar al menos un superadministrador activo' })
        }
      }

      const idsAntes = antes.roles.map(r => r.id)
      const quitar = idsAntes.filter(r => !roles.ids.includes(r))
      const agregar = roles.ids.filter(r => !idsAntes.includes(r))
      if (quitar.length) await tx.usuarioRol.deleteMany({ where: { usuarioId: id, organizacionId: null, rolId: { in: quitar } } })
      if (agregar.length) await tx.usuarioRol.createMany({ data: agregar.map(rolId => ({ usuarioId: id, rolId, asignadoPorId: ctx.usuarioId ?? null })) })

      const u = await tx.usuario.update({
        where: { id },
        data: {
          email: d.email,
          nombre: d.nombre,
          apellidoPaterno: d.apellidoPaterno,
          apellidoMaterno: d.apellidoMaterno,
          telefono: d.telefono,
        },
        select: SELECT_USUARIO,
      })
      const despues = aDto(u)
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Usuario', entidadId: id, antes, despues })
      const cambianRoles = quitar.length + agregar.length > 0
      if (cambianRoles) {
        await notificar(tx, id, {
          tipo: 'CUENTA',
          titulo: 'Sus roles cambiaron',
          cuerpo: `Roles actuales: ${despues.roles.map(r => r.nombre).join(', ') || 'ninguno'}.`,
        })
      }
      return { dto: despues, cambianRoles }
    })
  }
  catch (e) {
    conflictoCorreo(e)
  }
  if (resultado.cambianRoles) invalidarPermisos(id)
  return resultado.dto
}

export async function cambiarActivo(id: string, activo: boolean, motivo: string | null, ctx: ContextoAuditoria) {
  if (id === ctx.usuarioId && !activo) throw createError({ statusCode: 400, message: 'No puede desactivar su propia cuenta' })
  const dto = await prisma.$transaction(async (tx) => {
    const antes = await tx.usuario.findUnique({ where: { id }, select: { activo: true } })
    if (!antes) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
    if (!activo && await esSuperadmin(id, tx) && (await contarSuperadmins(tx, id)) === 0) {
      throw createError({ statusCode: 400, message: 'Debe quedar al menos un superadministrador activo' })
    }
    const u = await tx.usuario.update({
      where: { id },
      data: { activo, versionSesion: { increment: 1 } },
      select: SELECT_USUARIO,
    })
    if (!activo) await cerrarSesiones(tx, id, 'DESACTIVADO')
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Usuario.activo', entidadId: id, antes, despues: { activo }, motivo })
    return aDto(u)
  })
  invalidarPermisos(id)
  return dto
}
