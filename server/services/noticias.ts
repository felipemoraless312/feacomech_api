// Noticias y comunicados. Flujo: el autor redacta (BORRADOR) y la envía a revisión; quien
// tiene `noticia.administrar` la publica, la devuelve o la retira. Sólo lo PUBLICADO es público.
//
// Quién puede editar (permiso noticia.publicar):
//   TOTAL        – cualquier noticia no publicada;
//   ORGANIZACION – las de sus organizaciones y las propias;
//   PROPIO       – sólo las que redactó.
// noticia.administrar (TOTAL) edita cualquiera, incluso publicadas.
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { noticiaSchema, noticiasPublicasQuery, noticiasQuery, transicionNoticiaSchema } from '../../shared/schemas/portal'
import { IMAGENES, borrarDeDisco, guardarArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma } from '../utils/prisma'
import { notificar } from './notificaciones'
import { accesoDeUsuario, incluye, usuariosConPermisoTotal } from './permisos'
import { slugDe } from './organizaciones'

export const MAX_PORTADA = 4 * 1024 * 1024
type Datos = z.output<typeof noticiaSchema>

const SELECT_LISTA = {
  id: true, tipo: true, titulo: true, slug: true, resumen: true, estado: true, destacada: true, publicadaEn: true,
  creadoEn: true, actualizadoEn: true, portadaId: true, autorId: true, organizacionId: true,
  autor: { select: { nombre: true, apellidoPaterno: true } },
  organizacion: { select: { nombre: true, siglas: true } },
} as const satisfies Prisma.NoticiaSelect

interface Permisos { administrar: boolean, publicar: 'TOTAL' | 'ORGANIZACION' | 'PROPIO' | null, organizaciones: string[] }

export async function permisosNoticias(usuarioId: string): Promise<Permisos> {
  const a = await accesoDeUsuario(usuarioId)
  return {
    administrar: a.permisos['noticia.administrar'] === 'TOTAL',
    publicar: a.permisos['noticia.publicar'] ?? null,
    organizaciones: a.organizaciones['noticia.publicar'] ?? [],
  }
}

/** Filtro de lo que el usuario puede ver/editar en el panel. */
function filtroEditables(usuarioId: string, p: Permisos): Prisma.NoticiaWhereInput {
  if (p.administrar || p.publicar === 'TOTAL') return {}
  if (p.publicar === 'ORGANIZACION') return { OR: [{ autorId: usuarioId }, { organizacionId: { in: p.organizaciones } }] }
  return { autorId: usuarioId }
}

function puedeEditar(usuarioId: string, p: Permisos, n: { autorId: string | null, organizacionId: string | null, estado: string }) {
  if (p.administrar) return true
  if (n.estado === 'PUBLICADA' || n.estado === 'RETIRADA') return false
  if (p.publicar === 'TOTAL') return true
  if (n.autorId === usuarioId) return true
  return p.publicar === 'ORGANIZACION' && !!n.organizacionId && p.organizaciones.includes(n.organizacionId)
}

function validarOrganizacion(p: Permisos, organizacionId: string | null) {
  if (!organizacionId || p.administrar || p.publicar === 'TOTAL') return
  if (p.publicar !== 'ORGANIZACION' || !incluye({ todas: false, ids: p.organizaciones }, organizacionId)) {
    throw createError({ statusCode: 403, message: 'No puede publicar a nombre de esa organización', data: { campos: { organizacionId: 'Sin permiso' } } })
  }
}

async function slugUnico(titulo: string, excepto?: string) {
  const base = slugDe(titulo).slice(0, 70)
  let slug = base
  for (let i = 2; await prisma.noticia.findFirst({ where: { slug, ...(excepto ? { id: { not: excepto } } : {}) }, select: { id: true } }); i++) slug = `${base}-${i}`
  return slug
}

export async function listarNoticias(usuarioId: string, q: z.output<typeof noticiasQuery>) {
  const p = await permisosNoticias(usuarioId)
  const where: Prisma.NoticiaWhereInput = {
    ...filtroEditables(usuarioId, p),
    ...(q.tipo ? { tipo: q.tipo } : {}),
    ...(q.estado ? { estado: q.estado } : {}),
    ...(q.q ? { titulo: { contains: q.q, mode: 'insensitive' } } : {}),
  }
  const [total, datos] = await Promise.all([
    prisma.noticia.count({ where }),
    prisma.noticia.findMany({ where, select: SELECT_LISTA, orderBy: [{ actualizadoEn: 'desc' }], skip: (q.pagina - 1) * q.porPagina, take: q.porPagina }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos: datos.map(n => ({ ...n, editable: puedeEditar(usuarioId, p, n) })) }
}
export type NoticiaFila = Awaited<ReturnType<typeof listarNoticias>>['datos'][number]

export async function obtenerNoticia(usuarioId: string, id: string) {
  const p = await permisosNoticias(usuarioId)
  const n = await prisma.noticia.findFirst({ where: { id, ...filtroEditables(usuarioId, p) }, select: { ...SELECT_LISTA, contenido: true } })
  if (!n) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
  return { ...n, editable: puedeEditar(usuarioId, p, n) }
}
export type NoticiaDetalle = Awaited<ReturnType<typeof obtenerNoticia>>

export async function crearNoticia(usuarioId: string, d: Datos, ctx: ContextoAuditoria) {
  const p = await permisosNoticias(usuarioId)
  validarOrganizacion(p, d.organizacionId)
  if (d.destacada && !p.administrar) d = { ...d, destacada: false }
  const n = await prisma.$transaction(async (tx) => {
    const creada = await tx.noticia.create({ data: { ...d, slug: await slugUnico(d.titulo), autorId: usuarioId } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Noticia', entidadId: creada.id, despues: { ...d, contenido: `${d.contenido.length} caracteres` } })
    return creada
  })
  return n
}

export async function actualizarNoticia(usuarioId: string, id: string, d: Datos, ctx: ContextoAuditoria) {
  const p = await permisosNoticias(usuarioId)
  const antes = await prisma.noticia.findUnique({ where: { id } })
  if (!antes) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
  if (!puedeEditar(usuarioId, p, antes)) throw createError({ statusCode: 403, message: 'No puede editar esta noticia' })
  validarOrganizacion(p, d.organizacionId)
  const datos = { ...d, destacada: p.administrar ? d.destacada : antes.destacada }
  // El enlace de una noticia ya publicada no cambia (otros sitios pueden apuntar a él).
  const slug = antes.publicadaEn ? antes.slug : await slugUnico(d.titulo, id)
  await prisma.$transaction(async (tx) => {
    await tx.noticia.update({ where: { id }, data: { ...datos, slug } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Noticia', entidadId: id, antes: { titulo: antes.titulo, estado: antes.estado }, despues: { titulo: d.titulo } })
  })
}

/** Cambios de estado del flujo editorial. */
export async function transicionNoticia(usuarioId: string, id: string, t: z.output<typeof transicionNoticiaSchema>, ctx: ContextoAuditoria) {
  const p = await permisosNoticias(usuarioId)
  await prisma.$transaction(async (tx) => {
    const n = await tx.noticia.findUnique({ where: { id } })
    if (!n) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
    const prohibido = () => createError({ statusCode: 403, message: 'No tiene permiso para esta acción' })
    const invalida = () => createError({ statusCode: 409, message: 'La noticia no está en un estado que permita esa acción' })

    let estado: typeof n.estado
    switch (t.accion) {
      case 'ENVIAR_A_REVISION':
        if (!puedeEditar(usuarioId, p, n)) throw prohibido()
        if (n.estado !== 'BORRADOR') throw invalida()
        estado = 'REVISION'
        break
      case 'DEVOLVER':
        if (!p.administrar) throw prohibido()
        if (n.estado !== 'REVISION') throw invalida()
        if (!t.motivo) throw createError({ statusCode: 400, message: 'Indique qué debe corregirse' })
        estado = 'BORRADOR'
        break
      case 'PUBLICAR':
        if (!p.administrar) throw prohibido()
        if (n.estado === 'PUBLICADA') throw invalida()
        estado = 'PUBLICADA'
        break
      case 'RETIRAR':
        if (!p.administrar) throw prohibido()
        if (n.estado !== 'PUBLICADA') throw invalida()
        estado = 'RETIRADA'
        break
    }

    await tx.noticia.update({ where: { id }, data: { estado, ...(estado === 'PUBLICADA' && !n.publicadaEn ? { publicadaEn: new Date() } : {}) } })
    if (n.portadaId) await tx.archivo.update({ where: { id: n.portadaId }, data: { visibilidad: estado === 'PUBLICADA' ? 'PUBLICO' : 'AUTENTICADO' } })
    await auditar(tx, ctx, { accion: estado === 'PUBLICADA' ? 'VALIDAR' : 'ACTUALIZAR', entidad: 'Noticia.estado', entidadId: id, antes: { estado: n.estado }, despues: { estado }, motivo: t.motivo })

    if (t.accion === 'ENVIAR_A_REVISION') {
      for (const u of await usuariosConPermisoTotal(tx, 'noticia.administrar')) {
        if (u.id !== usuarioId) await notificar(tx, u.id, { tipo: 'COMUNIDAD', titulo: 'Noticia por revisar', cuerpo: n.titulo, enlace: `/plataforma/noticias/${id}` })
      }
    }
    if (n.autorId && n.autorId !== usuarioId && (t.accion === 'DEVOLVER' || t.accion === 'PUBLICAR')) {
      await notificar(tx, n.autorId, {
        tipo: 'COMUNIDAD',
        titulo: t.accion === 'PUBLICAR' ? 'Su noticia fue publicada' : 'Su noticia requiere cambios',
        cuerpo: t.accion === 'PUBLICAR' ? n.titulo : t.motivo ?? undefined,
        enlace: `/plataforma/noticias/${id}`,
      })
    }
  })
}

/** Sólo borradores, por quien puede editarlos. */
export async function eliminarNoticia(usuarioId: string, id: string, ctx: ContextoAuditoria) {
  const p = await permisosNoticias(usuarioId)
  const ruta = await prisma.$transaction(async (tx) => {
    const n = await tx.noticia.findUnique({ where: { id }, include: { portada: { select: { id: true, ruta: true } } } })
    if (!n) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
    if (n.estado !== 'BORRADOR' || !puedeEditar(usuarioId, p, n)) throw createError({ statusCode: 403, message: 'Sólo se eliminan borradores propios; lo publicado se retira' })
    await tx.noticia.delete({ where: { id } })
    if (n.portada) await tx.archivo.delete({ where: { id: n.portada.id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Noticia', entidadId: id, antes: { titulo: n.titulo } })
    return n.portada?.ruta
  })
  if (ruta) await borrarDeDisco(ruta)
}

export async function guardarPortada(usuarioId: string, id: string, datos: Buffer, nombre: string, ctx: ContextoAuditoria) {
  const p = await permisosNoticias(usuarioId)
  const rutaAnterior = await prisma.$transaction(async (tx) => {
    const n = await tx.noticia.findUnique({ where: { id }, include: { portada: { select: { id: true, ruta: true } } } })
    if (!n) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
    if (!puedeEditar(usuarioId, p, n)) throw createError({ statusCode: 403, message: 'No puede editar esta noticia' })
    const archivo = await guardarArchivo(tx, { datos, nombreOriginal: nombre, permitidos: IMAGENES, maxBytes: MAX_PORTADA, visibilidad: n.estado === 'PUBLICADA' ? 'PUBLICO' : 'AUTENTICADO', subidoPorId: usuarioId })
    await tx.noticia.update({ where: { id }, data: { portadaId: archivo.id } })
    if (n.portada) await tx.archivo.delete({ where: { id: n.portada.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Noticia.portada', entidadId: id })
    return n.portada?.ruta
  })
  if (rutaAnterior) await borrarDeDisco(rutaAnterior)
}

// --- Portal ---------------------------------------------------------------------------

const SELECT_PUBLICA = {
  tipo: true, titulo: true, slug: true, resumen: true, publicadaEn: true, portadaId: true, destacada: true,
  organizacion: { select: { nombre: true, siglas: true, slug: true, publica: true, estadoAfiliacion: true } },
} as const satisfies Prisma.NoticiaSelect

const fuente = (o: { nombre: string, siglas: string | null, slug: string, publica: boolean, estadoAfiliacion: string } | null) =>
  o ? { nombre: o.siglas || o.nombre, slug: o.publica && o.estadoAfiliacion === 'AFILIADA' ? o.slug : null } : null

export async function noticiasPublicas(q: z.output<typeof noticiasPublicasQuery>) {
  const where: Prisma.NoticiaWhereInput = { estado: 'PUBLICADA', ...(q.tipo ? { tipo: q.tipo } : {}) }
  const [total, datos] = await Promise.all([
    prisma.noticia.count({ where }),
    prisma.noticia.findMany({ where, select: SELECT_PUBLICA, orderBy: { publicadaEn: 'desc' }, skip: (q.pagina - 1) * q.porPagina, take: q.porPagina }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, datos: datos.map(n => ({ ...n, organizacion: fuente(n.organizacion) })) }
}
export type NoticiaPublica = Awaited<ReturnType<typeof noticiasPublicas>>['datos'][number]

export async function noticiaPublica(slug: string) {
  const n = await prisma.noticia.findFirst({ where: { slug, estado: 'PUBLICADA' }, select: { ...SELECT_PUBLICA, contenido: true, actualizadoEn: true } })
  if (!n) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
  return { ...n, organizacion: fuente(n.organizacion) }
}
