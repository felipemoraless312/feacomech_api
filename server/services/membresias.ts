// Integrantes de colegios y asociaciones. Flujo:
//   representante (o el propio médico) solicita → la Federación valida (ACTIVA) o rechaza;
//   una baja la puede solicitar el representante o el integrante y la confirma la Federación.
// Cada alta es un renglón nuevo de Membresia: el conjunto es el historial de afiliaciones.
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import { aFecha, type altaIntegranteSchema, type bajaSchema, type integrantesQuery, type resolverSchema } from '../../shared/schemas/organizacion'
import { nombreCompleto } from '../../shared/texto'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { hashContrasena } from '../utils/contrasenas'
import { prisma, type Tx } from '../utils/prisma'
import { enviarInvitacion } from './accesos'
import { notificar } from './notificaciones'
import { invalidarPermisos, usuariosConPermisoTotal, type Ambito } from './permisos'

/** Rol general que reciben los profesionales con al menos una membresía activa. */
export const ROL_AFILIADO = 'MEDICO_AFILIADO'

const hoy = () => aFecha(new Date().toISOString().slice(0, 10))

const SELECT_INTEGRANTE = {
  id: true,
  estado: true,
  numeroSocio: true,
  desde: true,
  hasta: true,
  solicitadaEn: true,
  comentario: true,
  motivo: true,
  bajaSolicitadaEn: true,
  resueltaEn: true,
  usuario: {
    select: {
      id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true, activo: true,
      perfil: { select: { fotoId: true, cedulaProfesional: true, estadoValidacion: true, especialidad: { select: { nombre: true } } } },
    },
  },
  solicitadaPor: { select: { nombre: true, apellidoPaterno: true } },
} as const satisfies Prisma.MembresiaSelect

export async function listarIntegrantes(organizacionId: string, q: z.output<typeof integrantesQuery>) {
  const where: Prisma.MembresiaWhereInput = {
    organizacionId,
    ...(q.estado ? { estado: q.estado } : { estado: { in: ['SOLICITADA', 'ACTIVA'] } }),
    ...(q.q
      ? { usuario: { OR: (['nombre', 'apellidoPaterno', 'apellidoMaterno', 'email'] as const).map(c => ({ [c]: { contains: q.q, mode: 'insensitive' as const } })) } }
      : {}),
  }
  const [total, datos] = await Promise.all([
    prisma.membresia.count({ where }),
    prisma.membresia.findMany({
      where,
      select: SELECT_INTEGRANTE,
      orderBy: [{ estado: 'asc' }, { usuario: { apellidoPaterno: 'asc' } }],
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
    }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos }
}
export type IntegranteDto = Awaited<ReturnType<typeof listarIntegrantes>>['datos'][number]

async function avisarValidadores(tx: Tx, titulo: string, cuerpo: string) {
  for (const u of await usuariosConPermisoTotal(tx, 'afiliacion.validar')) {
    await notificar(tx, u.id, { tipo: 'AFILIACION', titulo, cuerpo, enlace: '/plataforma/afiliaciones' })
  }
}

async function exigirOrganizacionAbierta(tx: Tx, organizacionId: string) {
  const o = await tx.organizacion.findUnique({ where: { id: organizacionId }, select: { nombre: true, estadoAfiliacion: true } })
  if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
  if (o.estadoAfiliacion === 'BAJA') throw createError({ statusCode: 400, message: 'La organización está dada de baja en la Federación' })
  return o
}

async function crearSolicitud(tx: Tx, usuarioId: string, organizacionId: string, datos: { numeroSocio?: string | null, comentario?: string | null }, ctx: ContextoAuditoria) {
  try {
    const m = await tx.membresia.create({
      data: { usuarioId, organizacionId, estado: 'SOLICITADA', numeroSocio: datos.numeroSocio ?? null, comentario: datos.comentario ?? null, solicitadaPorId: ctx.usuarioId ?? null },
    })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Membresia', entidadId: m.id, despues: m })
    return m
  }
  catch (e) {
    if ((e as { code?: string }).code === 'P2002' || /Membresia_abierta_key/.test(String((e as Error).message))) {
      throw createError({ statusCode: 409, message: 'Ya tiene una solicitud en trámite o una membresía activa en esta organización' })
    }
    throw e
  }
}

/**
 * El representante solicita el alta de un profesional. Si el correo no está registrado se
 * crea su cuenta (sin roles ni acceso hasta que la Federación valide la membresía).
 */
export async function solicitarAlta(organizacionId: string, d: z.output<typeof altaIntegranteSchema>, ctx: ContextoAuditoria) {
  const passwordHash = await hashContrasena(randomUUID())
  return prisma.$transaction(async (tx) => {
    const o = await exigirOrganizacionAbierta(tx, organizacionId)
    let u = await tx.usuario.findUnique({ where: { email: d.email }, select: { id: true, activo: true } })
    if (u && !u.activo) throw createError({ statusCode: 400, message: 'Esa cuenta está desactivada; comuníquese con la Federación', data: { campos: { email: 'Cuenta desactivada' } } })
    if (!u) {
      u = await tx.usuario.create({
        data: {
          email: d.email,
          nombre: d.nombre,
          apellidoPaterno: d.apellidoPaterno,
          apellidoMaterno: d.apellidoMaterno,
          passwordHash,
          debeCambiarPassword: false,
          perfil: { create: { cedulaProfesional: d.cedulaProfesional, especialidadId: d.especialidadId } },
        },
        select: { id: true, activo: true },
      })
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Usuario', entidadId: u.id, motivo: `Solicitud de alta en ${o.nombre}` })
    }
    const m = await crearSolicitud(tx, u.id, organizacionId, d, ctx)
    await avisarValidadores(tx, `Solicitud de alta: ${o.nombre}`, `${nombreCompleto(d)} (${d.email})`)
    return m
  })
}

/** El propio profesional solicita afiliarse a una organización. */
export async function solicitarAfiliacionPropia(usuarioId: string, organizacionId: string, comentario: string | null, ctx: ContextoAuditoria) {
  return prisma.$transaction(async (tx) => {
    const o = await exigirOrganizacionAbierta(tx, organizacionId)
    const u = await tx.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true } })
    const m = await crearSolicitud(tx, usuarioId, organizacionId, { comentario }, ctx)
    await avisarValidadores(tx, `Solicitud de afiliación: ${o.nombre}`, `${nombreCompleto(u)} solicitó su afiliación.`)
    return m
  })
}

/** La Federación valida (alta) o rechaza una solicitud. */
export async function resolverMembresia(id: string, d: z.output<typeof resolverSchema>, ctx: ContextoAuditoria) {
  const r = await prisma.$transaction(async (tx) => {
    const m = await tx.membresia.findUnique({
      where: { id },
      include: { organizacion: { select: { nombre: true } }, usuario: { select: { ultimoAcceso: true, activo: true } } },
    })
    if (!m) throw createError({ statusCode: 404, message: 'Solicitud no encontrada' })
    if (m.estado !== 'SOLICITADA') throw createError({ statusCode: 409, message: 'La solicitud ya fue resuelta' })
    const resuelta = { resueltaPorId: ctx.usuarioId ?? null, resueltaEn: new Date() }

    if (d.decision === 'APROBAR') {
      const desde = d.desde ? aFecha(d.desde) : hoy()
      await tx.membresia.update({ where: { id }, data: { estado: 'ACTIVA', desde, numeroSocio: d.numeroSocio ?? m.numeroSocio, ...resuelta } })
      await asegurarRolAfiliado(tx, m.usuarioId, ctx)
      await auditar(tx, ctx, { accion: 'VALIDAR', entidad: 'Membresia', entidadId: id, despues: { estado: 'ACTIVA', desde: d.desde } })
      await notificar(tx, m.usuarioId, {
        tipo: 'AFILIACION',
        titulo: `Afiliación validada: ${m.organizacion.nombre}`,
        cuerpo: 'La Federación validó su membresía.',
        enlace: '/plataforma/cuenta/perfil',
      })
      return { usuarioId: m.usuarioId, invitar: !m.usuario.ultimoAcceso && m.usuario.activo }
    }

    await tx.membresia.update({ where: { id }, data: { estado: 'RECHAZADA', motivo: d.motivo, ...resuelta } })
    await auditar(tx, ctx, { accion: 'RECHAZAR', entidad: 'Membresia', entidadId: id, motivo: d.motivo })
    await notificar(tx, m.usuarioId, {
      tipo: 'AFILIACION',
      titulo: `Solicitud no aprobada: ${m.organizacion.nombre}`,
      cuerpo: d.motivo,
      enlace: '/plataforma/cuenta/perfil',
    })
    return { usuarioId: m.usuarioId, invitar: false }
  })
  invalidarPermisos(r.usuarioId)
  // Primera membresía de alguien que nunca entró: se le envía su invitación para activar la cuenta.
  const invitacion = r.invitar ? await enviarInvitacion(r.usuarioId, ctx) : null
  return { invitacion }
}

async function asegurarRolAfiliado(tx: Tx, usuarioId: string, ctx: ContextoAuditoria) {
  const rol = await tx.rol.findUnique({ where: { clave: ROL_AFILIADO }, select: { id: true, activo: true } })
  if (!rol?.activo) return
  const tiene = await tx.usuarioRol.findFirst({ where: { usuarioId, rolId: rol.id, organizacionId: null }, select: { id: true } })
  if (!tiene) await tx.usuarioRol.create({ data: { usuarioId, rolId: rol.id, asignadoPorId: ctx.usuarioId ?? null } })
}

/** El representante o el propio integrante piden la baja; la Federación la confirma. */
export async function solicitarBaja(id: string, motivo: string, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const m = await tx.membresia.findUnique({ where: { id }, include: { organizacion: { select: { nombre: true } }, usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } } })
    if (!m) throw createError({ statusCode: 404, message: 'Membresía no encontrada' })
    if (m.estado !== 'ACTIVA') throw createError({ statusCode: 409, message: 'Sólo se puede solicitar la baja de una membresía activa' })
    if (m.bajaSolicitadaEn) throw createError({ statusCode: 409, message: 'La baja ya fue solicitada' })
    await tx.membresia.update({ where: { id }, data: { bajaSolicitadaEn: new Date(), motivo } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Membresia.bajaSolicitada', entidadId: id, motivo })
    await avisarValidadores(tx, `Solicitud de baja: ${m.organizacion.nombre}`, `${nombreCompleto(m.usuario)}: ${motivo}`)
  })
}

/** La Federación da de baja (directamente o confirmando una solicitud). */
export async function darDeBaja(id: string, d: z.output<typeof bajaSchema>, ctx: ContextoAuditoria) {
  const usuarioId = await prisma.$transaction(async (tx) => {
    const m = await tx.membresia.findUnique({ where: { id }, include: { organizacion: { select: { nombre: true } } } })
    if (!m) throw createError({ statusCode: 404, message: 'Membresía no encontrada' })
    if (m.estado !== 'ACTIVA') throw createError({ statusCode: 409, message: 'La membresía no está activa' })
    const hasta = d.hasta ? aFecha(d.hasta) : hoy()
    if (m.desde && hasta < m.desde) throw createError({ statusCode: 400, message: 'La fecha de baja es anterior al alta', data: { campos: { hasta: 'Anterior al alta' } } })
    await tx.membresia.update({ where: { id }, data: { estado: 'BAJA', hasta, motivo: d.motivo, resueltaPorId: ctx.usuarioId ?? null, resueltaEn: new Date() } })

    // Sin otra membresía activa deja de ser médico afiliado (el rol general).
    const otras = await tx.membresia.count({ where: { usuarioId: m.usuarioId, estado: 'ACTIVA' } })
    if (!otras) await tx.usuarioRol.deleteMany({ where: { usuarioId: m.usuarioId, organizacionId: null, rol: { clave: ROL_AFILIADO } } })

    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Membresia', entidadId: id, despues: { estado: 'BAJA', hasta: d.hasta }, motivo: d.motivo })
    await notificar(tx, m.usuarioId, { tipo: 'AFILIACION', titulo: `Baja registrada: ${m.organizacion.nombre}`, cuerpo: d.motivo, enlace: '/plataforma/cuenta/perfil' })
    return m.usuarioId
  })
  invalidarPermisos(usuarioId)
}

/** Historial de afiliaciones del profesional (todas sus membresías). */
export function misMembresias(usuarioId: string) {
  return prisma.membresia.findMany({
    where: { usuarioId },
    orderBy: { solicitadaEn: 'desc' },
    select: {
      id: true, estado: true, numeroSocio: true, desde: true, hasta: true, solicitadaEn: true, motivo: true, bajaSolicitadaEn: true,
      organizacion: { select: { id: true, nombre: true, tipo: true, slug: true, logoId: true } },
    },
  })
}
export type MiMembresiaDto = Awaited<ReturnType<typeof misMembresias>>[number]

/** Organizaciones a las que un profesional puede solicitar afiliarse. */
export function organizacionesDisponibles() {
  return prisma.organizacion.findMany({
    where: { estadoAfiliacion: { in: ['AFILIADA', 'EN_TRAMITE'] } },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true, tipo: true, municipio: true },
  })
}

/** Bandeja: solicitudes de alta, bajas solicitadas y cambios de datos pendientes. */
export async function bandejaAfiliaciones(ambito: Ambito) {
  const enAmbito = ambito.todas ? {} : { organizacionId: { in: ambito.ids } }
  const [membresias, cambios] = await Promise.all([
    prisma.membresia.findMany({
      where: { ...enAmbito, OR: [{ estado: 'SOLICITADA' }, { estado: 'ACTIVA', bajaSolicitadaEn: { not: null } }] },
      orderBy: { solicitadaEn: 'asc' },
      select: { ...SELECT_INTEGRANTE, organizacion: { select: { id: true, nombre: true } } },
    }),
    prisma.solicitudCambio.findMany({
      where: { ...enAmbito, estado: 'PENDIENTE' },
      orderBy: { creadaEn: 'asc' },
      include: {
        organizacion: { select: { id: true, nombre: true, siglas: true, descripcion: true, fechaConstitucion: true, municipio: true, direccion: true, telefono: true, email: true, sitioWeb: true } },
        solicitadaPor: { select: { nombre: true, apellidoPaterno: true } },
      },
    }),
  ])
  return { membresias, cambios }
}
export type BandejaDto = Awaited<ReturnType<typeof bandejaAfiliaciones>>

/** Membresía con la organización, para comprobar permisos antes de actuar sobre ella. */
export async function organizacionDeMembresia(id: string) {
  const m = await prisma.membresia.findUnique({ where: { id }, select: { organizacionId: true, usuarioId: true } })
  if (!m) throw createError({ statusCode: 404, message: 'Membresía no encontrada' })
  return m
}
