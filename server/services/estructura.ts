// Estructura organizacional: órganos (mesa directiva, consejo, comisiones), cargos
// configurables con jerarquía, periodos de gestión y nombramientos con historial.
// Sirve igual para la Federación (organizacionId = null) que para cada organización.
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { TipoOrgano } from '../generated/prisma/enums'
import { armarOrganigrama, creaCiclo, estaVigente } from '../../shared/estructura'
import { aFecha } from '../../shared/schemas/organizacion'
import type { cargoSchema, nombramientoSchema, organoSchema, periodoSchema } from '../../shared/schemas/estructura'
import { IMAGENES, borrarDeDisco, guardarArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma, type Tx } from '../utils/prisma'

export const MAX_FOTO_NOMBRAMIENTO = 3 * 1024 * 1024

type Organo = z.output<typeof organoSchema>
type Cargo = z.output<typeof cargoSchema>
type Periodo = z.output<typeof periodoSchema>
type Nombramiento = z.output<typeof nombramientoSchema>

const fechaONull = (v: string | null) => (v ? aFecha(v) : null)

const SELECT_NOMBRAMIENTO = {
  id: true, cargoId: true, periodoId: true, usuarioId: true, nombrePersona: true, organizacionProcedenciaId: true,
  fotoId: true, descripcion: true, inicio: true, fin: true, estado: true, publicado: true,
  usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, perfil: { select: { fotoId: true, publicarDirectorio: true } } } },
  organizacionProcedencia: { select: { id: true, nombre: true, siglas: true } },
  periodo: { select: { nombre: true } },
} as const satisfies Prisma.NombramientoSelect

type FilaNombramiento = Prisma.NombramientoGetPayload<{ select: typeof SELECT_NOMBRAMIENTO }>

/**
 * Nombre y foto a mostrar: los de la cuenta del usuario, o los capturados en el nombramiento.
 * En el portal (`publico`) la foto del perfil sólo se usa si la persona autorizó publicarla.
 */
export function persona(n: FilaNombramiento, publico = false) {
  const u = n.usuario
  return {
    nombre: u ? [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ') : n.nombrePersona ?? '',
    fotoId: n.fotoId ?? (u?.perfil && (!publico || u.perfil.publicarDirectorio) ? u.perfil.fotoId : null),
  }
}

/** Todo lo de un ámbito, para el panel de administración. */
export async function obtenerEstructura(organizacionId: string | null) {
  const [organos, periodos, nombramientos] = await Promise.all([
    prisma.organo.findMany({
      where: { organizacionId },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      include: { cargos: { orderBy: [{ orden: 'asc' }, { nombre: 'asc' }], include: { _count: { select: { nombramientos: true } } } } },
    }),
    prisma.periodo.findMany({ where: { organizacionId }, orderBy: { inicio: 'desc' }, include: { _count: { select: { nombramientos: true } } } }),
    prisma.nombramiento.findMany({
      where: { cargo: { organo: { organizacionId } } },
      orderBy: [{ inicio: 'desc' }],
      select: SELECT_NOMBRAMIENTO,
    }),
  ])
  return {
    organos: organos.map(({ cargos, ...o }) => ({ ...o, cargos: cargos.map(({ _count, ...c }) => ({ ...c, nombramientos: _count.nombramientos })) })),
    periodos: periodos.map(({ _count, ...p }) => ({ ...p, nombramientos: _count.nombramientos })),
    nombramientos: nombramientos.map(n => ({ ...n, persona: persona(n), vigente: estaVigente(n) })),
  }
}
export type EstructuraDto = Awaited<ReturnType<typeof obtenerEstructura>>

/** Organización (o null = Federación) a la que pertenece un órgano, cargo, periodo o nombramiento. */
export async function ambitoDeEntidad(tipo: 'organo' | 'cargo' | 'periodo' | 'nombramiento', id: string): Promise<string | null> {
  const r = tipo === 'organo'
    ? await prisma.organo.findUnique({ where: { id }, select: { organizacionId: true } })
    : tipo === 'cargo'
      ? (await prisma.cargo.findUnique({ where: { id }, select: { organo: { select: { organizacionId: true } } } }))?.organo
      : tipo === 'periodo'
        ? await prisma.periodo.findUnique({ where: { id }, select: { organizacionId: true } })
        : (await prisma.nombramiento.findUnique({ where: { id }, select: { cargo: { select: { organo: { select: { organizacionId: true } } } } } }))?.cargo.organo
  if (!r) throw createError({ statusCode: 404, message: 'No encontrado' })
  return r.organizacionId
}

// --- Órganos --------------------------------------------------------------------

export async function guardarOrgano(id: string | null, d: Organo, ctx: ContextoAuditoria) {
  return prisma.$transaction(async (tx) => {
    if (id) {
      const antes = await tx.organo.findUnique({ where: { id } })
      if (!antes) throw createError({ statusCode: 404, message: 'Órgano no encontrado' })
      const o = await tx.organo.update({ where: { id }, data: { tipo: d.tipo as TipoOrgano, nombre: d.nombre, descripcion: d.descripcion, orden: d.orden, activo: d.activo } })
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Organo', entidadId: id, antes, despues: o })
      return o
    }
    const o = await tx.organo.create({ data: { ...d, tipo: d.tipo as TipoOrgano } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Organo', entidadId: o.id, despues: o })
    return o
  })
}

/** Sólo si no tiene cargos; si los tiene, se desactiva. */
export async function eliminarOrgano(id: string, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const o = await tx.organo.findUnique({ where: { id }, include: { _count: { select: { cargos: true } } } })
    if (!o) throw createError({ statusCode: 404, message: 'Órgano no encontrado' })
    if (o._count.cargos) throw createError({ statusCode: 409, message: 'Tiene cargos registrados: desactívelo en lugar de eliminarlo' })
    await tx.organo.delete({ where: { id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Organo', entidadId: id, antes: o })
  })
}

// --- Cargos -----------------------------------------------------------------------

async function validarCargo(tx: Tx, id: string | null, d: Cargo) {
  const organo = await tx.organo.findUnique({ where: { id: d.organoId }, select: { organizacionId: true } })
  if (!organo) throw createError({ statusCode: 400, message: 'Órgano no válido', data: { campos: { organoId: 'No válido' } } })
  if (d.superiorId) {
    const superior = await tx.cargo.findUnique({ where: { id: d.superiorId }, select: { organo: { select: { organizacionId: true } } } })
    if (!superior || superior.organo.organizacionId !== organo.organizacionId) {
      throw createError({ statusCode: 400, message: 'El cargo superior debe ser de la misma estructura', data: { campos: { superiorId: 'No válido' } } })
    }
    if (id) {
      const todos = await tx.cargo.findMany({ where: { organo: { organizacionId: organo.organizacionId } }, select: { id: true, superiorId: true } })
      if (creaCiclo(todos, id, d.superiorId)) throw createError({ statusCode: 400, message: 'Ese superior crearía un ciclo en el organigrama', data: { campos: { superiorId: 'Ciclo' } } })
    }
  }
  return organo.organizacionId
}

export async function guardarCargo(id: string | null, d: Cargo, ctx: ContextoAuditoria) {
  return prisma.$transaction(async (tx) => {
    await validarCargo(tx, id, d)
    if (id) {
      const antes = await tx.cargo.findUnique({ where: { id } })
      if (!antes) throw createError({ statusCode: 404, message: 'Cargo no encontrado' })
      const c = await tx.cargo.update({ where: { id }, data: d })
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Cargo', entidadId: id, antes, despues: c })
      return c
    }
    const c = await tx.cargo.create({ data: d })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Cargo', entidadId: c.id, despues: c })
    return c
  })
}

/** Sólo cargos sin nombramientos ni subordinados (el historial no se pierde). */
export async function eliminarCargo(id: string, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const c = await tx.cargo.findUnique({ where: { id }, include: { _count: { select: { nombramientos: true, subordinados: true } } } })
    if (!c) throw createError({ statusCode: 404, message: 'Cargo no encontrado' })
    if (c._count.nombramientos) throw createError({ statusCode: 409, message: 'Tiene nombramientos en su historial: desactívelo en lugar de eliminarlo' })
    if (c._count.subordinados) throw createError({ statusCode: 409, message: 'Otros cargos dependen de él; reasígnelos primero' })
    await tx.cargo.delete({ where: { id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Cargo', entidadId: id, antes: c })
  })
}

// --- Periodos ---------------------------------------------------------------------

export async function guardarPeriodo(id: string | null, d: Periodo, ctx: ContextoAuditoria) {
  const datos = { organizacionId: d.organizacionId, nombre: d.nombre, inicio: aFecha(d.inicio), fin: fechaONull(d.fin), descripcion: d.descripcion }
  return prisma.$transaction(async (tx) => {
    if (id) {
      const antes = await tx.periodo.findUnique({ where: { id } })
      if (!antes) throw createError({ statusCode: 404, message: 'Periodo no encontrado' })
      if (antes.organizacionId !== d.organizacionId) throw createError({ statusCode: 400, message: 'El periodo no puede cambiar de ámbito' })
      const p = await tx.periodo.update({ where: { id }, data: datos })
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Periodo', entidadId: id, antes, despues: p })
      return p
    }
    const p = await tx.periodo.create({ data: datos })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Periodo', entidadId: p.id, despues: p })
    return p
  })
}

// --- Nombramientos ----------------------------------------------------------------

async function validarNombramiento(tx: Tx, d: Nombramiento) {
  const cargo = await tx.cargo.findUnique({ where: { id: d.cargoId }, select: { organo: { select: { organizacionId: true } } } })
  if (!cargo) throw createError({ statusCode: 400, message: 'Cargo no válido', data: { campos: { cargoId: 'No válido' } } })
  if (d.periodoId) {
    const p = await tx.periodo.findUnique({ where: { id: d.periodoId }, select: { organizacionId: true } })
    if (!p || p.organizacionId !== cargo.organo.organizacionId) {
      throw createError({ statusCode: 400, message: 'El periodo debe ser de la misma estructura que el cargo', data: { campos: { periodoId: 'No válido' } } })
    }
  }
  if (d.usuarioId && !(await tx.usuario.findUnique({ where: { id: d.usuarioId }, select: { id: true } }))) {
    throw createError({ statusCode: 400, message: 'Usuario no válido', data: { campos: { usuarioId: 'No válido' } } })
  }
  if (d.organizacionProcedenciaId && !(await tx.organizacion.findUnique({ where: { id: d.organizacionProcedenciaId }, select: { id: true } }))) {
    throw createError({ statusCode: 400, message: 'Organización no válida', data: { campos: { organizacionProcedenciaId: 'No válida' } } })
  }
  return cargo.organo.organizacionId
}

const datosNombramiento = (d: Nombramiento) => ({
  cargoId: d.cargoId,
  periodoId: d.periodoId,
  usuarioId: d.usuarioId,
  nombrePersona: d.usuarioId ? null : d.nombrePersona,
  organizacionProcedenciaId: d.organizacionProcedenciaId,
  descripcion: d.descripcion,
  inicio: aFecha(d.inicio),
  fin: fechaONull(d.fin),
  estado: d.estado,
  publicado: d.publicado,
})

export async function guardarNombramiento(id: string | null, d: Nombramiento, ctx: ContextoAuditoria) {
  return prisma.$transaction(async (tx) => {
    const ambito = await validarNombramiento(tx, d)
    if (id) {
      const antes = await tx.nombramiento.findUnique({ where: { id }, select: { ...SELECT_NOMBRAMIENTO, cargo: { select: { organo: { select: { organizacionId: true } } } } } })
      if (!antes) throw createError({ statusCode: 404, message: 'Nombramiento no encontrado' })
      if (antes.cargo.organo.organizacionId !== ambito) throw createError({ statusCode: 400, message: 'El nombramiento no puede cambiar de estructura' })
      const n = await tx.nombramiento.update({ where: { id }, data: datosNombramiento(d) })
      // La foto propia del nombramiento sólo es pública si el nombramiento está publicado.
      if (n.fotoId) await tx.archivo.update({ where: { id: n.fotoId }, data: { visibilidad: d.publicado ? 'PUBLICO' : 'AUTENTICADO' } })
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Nombramiento', entidadId: id, antes, despues: n })
      return n
    }
    const n = await tx.nombramiento.create({ data: datosNombramiento(d) })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Nombramiento', entidadId: n.id, despues: n })
    return n
  })
}

/** Corrige un registro erróneo. Para terminar un cargo use el estado CONCLUIDO o REVOCADO. */
export async function eliminarNombramiento(id: string, ctx: ContextoAuditoria) {
  const ruta = await prisma.$transaction(async (tx) => {
    const n = await tx.nombramiento.findUnique({ where: { id }, include: { foto: { select: { id: true, ruta: true } } } })
    if (!n) throw createError({ statusCode: 404, message: 'Nombramiento no encontrado' })
    await tx.nombramiento.delete({ where: { id } })
    if (n.foto) await tx.archivo.delete({ where: { id: n.foto.id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Nombramiento', entidadId: id, antes: n })
    return n.foto?.ruta
  })
  if (ruta) await borrarDeDisco(ruta)
}

export async function guardarFotoNombramiento(id: string, datos: Buffer, nombre: string, ctx: ContextoAuditoria) {
  const rutaAnterior = await prisma.$transaction(async (tx) => {
    const n = await tx.nombramiento.findUnique({ where: { id }, select: { publicado: true, foto: { select: { id: true, ruta: true } } } })
    if (!n) throw createError({ statusCode: 404, message: 'Nombramiento no encontrado' })
    const archivo = await guardarArchivo(tx, { datos, nombreOriginal: nombre, permitidos: IMAGENES, maxBytes: MAX_FOTO_NOMBRAMIENTO, visibilidad: n.publicado ? 'PUBLICO' : 'AUTENTICADO', subidoPorId: ctx.usuarioId ?? null })
    await tx.nombramiento.update({ where: { id }, data: { fotoId: archivo.id } })
    if (n.foto) await tx.archivo.delete({ where: { id: n.foto.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Nombramiento.foto', entidadId: id, despues: { archivoId: archivo.id } })
    return n.foto?.ruta
  })
  if (rutaAnterior) await borrarDeDisco(rutaAnterior)
}

// --- Vista pública ---------------------------------------------------------------------

/**
 * Estructura vigente publicada de un ámbito: órganos activos con su organigrama y las
 * personas en funciones (sólo nombramientos publicados y vigentes). Sin datos de contacto.
 */
export async function estructuraPublica(organizacionId: string | null, tipos?: TipoOrgano[]) {
  const hoy = aFecha(new Date().toISOString().slice(0, 10))
  const organos = await prisma.organo.findMany({
    where: { organizacionId, activo: true, ...(tipos ? { tipo: { in: tipos } } : {}) },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    select: {
      id: true, tipo: true, nombre: true, descripcion: true,
      cargos: {
        where: { activo: true },
        select: {
          id: true, nombre: true, orden: true, superiorId: true,
          nombramientos: {
            where: { publicado: true, estado: 'VIGENTE', inicio: { lte: hoy }, OR: [{ fin: null }, { fin: { gte: hoy } }] },
            orderBy: { inicio: 'asc' },
            select: SELECT_NOMBRAMIENTO,
          },
        },
      },
    },
  })
  const periodo = await prisma.periodo.findFirst({
    where: { organizacionId, inicio: { lte: hoy }, OR: [{ fin: null }, { fin: { gte: hoy } }] },
    orderBy: { inicio: 'desc' },
    select: { nombre: true, inicio: true, fin: true },
  })
  return {
    periodo,
    // Sólo cargos con alguien en funciones y órganos con algún cargo así: el portal no
    // muestra la plantilla de cargos vacía como si fuera información institucional.
    organos: organos.map(o => ({ ...o, cargos: o.cargos.filter(c => c.nombramientos.length) })).filter(o => o.cargos.length).map(o => ({
      tipo: o.tipo,
      nombre: o.nombre,
      descripcion: o.descripcion,
      organigrama: armarOrganigrama(o.cargos.map(c => ({
        id: c.id,
        nombre: c.nombre,
        orden: c.orden,
        superiorId: c.superiorId,
        personas: c.nombramientos.map(n => ({
          ...persona(n, true),
          descripcion: n.descripcion,
          procedencia: n.organizacionProcedencia ? (n.organizacionProcedencia.siglas || n.organizacionProcedencia.nombre) : null,
        })),
      }))),
    })),
  }
}
export type EstructuraPublicaDto = Awaited<ReturnType<typeof estructuraPublica>>

/** Mesas directivas de periodos anteriores (sólo nombramientos publicados). */
export async function historialPublico(organizacionId: string | null) {
  const hoy = aFecha(new Date().toISOString().slice(0, 10))
  const periodos = await prisma.periodo.findMany({
    where: { organizacionId, fin: { lt: hoy } },
    orderBy: { inicio: 'desc' },
    select: {
      nombre: true, inicio: true, fin: true,
      nombramientos: {
        where: { publicado: true },
        orderBy: [{ cargo: { orden: 'asc' } }, { inicio: 'asc' }],
        select: { ...SELECT_NOMBRAMIENTO, cargo: { select: { nombre: true, organo: { select: { nombre: true } } } } },
      },
    },
  })
  return periodos
    .filter(p => p.nombramientos.length)
    .map(p => ({
      nombre: p.nombre,
      inicio: p.inicio,
      fin: p.fin,
      integrantes: p.nombramientos.map(n => ({ cargo: n.cargo.nombre, organo: n.cargo.organo.nombre, ...persona(n, true) })),
    }))
}
