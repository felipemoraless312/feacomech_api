// Biblioteca institucional: estatutos, reglamentos, actas, convocatorias, convenios,
// documentos académicos y material de congresos, con control de acceso por documento.
//
// Ver un documento:
//   PUBLICO      – cualquiera (también desde el portal);
//   AFILIADOS    – cualquier usuario con sesión;
//   ORGANIZACION – integrantes activos y representantes de su organización;
//   RESTRINGIDO  – documento.ver (total, o de su organización).
// Gestionar (subir, editar, retirar): documento.gestionar total, o de sus organizaciones.
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { categoriaDocumentoSchema, documentoSchema, documentosQuery } from '../../shared/schemas/documentos'
import { aFecha } from '../../shared/schemas/organizacion'
import { IMAGENES, OFFICE, PDF, borrarDeDisco, guardarArchivo, leerArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma } from '../utils/prisma'
import { accesoDeUsuario, type Ambito } from './permisos'
import { slugDe } from './organizaciones'

export const MAX_DOCUMENTO = 20 * 1024 * 1024
export const TIPOS_DOCUMENTO = [PDF, ...OFFICE, ...IMAGENES]
type Datos = z.output<typeof documentoSchema>

interface ContextoDocumentos {
  usuarioId: string | null
  /** Organizaciones donde es integrante activo o tiene un rol. */
  organizaciones: string[]
  ver: Ambito | null
  gestionar: Ambito | null
}

async function contexto(usuarioId: string | null): Promise<ContextoDocumentos> {
  if (!usuarioId) return { usuarioId: null, organizaciones: [], ver: null, gestionar: null }
  const [acceso, membresias, roles] = await Promise.all([
    accesoDeUsuario(usuarioId),
    prisma.membresia.findMany({ where: { usuarioId, estado: 'ACTIVA' }, select: { organizacionId: true } }),
    prisma.usuarioRol.findMany({ where: { usuarioId, organizacionId: { not: null } }, select: { organizacionId: true } }),
  ])
  const ambito = (p: 'documento.ver' | 'documento.gestionar'): Ambito | null => {
    const a = acceso.permisos[p]
    if (!a) return null
    return a === 'TOTAL' ? { todas: true } : { todas: false, ids: acceso.organizaciones[p] ?? [] }
  }
  return {
    usuarioId,
    organizaciones: [...new Set([...membresias.map(m => m.organizacionId), ...roles.map(r => r.organizacionId!)])],
    ver: ambito('documento.ver'),
    gestionar: ambito('documento.gestionar'),
  }
}

const enAmbito = (a: Ambito | null, organizacionId: string | null) => !!a && (a.todas || (!!organizacionId && a.ids.includes(organizacionId)))

/** Filtro de lo que el usuario puede consultar. */
function filtroVisibles(c: ContextoDocumentos): Prisma.DocumentoWhereInput {
  if (!c.usuarioId) return { nivelAcceso: 'PUBLICO', vigente: true }
  if (c.ver?.todas || c.gestionar?.todas) return {}
  const ambitoIds = [...new Set([...(c.ver && !c.ver.todas ? c.ver.ids : []), ...(c.gestionar && !c.gestionar.todas ? c.gestionar.ids : [])])]
  return {
    OR: [
      { nivelAcceso: { in: ['PUBLICO', 'AFILIADOS'] } },
      { nivelAcceso: 'ORGANIZACION', organizacionId: { in: [...c.organizaciones, ...ambitoIds] } },
      { nivelAcceso: 'RESTRINGIDO', organizacionId: { in: ambitoIds } },
      // Quien gestiona documentos de una organización ve todos los de ella.
      ...(ambitoIds.length && c.gestionar ? [{ organizacionId: { in: c.gestionar.todas ? [] : c.gestionar.ids } }] : []),
    ],
  }
}

function puedeVer(c: ContextoDocumentos, d: { nivelAcceso: string, organizacionId: string | null, vigente: boolean }) {
  if (enAmbito(c.gestionar, d.organizacionId) || c.gestionar?.todas) return true
  if (!d.vigente && !c.ver?.todas) return false
  switch (d.nivelAcceso) {
    case 'PUBLICO': return true
    case 'AFILIADOS': return !!c.usuarioId
    case 'ORGANIZACION': return !!d.organizacionId && (c.organizaciones.includes(d.organizacionId) || enAmbito(c.ver, d.organizacionId))
    default: return enAmbito(c.ver, d.organizacionId) || !!c.ver?.todas
  }
}

function exigirGestion(c: ContextoDocumentos, organizacionId: string | null) {
  if (!c.gestionar) throw createError({ statusCode: 403, message: 'No tiene permiso para gestionar documentos' })
  if (!c.gestionar.todas && (!organizacionId || !c.gestionar.ids.includes(organizacionId))) {
    throw createError({ statusCode: 403, message: 'Sólo puede gestionar documentos de sus organizaciones', data: { campos: { organizacionId: 'Sin permiso' } } })
  }
}

const SELECT_DOCUMENTO = {
  id: true, titulo: true, descripcion: true, nivelAcceso: true, fechaDocumento: true, responsable: true, vigente: true,
  descargas: true, publicadoEn: true, actualizadoEn: true, organizacionId: true, eventoId: true, categoriaId: true,
  categoria: { select: { nombre: true, slug: true } },
  organizacion: { select: { nombre: true, siglas: true } },
  evento: { select: { titulo: true } },
  archivo: { select: { mime: true, tamano: true, nombreOriginal: true } },
  subidoPor: { select: { nombre: true, apellidoPaterno: true } },
} as const satisfies Prisma.DocumentoSelect

export async function listarDocumentos(usuarioId: string | null, q: z.output<typeof documentosQuery>) {
  const c = await contexto(usuarioId)
  const where: Prisma.DocumentoWhereInput = {
    AND: [
      filtroVisibles(c),
      q.incluirNoVigentes && c.gestionar ? {} : { vigente: true },
      q.categoriaId ? { categoriaId: q.categoriaId } : {},
      q.organizacionId ? { organizacionId: q.organizacionId } : {},
      q.q ? { OR: [{ titulo: { contains: q.q, mode: 'insensitive' } }, { descripcion: { contains: q.q, mode: 'insensitive' } }] } : {},
    ],
  }
  const [total, filas] = await Promise.all([
    prisma.documento.count({ where }),
    prisma.documento.findMany({
      where,
      select: SELECT_DOCUMENTO,
      orderBy: [{ categoria: { orden: 'asc' } }, { fechaDocumento: { sort: 'desc', nulls: 'last' } }, { publicadoEn: 'desc' }],
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
    }),
  ])
  return {
    total,
    pagina: q.pagina,
    porPagina: q.porPagina,
    datos: filas.map(d => ({ ...d, editable: !!c.gestionar && (c.gestionar.todas || (!!d.organizacionId && c.gestionar.ids.includes(d.organizacionId))), subidoPor: usuarioId ? d.subidoPor : null })),
    puedeSubir: !!c.gestionar,
  }
}
export type DocumentoFila = Awaited<ReturnType<typeof listarDocumentos>>['datos'][number]

export function listarCategorias(incluirInactivas = false) {
  return prisma.categoriaDocumento.findMany({ where: incluirInactivas ? {} : { activo: true }, orderBy: [{ orden: 'asc' }, { nombre: 'asc' }], include: { _count: { select: { documentos: true } } } })
}

async function validarRelaciones(d: Datos) {
  const cat = await prisma.categoriaDocumento.findUnique({ where: { id: d.categoriaId }, select: { activo: true } })
  if (!cat?.activo) throw createError({ statusCode: 400, message: 'Categoría no válida', data: { campos: { categoriaId: 'No válida' } } })
  if (d.eventoId && !(await prisma.evento.findUnique({ where: { id: d.eventoId }, select: { id: true } }))) {
    throw createError({ statusCode: 400, message: 'Evento no válido', data: { campos: { eventoId: 'No válido' } } })
  }
}

const columnas = (d: Datos) => ({ ...d, fechaDocumento: d.fechaDocumento ? aFecha(d.fechaDocumento) : null })

export async function crearDocumento(usuarioId: string, d: Datos, archivo: { datos: Buffer, nombre: string }, ctx: ContextoAuditoria) {
  const c = await contexto(usuarioId)
  exigirGestion(c, d.organizacionId)
  await validarRelaciones(d)
  return prisma.$transaction(async (tx) => {
    const a = await guardarArchivo(tx, { datos: archivo.datos, nombreOriginal: archivo.nombre, permitidos: TIPOS_DOCUMENTO, maxBytes: MAX_DOCUMENTO, visibilidad: 'RESTRINGIDO', subidoPorId: usuarioId })
    const doc = await tx.documento.create({ data: { ...columnas(d), archivoId: a.id, subidoPorId: usuarioId } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Documento', entidadId: doc.id, despues: { ...d, archivo: archivo.nombre } })
    return doc
  })
}

export async function actualizarDocumento(usuarioId: string, id: string, d: Datos, ctx: ContextoAuditoria) {
  const c = await contexto(usuarioId)
  const antes = await prisma.documento.findUnique({ where: { id } })
  if (!antes) throw createError({ statusCode: 404, message: 'Documento no encontrado' })
  exigirGestion(c, antes.organizacionId)
  exigirGestion(c, d.organizacionId)
  await validarRelaciones(d)
  await prisma.$transaction(async (tx) => {
    await tx.documento.update({ where: { id }, data: columnas(d) })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Documento', entidadId: id, antes, despues: d })
  })
}

/** Sustituye el archivo (nueva versión); el anterior se elimina. */
export async function reemplazarArchivo(usuarioId: string, id: string, archivo: { datos: Buffer, nombre: string }, ctx: ContextoAuditoria) {
  const c = await contexto(usuarioId)
  const doc = await prisma.documento.findUnique({ where: { id }, include: { archivo: { select: { id: true, ruta: true, nombreOriginal: true } } } })
  if (!doc) throw createError({ statusCode: 404, message: 'Documento no encontrado' })
  exigirGestion(c, doc.organizacionId)
  await prisma.$transaction(async (tx) => {
    const a = await guardarArchivo(tx, { datos: archivo.datos, nombreOriginal: archivo.nombre, permitidos: TIPOS_DOCUMENTO, maxBytes: MAX_DOCUMENTO, visibilidad: 'RESTRINGIDO', subidoPorId: usuarioId })
    await tx.documento.update({ where: { id }, data: { archivoId: a.id } })
    await tx.archivo.delete({ where: { id: doc.archivo.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Documento.archivo', entidadId: id, antes: { archivo: doc.archivo.nombreOriginal }, despues: { archivo: archivo.nombre } })
  })
  await borrarDeDisco(doc.archivo.ruta)
}

/** Elimina un documento cargado por error. Lo que deja de aplicar se marca como no vigente. */
export async function eliminarDocumento(usuarioId: string, id: string, ctx: ContextoAuditoria) {
  const c = await contexto(usuarioId)
  const doc = await prisma.documento.findUnique({ where: { id }, include: { archivo: { select: { id: true, ruta: true } } } })
  if (!doc) throw createError({ statusCode: 404, message: 'Documento no encontrado' })
  exigirGestion(c, doc.organizacionId)
  await prisma.$transaction(async (tx) => {
    await tx.documento.delete({ where: { id } })
    await tx.archivo.delete({ where: { id: doc.archivo.id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Documento', entidadId: id, antes: { titulo: doc.titulo, nivelAcceso: doc.nivelAcceso } })
  })
  await borrarDeDisco(doc.archivo.ruta)
}

/**
 * Entrega el archivo si el usuario (o el visitante, con usuarioId null) puede verlo. Las
 * descargas de documentos no públicos quedan en la bitácora.
 */
export async function leerDocumento(usuarioId: string | null, id: string, ctx: ContextoAuditoria) {
  const doc = await prisma.documento.findUnique({ where: { id }, include: { archivo: true } })
  if (!doc) throw createError({ statusCode: 404, message: 'Documento no encontrado' })
  if (!puedeVer(await contexto(usuarioId), doc)) throw createError({ statusCode: usuarioId ? 404 : 401, message: usuarioId ? 'Documento no encontrado' : 'Inicie sesión para consultar este documento' })
  const datos = await leerArchivo(doc.archivo.ruta)
  await prisma.documento.update({ where: { id }, data: { descargas: { increment: 1 } } })
  if (doc.nivelAcceso !== 'PUBLICO') await auditar(prisma, ctx, { accion: 'DESCARGAR', entidad: 'Documento', entidadId: id })
  return { archivo: doc.archivo, datos }
}

// --- Categorías ------------------------------------------------------------------------------

export async function guardarCategoria(id: string | null, d: z.output<typeof categoriaDocumentoSchema>, ctx: ContextoAuditoria) {
  try {
    return await prisma.$transaction(async (tx) => {
      const datos = { ...d, slug: slugDe(d.nombre) }
      const cat = id ? await tx.categoriaDocumento.update({ where: { id }, data: datos }) : await tx.categoriaDocumento.create({ data: datos })
      await auditar(tx, ctx, { accion: id ? 'ACTUALIZAR' : 'CREAR', entidad: 'CategoriaDocumento', entidadId: cat.id, despues: d })
      return cat
    })
  }
  catch (e) {
    if ((e as { code?: string }).code === 'P2002') throw createError({ statusCode: 409, message: 'Ya existe una categoría con ese nombre', data: { campos: { nombre: 'Ya existe' } } })
    throw e
  }
}
