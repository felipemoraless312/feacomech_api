// Eventos y educación médica continua: gestión (Federación u organizaciones), programa,
// ponentes, inscripción con cupo y lista de espera, asistencia por día y constancias con
// folio y código de verificación.
import { randomBytes } from 'node:crypto'
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { EstadoEvento } from '../generated/prisma/enums'
import {
  aInstante, type actividadSchema, type asistenciaSchema, type eventoSchema, type eventosPublicosQuery,
  type eventosQuery, type ponenteSchema,
} from '../../shared/schemas/eventos'
import { aFecha } from '../../shared/schemas/organizacion'
import { nombreCompleto, ZONA_HORARIA } from '../../shared/texto'
import { IMAGENES, borrarDeDisco, guardarArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { siguienteFolio } from '../utils/folios'
import { prisma, type Tx } from '../utils/prisma'
import { notificar } from './notificaciones'
import { slugDe } from './organizaciones'
import type { Ambito } from './permisos'

export const MAX_PORTADA_EVENTO = 4 * 1024 * 1024
type Datos = z.output<typeof eventoSchema>

const datosEvento = (d: Datos) => ({ ...d, inicio: aInstante(d.inicio), fin: aInstante(d.fin) })

/** Día calendario en hora de México ("2026-11-20"). */
export const diaLocal = (fecha: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(fecha)

/** Días (en hora de México) que abarca el evento, para la asistencia. */
export function diasDelEvento(inicio: Date, fin: Date): string[] {
  const dias: string[] = []
  const ultimo = diaLocal(fin)
  for (let d = new Date(`${diaLocal(inicio)}T12:00:00Z`); diaLocal(d) <= ultimo && dias.length < 60; d = new Date(d.getTime() + 86_400_000)) dias.push(d.toISOString().slice(0, 10))
  return dias
}

function exigirAmbito(ambito: Ambito, organizacionId: string | null) {
  if (ambito.todas) return
  if (!organizacionId || !ambito.ids.includes(organizacionId)) {
    throw createError({ statusCode: 403, message: 'Sólo puede gestionar eventos de sus organizaciones', data: { campos: { organizacionId: 'Sin permiso' } } })
  }
}

async function eventoEnAmbito(id: string, ambito: Ambito) {
  const e = await prisma.evento.findUnique({ where: { id }, select: { organizacionId: true } })
  if (!e) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  exigirAmbito(ambito, e.organizacionId)
}

async function slugUnico(titulo: string, inicio: Date, excepto?: string) {
  const base = slugDe(`${titulo} ${inicio.getUTCFullYear()}`).slice(0, 80)
  let slug = base
  for (let i = 2; await prisma.evento.findFirst({ where: { slug, ...(excepto ? { id: { not: excepto } } : {}) }, select: { id: true } }); i++) slug = `${base}-${i}`
  return slug
}

const conteos = {
  _count: { select: { inscripciones: { where: { estado: 'CONFIRMADA' } } } },
} as const

// --- Gestión ------------------------------------------------------------------------

export async function listarEventosGestion(q: z.output<typeof eventosQuery>, ambito: Ambito) {
  const ahora = new Date()
  const where: Prisma.EventoWhereInput = {
    ...(ambito.todas ? {} : { organizacionId: { in: ambito.ids } }),
    ...(q.estado ? { estado: q.estado } : {}),
    ...(q.periodo === 'proximos' ? { fin: { gte: ahora } } : q.periodo === 'pasados' ? { fin: { lt: ahora } } : {}),
    ...(q.q ? { titulo: { contains: q.q, mode: 'insensitive' } } : {}),
  }
  const [total, filas] = await Promise.all([
    prisma.evento.count({ where }),
    prisma.evento.findMany({
      where,
      orderBy: { inicio: q.periodo === 'pasados' ? 'desc' : 'asc' },
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      select: {
        id: true, slug: true, tipo: true, titulo: true, inicio: true, fin: true, modalidad: true, sede: true, estado: true,
        capacidad: true, portadaId: true, organizacion: { select: { nombre: true, siglas: true } }, ...conteos,
      },
    }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos: filas.map(({ _count, ...e }) => ({ ...e, confirmados: _count.inscripciones })) }
}
export type EventoFila = Awaited<ReturnType<typeof listarEventosGestion>>['datos'][number]

export async function obtenerEventoGestion(id: string, ambito: Ambito) {
  await eventoEnAmbito(id, ambito)
  const e = await prisma.evento.findUniqueOrThrow({
    where: { id },
    include: {
      programa: { orderBy: { inicio: 'asc' } },
      ponentes: { orderBy: [{ orden: 'asc' }, { nombre: 'asc' }] },
      organizacion: { select: { id: true, nombre: true } },
      ...conteos,
    },
  })
  const { _count, ...resto } = e
  return { ...resto, confirmados: _count.inscripciones, dias: diasDelEvento(e.inicio, e.fin) }
}
export type EventoGestion = Awaited<ReturnType<typeof obtenerEventoGestion>>

export async function crearEvento(d: Datos, ambito: Ambito, ctx: ContextoAuditoria) {
  exigirAmbito(ambito, d.organizacionId)
  const datos = datosEvento(d)
  return prisma.$transaction(async (tx) => {
    const e = await tx.evento.create({ data: { ...datos, slug: await slugUnico(d.titulo, datos.inicio), creadoPorId: ctx.usuarioId ?? null } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Evento', entidadId: e.id, despues: { ...d, descripcion: undefined } })
    return e
  })
}

export async function actualizarEvento(id: string, d: Datos, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(id, ambito)
  exigirAmbito(ambito, d.organizacionId)
  const datos = datosEvento(d)
  await prisma.$transaction(async (tx) => {
    const antes = await tx.evento.findUniqueOrThrow({ where: { id } })
    // El enlace de un evento ya publicado no cambia.
    const slug = antes.estado === 'BORRADOR' ? await slugUnico(d.titulo, datos.inicio, id) : antes.slug
    if (d.capacidad && antes.capacidad !== d.capacidad) {
      const confirmados = await tx.inscripcion.count({ where: { eventoId: id, estado: 'CONFIRMADA' } })
      if (d.capacidad < confirmados) {
        throw createError({ statusCode: 400, message: `Ya hay ${confirmados} inscritos confirmados; el cupo no puede ser menor`, data: { campos: { capacidad: `Mínimo ${confirmados}` } } })
      }
    }
    await tx.evento.update({ where: { id }, data: { ...datos, slug } })
    if (d.capacidad !== antes.capacidad) await promoverListaEspera(tx, id)
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Evento', entidadId: id, antes: { titulo: antes.titulo, inicio: antes.inicio, capacidad: antes.capacidad }, despues: { titulo: d.titulo, inicio: datos.inicio, capacidad: d.capacidad } })
  })
}

export async function cambiarEstadoEvento(id: string, estado: EstadoEvento, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(id, ambito)
  await prisma.$transaction(async (tx) => {
    const e = await tx.evento.findUniqueOrThrow({ where: { id } })
    if (e.estado === estado) return
    if (estado === 'BORRADOR' && await tx.inscripcion.count({ where: { eventoId: id, estado: { not: 'CANCELADA' } } })) {
      throw createError({ statusCode: 409, message: 'Ya tiene inscritos: puede cancelarlo, pero no regresarlo a borrador' })
    }
    await tx.evento.update({ where: { id }, data: { estado } })
    if (e.portadaId) await tx.archivo.update({ where: { id: e.portadaId }, data: { visibilidad: estado === 'BORRADOR' ? 'AUTENTICADO' : 'PUBLICO' } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Evento.estado', entidadId: id, antes: { estado: e.estado }, despues: { estado } })
    if (estado === 'CANCELADO') {
      const inscritos = await tx.inscripcion.findMany({ where: { eventoId: id, estado: { not: 'CANCELADA' } }, select: { usuarioId: true } })
      for (const i of inscritos) await notificar(tx, i.usuarioId, { tipo: 'EVENTO', titulo: `Evento cancelado: ${e.titulo}`, enlace: `/plataforma/eventos/${id}` })
    }
  })
}

export async function guardarPortadaEvento(id: string, datos: Buffer, nombre: string, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(id, ambito)
  const rutaAnterior = await prisma.$transaction(async (tx) => {
    const e = await tx.evento.findUniqueOrThrow({ where: { id }, include: { portada: { select: { id: true, ruta: true } } } })
    const archivo = await guardarArchivo(tx, { datos, nombreOriginal: nombre, permitidos: IMAGENES, maxBytes: MAX_PORTADA_EVENTO, visibilidad: e.estado === 'BORRADOR' ? 'AUTENTICADO' : 'PUBLICO', subidoPorId: ctx.usuarioId ?? null })
    await tx.evento.update({ where: { id }, data: { portadaId: archivo.id } })
    if (e.portada) await tx.archivo.delete({ where: { id: e.portada.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Evento.portada', entidadId: id })
    return e.portada?.ruta
  })
  if (rutaAnterior) await borrarDeDisco(rutaAnterior)
}

// --- Programa y ponentes ------------------------------------------------------------------

export async function guardarActividad(eventoId: string, id: string | null, d: z.output<typeof actividadSchema>, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(eventoId, ambito)
  const datos = { ...d, inicio: aInstante(d.inicio), fin: d.fin ? aInstante(d.fin) : null }
  return prisma.$transaction(async (tx) => {
    const a = id
      ? await tx.actividadPrograma.update({ where: { id, eventoId }, data: datos })
      : await tx.actividadPrograma.create({ data: { ...datos, eventoId } })
    await auditar(tx, ctx, { accion: id ? 'ACTUALIZAR' : 'CREAR', entidad: 'ActividadPrograma', entidadId: a.id, despues: d })
    return a
  })
}

export async function eliminarActividad(eventoId: string, id: string, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(eventoId, ambito)
  await prisma.$transaction(async (tx) => {
    await tx.actividadPrograma.delete({ where: { id, eventoId } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'ActividadPrograma', entidadId: id })
  })
}

export async function guardarPonente(eventoId: string, id: string | null, d: z.output<typeof ponenteSchema>, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(eventoId, ambito)
  return prisma.$transaction(async (tx) => {
    const p = id ? await tx.ponente.update({ where: { id, eventoId }, data: d }) : await tx.ponente.create({ data: { ...d, eventoId } })
    await auditar(tx, ctx, { accion: id ? 'ACTUALIZAR' : 'CREAR', entidad: 'Ponente', entidadId: p.id, despues: d })
    return p
  })
}

export async function eliminarPonente(eventoId: string, id: string, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(eventoId, ambito)
  await prisma.$transaction(async (tx) => {
    await tx.ponente.delete({ where: { id, eventoId } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Ponente', entidadId: id })
  })
}

// --- Inscritos, asistencia y constancias ----------------------------------------------------

export async function listarInscritos(eventoId: string, ambito: Ambito) {
  await eventoEnAmbito(eventoId, ambito)
  const filas = await prisma.inscripcion.findMany({
    where: { eventoId },
    orderBy: [{ estado: 'asc' }, { creadaEn: 'asc' }],
    select: {
      id: true, estado: true, creadaEn: true, canceladaEn: true,
      usuario: { select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true, perfil: { select: { fotoId: true, cedulaProfesional: true, especialidad: { select: { nombre: true } } } } } },
      asistencias: { select: { fecha: true }, orderBy: { fecha: 'asc' } },
      constancia: { select: { id: true, folio: true, revocadaEn: true } },
    },
  })
  return filas.map(f => ({ ...f, asistencias: f.asistencias.map(a => a.fecha.toISOString().slice(0, 10)) }))
}
export type InscritoDto = Awaited<ReturnType<typeof listarInscritos>>[number]

/** Lista de inscritos en CSV (para imprimir listas de asistencia o hojas de registro). */
export async function inscritosCsv(eventoId: string, ambito: Ambito) {
  const filas = await listarInscritos(eventoId, ambito)
  const celda = (v: string | null | undefined) => {
    const t = (v ?? '').replace(/"/g, '""')
    // Evita fórmulas al abrir el archivo en una hoja de cálculo.
    return `"${/^[=+\-@]/.test(t) ? `'${t}` : t}"`
  }
  const lineas = [['Nombre', 'Correo', 'Cédula', 'Especialidad', 'Estado', 'Días con asistencia', 'Constancia'].map(celda).join(',')]
  for (const f of filas) {
    lineas.push([
      nombreCompleto(f.usuario), f.usuario.email, f.usuario.perfil?.cedulaProfesional, f.usuario.perfil?.especialidad?.nombre,
      f.estado, f.asistencias.join(' '), f.constancia?.folio,
    ].map(celda).join(','))
  }
  return `﻿${lineas.join('\r\n')}\r\n`
}

export async function registrarAsistencia(eventoId: string, d: z.output<typeof asistenciaSchema>, ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(eventoId, ambito)
  const e = await prisma.evento.findUniqueOrThrow({ where: { id: eventoId }, select: { inicio: true, fin: true } })
  if (!diasDelEvento(e.inicio, e.fin).includes(d.fecha)) throw createError({ statusCode: 400, message: 'La fecha no corresponde a un día del evento' })
  const inscripciones = await prisma.inscripcion.findMany({ where: { id: { in: d.inscripcionIds }, eventoId, estado: 'CONFIRMADA' }, select: { id: true } })
  if (inscripciones.length !== new Set(d.inscripcionIds).size) throw createError({ statusCode: 400, message: 'Sólo se registra asistencia de inscripciones confirmadas de este evento' })
  const fecha = aFecha(d.fecha)
  await prisma.$transaction(async (tx) => {
    if (d.asistio) {
      await tx.asistencia.createMany({ data: inscripciones.map(i => ({ inscripcionId: i.id, fecha, registradaPorId: ctx.usuarioId ?? null })), skipDuplicates: true })
    }
    else {
      await tx.asistencia.deleteMany({ where: { inscripcionId: { in: d.inscripcionIds }, fecha } })
    }
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Asistencia', entidadId: eventoId, despues: { fecha: d.fecha, asistio: d.asistio, total: inscripciones.length } })
  })
}

/** Código de verificación: 10 caracteres sin ambiguos (0/O, 1/I/L). */
function codigoVerificacion() {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from(randomBytes(10), b => alfabeto[b % alfabeto.length]).join('')
}

/**
 * Emite constancias a inscripciones confirmadas con asistencia registrada. Las que ya tienen
 * constancia se omiten. Folio consecutivo por año (CONST-AAAA-000001).
 */
export async function emitirConstancias(eventoId: string, inscripcionIds: string[], ambito: Ambito, ctx: ContextoAuditoria) {
  await eventoEnAmbito(eventoId, ambito)
  return prisma.$transaction(async (tx) => {
    const e = await tx.evento.findUniqueOrThrow({ where: { id: eventoId }, select: { titulo: true, inicio: true, estado: true } })
    if (e.estado !== 'PUBLICADO') throw createError({ statusCode: 409, message: 'Sólo se emiten constancias de eventos publicados' })
    if (e.inicio > new Date()) throw createError({ statusCode: 409, message: 'El evento aún no inicia' })
    const candidatas = await tx.inscripcion.findMany({
      where: { id: { in: inscripcionIds }, eventoId, estado: 'CONFIRMADA', constancia: null, asistencias: { some: {} } },
      select: { id: true, usuarioId: true },
    })
    for (const i of candidatas) {
      const c = await tx.constancia.create({
        data: { inscripcionId: i.id, folio: await siguienteFolio(tx, 'CONSTANCIA'), codigo: codigoVerificacion(), emitidaPorId: ctx.usuarioId ?? null },
      })
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Constancia', entidadId: c.id, despues: { folio: c.folio, inscripcionId: i.id } })
      await notificar(tx, i.usuarioId, { tipo: 'EVENTO', titulo: 'Constancia disponible', cuerpo: e.titulo, enlace: `/imprimir/constancia/${c.id}` })
    }
    return { emitidas: candidatas.length, omitidas: inscripcionIds.length - candidatas.length }
  })
}

export async function revocarConstancia(id: string, motivo: string, ambito: Ambito, ctx: ContextoAuditoria) {
  const c = await prisma.constancia.findUnique({ where: { id }, select: { revocadaEn: true, inscripcion: { select: { eventoId: true } } } })
  if (!c) throw createError({ statusCode: 404, message: 'Constancia no encontrada' })
  await eventoEnAmbito(c.inscripcion.eventoId, ambito)
  if (c.revocadaEn) throw createError({ statusCode: 409, message: 'Ya estaba revocada' })
  await prisma.$transaction(async (tx) => {
    await tx.constancia.update({ where: { id }, data: { revocadaEn: new Date(), motivoRevocacion: motivo } })
    await auditar(tx, ctx, { accion: 'RECHAZAR', entidad: 'Constancia', entidadId: id, motivo })
  })
}

// --- Participantes ---------------------------------------------------------------------------

/** Pasa a confirmadas las inscripciones en lista de espera mientras haya cupo (la más antigua primero). */
async function promoverListaEspera(tx: Tx, eventoId: string) {
  const e = await tx.evento.findUniqueOrThrow({ where: { id: eventoId }, select: { capacidad: true, titulo: true } })
  const confirmadas = await tx.inscripcion.count({ where: { eventoId, estado: 'CONFIRMADA' } })
  const libres = e.capacidad == null ? Number.MAX_SAFE_INTEGER : e.capacidad - confirmadas
  if (libres <= 0) return
  const espera = await tx.inscripcion.findMany({ where: { eventoId, estado: 'LISTA_ESPERA' }, orderBy: { creadaEn: 'asc' }, take: Math.min(libres, 1000), select: { id: true, usuarioId: true } })
  for (const i of espera) {
    await tx.inscripcion.update({ where: { id: i.id }, data: { estado: 'CONFIRMADA' } })
    await notificar(tx, i.usuarioId, { tipo: 'EVENTO', titulo: `Lugar confirmado: ${e.titulo}`, cuerpo: 'Se liberó un lugar y su inscripción quedó confirmada.', enlace: `/plataforma/eventos/${eventoId}` })
  }
}

/**
 * Inscribe al usuario. El renglón del evento se bloquea para que dos inscripciones simultáneas
 * no excedan el cupo; sin cupo, queda en lista de espera.
 */
export async function inscribirse(eventoId: string, usuarioId: string, ctx: ContextoAuditoria) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM "Evento" WHERE "id" = ${eventoId}::uuid FOR UPDATE`
    const e = await tx.evento.findUnique({ where: { id: eventoId }, select: { estado: true, inscripcionAbierta: true, fin: true, capacidad: true, titulo: true } })
    if (!e || e.estado !== 'PUBLICADO') throw createError({ statusCode: 404, message: 'Evento no disponible' })
    if (!e.inscripcionAbierta || e.fin < new Date()) throw createError({ statusCode: 409, message: 'La inscripción a este evento está cerrada' })

    const existente = await tx.inscripcion.findUnique({ where: { eventoId_usuarioId: { eventoId, usuarioId } } })
    if (existente && existente.estado !== 'CANCELADA') throw createError({ statusCode: 409, message: 'Ya está inscrito en este evento' })

    const confirmadas = await tx.inscripcion.count({ where: { eventoId, estado: 'CONFIRMADA' } })
    const estado = e.capacidad != null && confirmadas >= e.capacidad ? 'LISTA_ESPERA' as const : 'CONFIRMADA' as const
    const i = existente
      ? await tx.inscripcion.update({ where: { id: existente.id }, data: { estado, canceladaEn: null, creadaEn: new Date() } })
      : await tx.inscripcion.create({ data: { eventoId, usuarioId, estado } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Inscripcion', entidadId: i.id, despues: { eventoId, estado } })
    await notificar(tx, usuarioId, {
      tipo: 'EVENTO',
      titulo: estado === 'CONFIRMADA' ? `Inscripción confirmada: ${e.titulo}` : `En lista de espera: ${e.titulo}`,
      cuerpo: estado === 'LISTA_ESPERA' ? 'El cupo está lleno; le avisaremos si se libera un lugar.' : undefined,
      enlace: `/plataforma/eventos/${eventoId}`,
    })
    return i
  })
}

export async function cancelarInscripcion(eventoId: string, usuarioId: string, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM "Evento" WHERE "id" = ${eventoId}::uuid FOR UPDATE`
    const i = await tx.inscripcion.findUnique({ where: { eventoId_usuarioId: { eventoId, usuarioId } }, include: { constancia: { select: { id: true } } } })
    if (!i || i.estado === 'CANCELADA') throw createError({ statusCode: 404, message: 'No tiene una inscripción activa en este evento' })
    if (i.constancia) throw createError({ statusCode: 409, message: 'Ya tiene constancia emitida; la inscripción no se puede cancelar' })
    await tx.inscripcion.update({ where: { id: i.id }, data: { estado: 'CANCELADA', canceladaEn: new Date() } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Inscripcion', entidadId: i.id, antes: { estado: i.estado }, despues: { estado: 'CANCELADA' } })
    if (i.estado === 'CONFIRMADA') await promoverListaEspera(tx, eventoId)
  })
}

const SELECT_PUBLICO = {
  id: true, slug: true, tipo: true, titulo: true, inicio: true, fin: true, modalidad: true, sede: true, estado: true,
  portadaId: true, capacidad: true, valorCurricular: true, inscripcionAbierta: true,
  organizacion: { select: { nombre: true, siglas: true } }, organizador: true, ...conteos,
} as const satisfies Prisma.EventoSelect

const cupo = (e: { capacidad: number | null, _count: { inscripciones: number } }) => (e.capacidad == null ? null : Math.max(0, e.capacidad - e._count.inscripciones))

/** Eventos para la plataforma: próximos publicados y las inscripciones del usuario. */
export async function eventosParaUsuario(usuarioId: string) {
  const ahora = new Date()
  const [proximos, mias] = await Promise.all([
    prisma.evento.findMany({ where: { estado: 'PUBLICADO', fin: { gte: ahora } }, orderBy: { inicio: 'asc' }, take: 50, select: SELECT_PUBLICO }),
    prisma.inscripcion.findMany({
      where: { usuarioId, estado: { not: 'CANCELADA' } },
      orderBy: { evento: { inicio: 'desc' } },
      select: { estado: true, evento: { select: SELECT_PUBLICO }, constancia: { select: { id: true, folio: true, revocadaEn: true } } },
    }),
  ])
  const quitarConteo = <T extends { _count: unknown }>({ _count, ...e }: T) => e
  return {
    proximos: proximos.map(e => ({ ...quitarConteo(e), lugares: cupo(e), miEstado: mias.find(m => m.evento.id === e.id)?.estado ?? null })),
    inscripciones: mias.map(m => ({ estado: m.estado, constancia: m.constancia, evento: quitarConteo(m.evento) })),
  }
}
export type EventosUsuarioDto = Awaited<ReturnType<typeof eventosParaUsuario>>

/** Detalle para un usuario de la plataforma: el enlace virtual sólo si su inscripción está confirmada. */
export async function eventoParaUsuario(id: string, usuarioId: string) {
  const e = await prisma.evento.findFirst({
    where: { id, estado: { in: ['PUBLICADO', 'CANCELADO'] } },
    include: { programa: { orderBy: { inicio: 'asc' } }, ponentes: { orderBy: [{ orden: 'asc' }, { nombre: 'asc' }] }, organizacion: { select: { nombre: true, siglas: true } }, ...conteos },
  })
  if (!e) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  const mia = await prisma.inscripcion.findUnique({ where: { eventoId_usuarioId: { eventoId: id, usuarioId } }, select: { estado: true, asistencias: { select: { fecha: true } }, constancia: { select: { id: true, folio: true, revocadaEn: true } } } })
  const { _count, enlaceVirtual, creadoPorId: _c, ...resto } = e
  return {
    ...resto,
    lugares: cupo({ capacidad: e.capacidad, _count }),
    enlaceVirtual: mia?.estado === 'CONFIRMADA' ? enlaceVirtual : null,
    miInscripcion: mia && mia.estado !== 'CANCELADA' ? { ...mia, asistencias: mia.asistencias.length } : null,
  }
}
export type EventoUsuarioDto = Awaited<ReturnType<typeof eventoParaUsuario>>

// --- Portal ------------------------------------------------------------------------------------

export async function eventosPublicos(q: z.output<typeof eventosPublicosQuery>) {
  const ahora = new Date()
  let rango: Prisma.EventoWhereInput = q.periodo === 'pasados' ? { fin: { lt: ahora } } : { fin: { gte: ahora } }
  if (q.mes) {
    const [a, m] = q.mes.split('-').map(Number)
    const desde = new Date(Date.UTC(a!, m! - 1, 1, 6))
    const hasta = new Date(Date.UTC(a!, m!, 1, 6))
    rango = { inicio: { lt: hasta }, fin: { gte: desde } }
  }
  const where: Prisma.EventoWhereInput = { estado: { in: ['PUBLICADO', 'CANCELADO'] }, ...rango, ...(q.tipo ? { tipo: q.tipo } : {}) }
  const [total, filas] = await Promise.all([
    prisma.evento.count({ where }),
    prisma.evento.findMany({ where, select: SELECT_PUBLICO, orderBy: { inicio: q.periodo === 'pasados' && !q.mes ? 'desc' : 'asc' }, skip: (q.pagina - 1) * q.porPagina, take: q.porPagina }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos: filas.map(({ _count, id: _id, ...e }) => ({ ...e, lugares: cupo({ capacidad: e.capacidad, _count }) })) }
}
export type EventoPublico = Awaited<ReturnType<typeof eventosPublicos>>['datos'][number]

export async function eventoPublico(slug: string) {
  const e = await prisma.evento.findFirst({
    where: { slug, estado: { in: ['PUBLICADO', 'CANCELADO'] } },
    include: { programa: { orderBy: { inicio: 'asc' } }, ponentes: { orderBy: [{ orden: 'asc' }, { nombre: 'asc' }] }, organizacion: { select: { nombre: true, siglas: true, slug: true, publica: true, estadoAfiliacion: true } }, ...conteos },
  })
  if (!e) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  const { _count, enlaceVirtual: _e, creadoPorId: _c, organizacion, ...resto } = e
  return {
    ...resto,
    lugares: cupo({ capacidad: e.capacidad, _count }),
    organizacion: organizacion ? { nombre: organizacion.siglas || organizacion.nombre, slug: organizacion.publica && organizacion.estadoAfiliacion === 'AFILIADA' ? organizacion.slug : null } : null,
  }
}

// --- Constancias ----------------------------------------------------------------------------

/** Datos de la constancia para imprimirla: su titular o quien gestiona el evento. */
export async function constanciaParaImprimir(id: string, usuarioId: string, ambitoGestion: Ambito | null) {
  const c = await prisma.constancia.findUnique({
    where: { id },
    select: {
      id: true, folio: true, codigo: true, emitidaEn: true, revocadaEn: true,
      inscripcion: {
        select: {
          usuarioId: true,
          usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, perfil: { select: { cedulaProfesional: true } } } },
          evento: { select: { titulo: true, tipo: true, inicio: true, fin: true, sede: true, modalidad: true, valorCurricular: true, organizacionId: true, organizacion: { select: { nombre: true } } } },
        },
      },
    },
  })
  if (!c) throw createError({ statusCode: 404, message: 'Constancia no encontrada' })
  const propia = c.inscripcion.usuarioId === usuarioId
  const gestiona = !!ambitoGestion && (ambitoGestion.todas || (!!c.inscripcion.evento.organizacionId && ambitoGestion.ids.includes(c.inscripcion.evento.organizacionId)))
  if (!propia && !gestiona) throw createError({ statusCode: 404, message: 'Constancia no encontrada' })
  return c
}
export type ConstanciaDto = Awaited<ReturnType<typeof constanciaParaImprimir>>

/** Verificación pública por código (QR). Muestra sólo lo necesario para validarla. */
export async function verificarConstancia(codigo: string) {
  const c = await prisma.constancia.findUnique({
    where: { codigo },
    select: {
      folio: true, emitidaEn: true, revocadaEn: true,
      inscripcion: { select: { usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } }, evento: { select: { titulo: true, inicio: true, fin: true, valorCurricular: true } } } },
    },
  })
  if (!c) return { valida: false as const }
  return {
    valida: !c.revocadaEn,
    revocada: !!c.revocadaEn,
    folio: c.folio,
    emitidaEn: c.emitidaEn,
    titular: nombreCompleto(c.inscripcion.usuario),
    evento: c.inscripcion.evento,
  }
}
