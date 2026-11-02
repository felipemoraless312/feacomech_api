// Profesionales registrados (usuarios con perfil profesional) y validación de sus datos.
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { profesionalesQuery, validarPerfilSchema } from '../../shared/schemas/organizacion'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma } from '../utils/prisma'
import { notificar } from './notificaciones'
import type { Ambito } from './permisos'

export async function listarProfesionales(q: z.output<typeof profesionalesQuery>, ambito: Ambito) {
  const orgs = ambito.todas ? null : ambito.ids
  const where: Prisma.UsuarioWhereInput = {
    perfil: {
      is: {
        ...(q.especialidadId ? { especialidadId: q.especialidadId } : {}),
        ...(q.estadoValidacion ? { estadoValidacion: q.estadoValidacion } : {}),
        ...(q.conCedula ? { cedulaProfesional: { not: null } } : {}),
      },
    },
    // Con alcance de organización sólo ve a quienes pertenecen (o solicitaron pertenecer) a las suyas.
    ...(orgs || q.organizacionId
      ? {
          membresias: {
            some: {
              estado: { in: ['SOLICITADA', 'ACTIVA'] },
              organizacionId: q.organizacionId ? (orgs && !orgs.includes(q.organizacionId) ? { in: [] } : q.organizacionId) : { in: orgs! },
            },
          },
        }
      : {}),
    ...(q.q
      ? {
          OR: [
            ...(['nombre', 'apellidoPaterno', 'apellidoMaterno', 'email'] as const).map(c => ({ [c]: { contains: q.q, mode: 'insensitive' as const } })),
            { perfil: { cedulaProfesional: { startsWith: q.q.replace(/\s/g, '') } } },
          ],
        }
      : {}),
  }
  const [total, datos] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      orderBy: [{ apellidoPaterno: 'asc' }, { nombre: 'asc' }],
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      select: {
        id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true, telefono: true, activo: true, creadoEn: true,
        perfil: {
          select: {
            fotoId: true, cedulaProfesional: true, cedulaEspecialidad: true, estadoValidacion: true, validadoEn: true, motivoRechazo: true,
            institucionTrabajo: true, mostrarInstitucion: true, cargoInstitucional: true,
            especialidad: { select: { nombre: true } }, subespecialidad: { select: { nombre: true } },
          },
        },
        membresias: {
          where: { estado: { in: ['SOLICITADA', 'ACTIVA'] } },
          select: { estado: true, organizacion: { select: { id: true, nombre: true, siglas: true } } },
        },
      },
    }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos }
}
export type ProfesionalDto = Awaited<ReturnType<typeof listarProfesionales>>['datos'][number]

/** La Federación valida o anota observaciones a los datos profesionales (cédulas, especialidad). */
export async function validarPerfil(usuarioId: string, d: z.output<typeof validarPerfilSchema>, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const p = await tx.perfilProfesional.findUnique({ where: { usuarioId }, select: { cedulaProfesional: true, estadoValidacion: true } })
    if (!p?.cedulaProfesional) throw createError({ statusCode: 400, message: 'El perfil no tiene cédula profesional que validar' })
    const rechazo = d.decision === 'RECHAZADO' ? d.motivo : null
    await tx.perfilProfesional.update({
      where: { usuarioId },
      data: { estadoValidacion: d.decision, validadoPorId: ctx.usuarioId ?? null, validadoEn: new Date(), motivoRechazo: rechazo },
    })
    await auditar(tx, ctx, {
      accion: d.decision === 'VALIDADO' ? 'VALIDAR' : 'RECHAZAR',
      entidad: 'PerfilProfesional',
      entidadId: usuarioId,
      antes: { estadoValidacion: p.estadoValidacion },
      despues: { estadoValidacion: d.decision },
      motivo: rechazo,
    })
    await notificar(tx, usuarioId, {
      tipo: 'CUENTA',
      titulo: d.decision === 'VALIDADO' ? 'Datos profesionales validados' : 'Observaciones a sus datos profesionales',
      cuerpo: rechazo ?? 'La Federación validó su cédula y especialidad.',
      enlace: '/plataforma/cuenta/perfil',
    })
  })
}

/**
 * Directorio público de profesionales: sólo quienes autorizaron aparecer, con datos validados
 * por la Federación y al menos una membresía activa. Nunca correo, teléfono ni cédula.
 */
export async function profesionalesPublicos(q: { q?: string, especialidadId?: string, pagina: number, porPagina: number }) {
  const where: Prisma.UsuarioWhereInput = {
    activo: true,
    perfil: { is: { publicarDirectorio: true, estadoValidacion: 'VALIDADO', ...(q.especialidadId ? { especialidadId: q.especialidadId } : {}) } },
    membresias: { some: { estado: 'ACTIVA' } },
    ...(q.q ? { OR: (['nombre', 'apellidoPaterno', 'apellidoMaterno'] as const).map(c => ({ [c]: { contains: q.q, mode: 'insensitive' as const } })) } : {}),
  }
  const [total, filas] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      orderBy: [{ apellidoPaterno: 'asc' }, { nombre: 'asc' }],
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      select: {
        nombre: true, apellidoPaterno: true, apellidoMaterno: true,
        perfil: { select: { fotoId: true, mostrarInstitucion: true, institucionTrabajo: true, especialidad: { select: { nombre: true } }, subespecialidad: { select: { nombre: true } } } },
        membresias: {
          where: { estado: 'ACTIVA', organizacion: { publica: true, estadoAfiliacion: 'AFILIADA' } },
          select: { organizacion: { select: { nombre: true, siglas: true, slug: true } } },
        },
      },
    }),
  ])
  return {
    total,
    pagina: q.pagina,
    porPagina: q.porPagina,
    datos: filas.map(u => ({
      nombre: [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' '),
      fotoId: u.perfil?.fotoId ?? null,
      especialidad: u.perfil?.especialidad?.nombre ?? null,
      subespecialidad: u.perfil?.subespecialidad?.nombre ?? null,
      institucion: u.perfil?.mostrarInstitucion ? u.perfil.institucionTrabajo : null,
      organizaciones: u.membresias.map(m => ({ nombre: m.organizacion.siglas || m.organizacion.nombre, slug: m.organizacion.slug })),
    })),
  }
}
