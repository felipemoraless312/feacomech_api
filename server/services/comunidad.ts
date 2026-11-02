// Comunidad médica: grupos con privacidad, publicaciones, comentarios (con respuestas),
// reacciones, adjuntos, reportes y moderación.
//
// Quién ve y publica (además de tener `comunidad.participar`):
//   ABIERTO  – todos ven y publican.
//   MIEMBROS – todos ven; publican los miembros (unirse es libre).
//   PRIVADO  – sólo miembros ven y publican (ingreso aprobado por moderación).
// En los grupos de organización son miembros sus integrantes activos y sus representantes.
// Moderan: `comunidad.moderar` total (todo), con alcance de organización (los grupos de sus
// organizaciones) y los moderadores del propio grupo.
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { MotivoReporte, PrivacidadGrupo, TipoGrupo, TipoReaccion } from '../generated/prisma/enums'
import type { comentarioSchema, grupoSchema, moderarSchema, publicacionSchema, publicacionesQuery, reporteSchema } from '../../shared/schemas/comunidad'
import { nombreCompleto } from '../../shared/texto'
import { IMAGENES, PDF, borrarDeDisco, guardarArchivo, leerArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma, type Tx } from '../utils/prisma'
import { notificar } from './notificaciones'
import { slugDe } from './organizaciones'
import { accesoDeUsuario, usuariosConPermisoTotal } from './permisos'

export const MAX_ADJUNTO = 10 * 1024 * 1024
export const MAX_ADJUNTOS_POR_PUBLICACION = 5

// --- Contexto y reglas de acceso ------------------------------------------------------------

export interface ContextoComunidad {
  usuarioId: string
  participar: boolean
  moderarTodo: boolean
  moderaOrganizaciones: string[]
  administrarGrupos: 'TOTAL' | 'ORGANIZACION' | null
  administraOrganizaciones: string[]
  /** Organizaciones donde es integrante activo o tiene un rol. */
  organizaciones: string[]
  grupos: Map<string, { rol: string, estado: string }>
}

export async function contextoComunidad(usuarioId: string): Promise<ContextoComunidad> {
  const [acceso, membresias, rolesOrg, grupos] = await Promise.all([
    accesoDeUsuario(usuarioId),
    prisma.membresia.findMany({ where: { usuarioId, estado: 'ACTIVA' }, select: { organizacionId: true } }),
    prisma.usuarioRol.findMany({ where: { usuarioId, organizacionId: { not: null } }, select: { organizacionId: true } }),
    prisma.miembroGrupo.findMany({ where: { usuarioId }, select: { grupoId: true, rol: true, estado: true } }),
  ])
  const p = acceso.permisos
  return {
    usuarioId,
    participar: !!p['comunidad.participar'],
    moderarTodo: p['comunidad.moderar'] === 'TOTAL',
    moderaOrganizaciones: acceso.organizaciones['comunidad.moderar'] ?? [],
    administrarGrupos: p['grupo.administrar'] === 'TOTAL' ? 'TOTAL' : p['grupo.administrar'] === 'ORGANIZACION' ? 'ORGANIZACION' : null,
    administraOrganizaciones: acceso.organizaciones['grupo.administrar'] ?? [],
    organizaciones: [...new Set([...membresias.map(m => m.organizacionId), ...rolesOrg.map(r => r.organizacionId!)])],
    grupos: new Map(grupos.map(g => [g.grupoId, { rol: g.rol, estado: g.estado }])),
  }
}

interface GrupoBase { id: string, tipo: TipoGrupo, privacidad: PrivacidadGrupo, organizacionId: string | null, activo: boolean }

export function accesoGrupo(c: ContextoComunidad, g: GrupoBase) {
  const mg = c.grupos.get(g.id)
  const moderar = c.moderarTodo || (!!g.organizacionId && c.moderaOrganizaciones.includes(g.organizacionId)) || mg?.rol === 'MODERADOR'
  const miembro = (g.tipo === 'ORGANIZACION' && !!g.organizacionId && c.organizaciones.includes(g.organizacionId)) || mg?.estado === 'ACTIVO'
  if (!g.activo && !moderar) return { ver: false, publicar: false, moderar: false, miembro, pendiente: false }
  const ver = moderar || (g.privacidad === 'PRIVADO' ? miembro && c.participar : c.participar)
  const publicar = moderar || (c.participar && (g.privacidad === 'ABIERTO' || miembro))
  return { ver, publicar, moderar, miembro, pendiente: mg?.estado === 'PENDIENTE' }
}

async function grupoConAcceso(c: ContextoComunidad, grupoId: string) {
  const g = await prisma.grupo.findUnique({ where: { id: grupoId } })
  if (!g) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  const a = accesoGrupo(c, g)
  if (!a.ver) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  return { grupo: g, acceso: a }
}

async function publicacionConAcceso(c: ContextoComunidad, publicacionId: string) {
  const p = await prisma.publicacion.findUnique({ where: { id: publicacionId }, include: { grupo: true } })
  if (!p) throw createError({ statusCode: 404, message: 'Publicación no encontrada' })
  const a = accesoGrupo(c, p.grupo)
  if (!a.ver || (p.eliminadaEn && !a.moderar)) throw createError({ statusCode: 404, message: 'Publicación no encontrada' })
  return { publicacion: p, acceso: a }
}

/** Grupos que el usuario puede ver (los grupos son pocos: se filtran en memoria). */
async function gruposVisibles(c: ContextoComunidad) {
  const grupos = await prisma.grupo.findMany({ orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }] })
  return grupos.map(g => ({ ...g, acceso: accesoGrupo(c, g) })).filter(g => g.acceso.ver)
}

// --- Grupos ---------------------------------------------------------------------------------------

export async function listarGrupos(usuarioId: string) {
  const c = await contextoComunidad(usuarioId)
  const grupos = await gruposVisibles(c)
  const ids = grupos.map(g => g.id)
  const [publicaciones, miembros, pendientes] = await Promise.all([
    prisma.publicacion.groupBy({ by: ['grupoId'], where: { grupoId: { in: ids }, eliminadaEn: null }, _count: true, _max: { creadaEn: true } }),
    prisma.miembroGrupo.groupBy({ by: ['grupoId'], where: { grupoId: { in: ids }, estado: 'ACTIVO' }, _count: true }),
    prisma.miembroGrupo.groupBy({ by: ['grupoId'], where: { grupoId: { in: ids }, estado: 'PENDIENTE' }, _count: true }),
  ])
  return {
    puedeCrear: c.administrarGrupos === 'TOTAL',
    grupos: grupos.map(({ acceso, creadoPorId: _c, ...g }) => ({
      ...g,
      acceso,
      publicaciones: publicaciones.find(p => p.grupoId === g.id)?._count ?? 0,
      ultimaActividad: publicaciones.find(p => p.grupoId === g.id)?._max.creadaEn ?? null,
      miembros: miembros.find(m => m.grupoId === g.id)?._count ?? 0,
      solicitudes: acceso.moderar ? pendientes.find(m => m.grupoId === g.id)?._count ?? 0 : 0,
    })),
  }
}
export type GruposDto = Awaited<ReturnType<typeof listarGrupos>>
export type GrupoDto = GruposDto['grupos'][number]

export async function obtenerGrupo(usuarioId: string, slug: string) {
  const c = await contextoComunidad(usuarioId)
  const g = await prisma.grupo.findUnique({ where: { slug }, include: { especialidad: { select: { nombre: true } }, organizacion: { select: { nombre: true, siglas: true } } } })
  if (!g) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  const acceso = accesoGrupo(c, g)
  if (!acceso.ver) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  const pendientes = acceso.moderar
    ? await prisma.miembroGrupo.findMany({ where: { grupoId: g.id, estado: 'PENDIENTE' }, select: { unidoEn: true, usuario: { select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, perfil: { select: { fotoId: true, especialidad: { select: { nombre: true } } } } } } } })
    : []
  return { ...g, acceso, pendientes, puedeEditar: puedeAdministrarGrupo(c, g) }
}
export type GrupoDetalle = Awaited<ReturnType<typeof obtenerGrupo>>

function puedeAdministrarGrupo(c: ContextoComunidad, g: { organizacionId: string | null }) {
  return c.administrarGrupos === 'TOTAL' || (c.administrarGrupos === 'ORGANIZACION' && !!g.organizacionId && c.administraOrganizaciones.includes(g.organizacionId))
}

async function slugGrupo(tx: Tx | typeof prisma, nombre: string, excepto?: string) {
  const base = slugDe(nombre).slice(0, 70)
  let slug = base
  for (let i = 2; await tx.grupo.findFirst({ where: { slug, ...(excepto ? { id: { not: excepto } } : {}) }, select: { id: true } }); i++) slug = `${base}-${i}`
  return slug
}

/** Los grupos de organización se crean solos con la organización; aquí sólo los demás tipos. */
export async function crearGrupo(usuarioId: string, d: z.output<typeof grupoSchema>, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  if (c.administrarGrupos !== 'TOTAL') throw createError({ statusCode: 403, message: 'No tiene permiso para crear grupos' })
  if (d.tipo === 'ORGANIZACION') throw createError({ statusCode: 400, message: 'Los grupos de organización se crean automáticamente con cada organización' })
  return prisma.$transaction(async (tx) => {
    const g = await tx.grupo.create({
      data: { tipo: d.tipo, nombre: d.nombre, descripcion: d.descripcion, privacidad: d.privacidad, especialidadId: d.tipo === 'ESPECIALIDAD' ? d.especialidadId : null, activo: d.activo, slug: await slugGrupo(tx, d.nombre), creadoPorId: usuarioId },
    })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Grupo', entidadId: g.id, despues: d })
    return g
  })
}

export async function actualizarGrupo(usuarioId: string, id: string, d: z.output<typeof grupoSchema>, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const g = await prisma.grupo.findUnique({ where: { id } })
  if (!g) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  if (!puedeAdministrarGrupo(c, g)) throw createError({ statusCode: 403, message: 'No puede administrar este grupo' })
  // El tipo y el vínculo (especialidad u organización) no cambian.
  await prisma.$transaction(async (tx) => {
    await tx.grupo.update({ where: { id }, data: { nombre: d.nombre, descripcion: d.descripcion, privacidad: d.privacidad, activo: d.activo } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Grupo', entidadId: id, antes: g, despues: d })
  })
}

/** Unirse: libre en grupos ABIERTO/MIEMBROS; en PRIVADO queda pendiente de aprobación. */
export async function unirse(usuarioId: string, grupoId: string) {
  const c = await contextoComunidad(usuarioId)
  if (!c.participar) throw createError({ statusCode: 403, message: 'Su cuenta aún no participa en la comunidad' })
  const g = await prisma.grupo.findUnique({ where: { id: grupoId } })
  if (!g || !g.activo) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  if (g.tipo === 'ORGANIZACION') throw createError({ statusCode: 400, message: 'Los integrantes de la organización pertenecen a este grupo automáticamente' })
  if (c.grupos.has(grupoId)) throw createError({ statusCode: 409, message: 'Ya es miembro o tiene una solicitud pendiente' })
  const estado = g.privacidad === 'PRIVADO' ? 'PENDIENTE' as const : 'ACTIVO' as const
  await prisma.$transaction(async (tx) => {
    await tx.miembroGrupo.create({ data: { grupoId, usuarioId, estado } })
    if (estado === 'PENDIENTE') {
      const u = await tx.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } })
      for (const m of await moderadoresDe(tx, g)) {
        await notificar(tx, m, { tipo: 'COMUNIDAD', titulo: `Solicitud para unirse a ${g.nombre}`, cuerpo: nombreCompleto(u), enlace: `/plataforma/comunidad/${g.slug}` })
      }
    }
  })
  return { estado }
}

export async function salir(usuarioId: string, grupoId: string) {
  await prisma.miembroGrupo.deleteMany({ where: { grupoId, usuarioId } })
}

export async function resolverSolicitudGrupo(usuarioId: string, grupoId: string, miembroId: string, aprobar: boolean, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { grupo, acceso } = await grupoConAcceso(c, grupoId)
  if (!acceso.moderar) throw createError({ statusCode: 403, message: 'Sólo la moderación aprueba solicitudes' })
  await prisma.$transaction(async (tx) => {
    const m = await tx.miembroGrupo.findUnique({ where: { grupoId_usuarioId: { grupoId, usuarioId: miembroId } } })
    if (!m || m.estado !== 'PENDIENTE') throw createError({ statusCode: 404, message: 'Solicitud no encontrada' })
    if (aprobar) await tx.miembroGrupo.update({ where: { grupoId_usuarioId: { grupoId, usuarioId: miembroId } }, data: { estado: 'ACTIVO' } })
    else await tx.miembroGrupo.delete({ where: { grupoId_usuarioId: { grupoId, usuarioId: miembroId } } })
    await auditar(tx, ctx, { accion: aprobar ? 'VALIDAR' : 'RECHAZAR', entidad: 'MiembroGrupo', entidadId: `${grupoId}:${miembroId}` })
    await notificar(tx, miembroId, {
      tipo: 'COMUNIDAD',
      titulo: aprobar ? `Bienvenido(a) a ${grupo.nombre}` : `Solicitud no aprobada: ${grupo.nombre}`,
      enlace: aprobar ? `/plataforma/comunidad/${grupo.slug}` : '/plataforma/comunidad',
    })
  })
}

/** Moderadores de un grupo: los de la Federación, los de su organización y los del grupo. */
async function moderadoresDe(tx: Tx, g: { id: string, organizacionId: string | null }) {
  const ids = new Set((await usuariosConPermisoTotal(tx, 'comunidad.moderar')).map(u => u.id))
  if (g.organizacionId) {
    const org = await tx.usuarioRol.findMany({
      where: { organizacionId: g.organizacionId, usuario: { activo: true }, rol: { activo: true, permisos: { some: { permiso: 'comunidad.moderar', alcance: 'ORGANIZACION' } } } },
      select: { usuarioId: true },
    })
    org.forEach(r => ids.add(r.usuarioId))
  }
  const delGrupo = await tx.miembroGrupo.findMany({ where: { grupoId: g.id, rol: 'MODERADOR', estado: 'ACTIVO' }, select: { usuarioId: true } })
  delGrupo.forEach(m => ids.add(m.usuarioId))
  return [...ids]
}

// --- Publicaciones -----------------------------------------------------------------------------------

const SELECT_AUTOR = { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, perfil: { select: { fotoId: true, especialidad: { select: { nombre: true } } } } } as const

function resumenReacciones(rs: { tipo: TipoReaccion, usuarioId: string }[], usuarioId: string) {
  const conteo: Partial<Record<TipoReaccion, number>> = {}
  for (const r of rs) conteo[r.tipo] = (conteo[r.tipo] ?? 0) + 1
  return { conteo, mia: rs.find(r => r.usuarioId === usuarioId)?.tipo ?? null, total: rs.length }
}

/** Actividad reciente: publicaciones de los grupos visibles (o de uno), fijadas primero dentro del grupo. */
export async function listarPublicaciones(usuarioId: string, q: z.output<typeof publicacionesQuery>) {
  const c = await contextoComunidad(usuarioId)
  const visibles = await gruposVisibles(c)
  let ids = visibles.filter(g => g.activo).map(g => g.id)
  if (q.grupoId) {
    if (!visibles.some(g => g.id === q.grupoId)) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
    ids = [q.grupoId]
  }
  const where: Prisma.PublicacionWhereInput = {
    grupoId: { in: ids },
    eliminadaEn: null,
    ...(q.q ? { OR: [{ titulo: { contains: q.q, mode: 'insensitive' } }, { contenido: { contains: q.q, mode: 'insensitive' } }] } : {}),
  }
  const [total, filas] = await Promise.all([
    prisma.publicacion.count({ where }),
    prisma.publicacion.findMany({
      where,
      orderBy: q.grupoId ? [{ fijada: 'desc' }, { creadaEn: 'desc' }] : [{ creadaEn: 'desc' }],
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      select: {
        id: true, titulo: true, contenido: true, fijada: true, creadaEn: true, editadaEn: true, autorId: true,
        autor: { select: SELECT_AUTOR },
        grupo: { select: { id: true, nombre: true, slug: true } },
        reacciones: { select: { tipo: true, usuarioId: true } },
        adjuntos: { orderBy: { orden: 'asc' }, select: { id: true, archivo: { select: { mime: true, nombreOriginal: true, tamano: true } } } },
        _count: { select: { comentarios: { where: { eliminadoEn: null } } } },
      },
    }),
  ])
  return {
    total,
    pagina: q.pagina,
    porPagina: q.porPagina,
    datos: filas.map(({ reacciones, _count, contenido, ...p }) => ({
      ...p,
      // En el listado sólo un extracto; el texto completo está en el detalle.
      contenido: contenido.length > 600 ? `${contenido.slice(0, 600)}…` : contenido,
      recortado: contenido.length > 600,
      reacciones: resumenReacciones(reacciones, usuarioId),
      comentarios: _count.comentarios,
      propia: p.autorId === usuarioId,
    })),
  }
}
export type PublicacionFila = Awaited<ReturnType<typeof listarPublicaciones>>['datos'][number]

export async function obtenerPublicacion(usuarioId: string, id: string) {
  const c = await contextoComunidad(usuarioId)
  const { publicacion, acceso } = await publicacionConAcceso(c, id)
  const p = await prisma.publicacion.findUniqueOrThrow({
    where: { id },
    select: {
      id: true, titulo: true, contenido: true, fijada: true, creadaEn: true, editadaEn: true, eliminadaEn: true, motivoEliminacion: true, autorId: true,
      autor: { select: SELECT_AUTOR },
      grupo: { select: { id: true, nombre: true, slug: true } },
      reacciones: { select: { tipo: true, usuarioId: true } },
      adjuntos: { orderBy: { orden: 'asc' }, select: { id: true, archivo: { select: { mime: true, nombreOriginal: true, tamano: true } } } },
      comentarios: {
        orderBy: { creadoEn: 'asc' },
        select: {
          id: true, padreId: true, contenido: true, creadoEn: true, editadoEn: true, eliminadoEn: true, autorId: true,
          autor: { select: SELECT_AUTOR },
          reacciones: { select: { tipo: true, usuarioId: true } },
        },
      },
    },
  })
  const { reacciones, comentarios, ...resto } = p
  return {
    ...resto,
    acceso: { publicar: acceso.publicar, moderar: acceso.moderar },
    propia: p.autorId === usuarioId,
    reacciones: resumenReacciones(reacciones, usuarioId),
    // Los comentarios eliminados se conservan como "[eliminado]" para no romper los hilos.
    comentarios: comentarios.map(({ reacciones: rs, ...cm }) => ({
      ...cm,
      contenido: cm.eliminadoEn ? '' : cm.contenido,
      propio: cm.autorId === usuarioId,
      reacciones: resumenReacciones(rs, usuarioId),
    })),
    grupoActivo: publicacion.grupo.activo,
  }
}
export type PublicacionDetalle = Awaited<ReturnType<typeof obtenerPublicacion>>

export async function publicar(usuarioId: string, grupoId: string, d: z.output<typeof publicacionSchema>, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { grupo, acceso } = await grupoConAcceso(c, grupoId)
  if (!acceso.publicar || !grupo.activo) throw createError({ statusCode: 403, message: grupo.privacidad === 'MIEMBROS' ? 'Únase al grupo para publicar' : 'No puede publicar en este grupo' })
  return prisma.$transaction(async (tx) => {
    const p = await tx.publicacion.create({ data: { grupoId, autorId: usuarioId, titulo: d.titulo, contenido: d.contenido } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Publicacion', entidadId: p.id, despues: { grupoId, titulo: d.titulo } })
    return p
  })
}

export async function editarPublicacion(usuarioId: string, id: string, d: z.output<typeof publicacionSchema>, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { publicacion } = await publicacionConAcceso(c, id)
  if (publicacion.autorId !== usuarioId || publicacion.eliminadaEn) throw createError({ statusCode: 403, message: 'Sólo el autor edita su publicación' })
  await prisma.$transaction(async (tx) => {
    await tx.publicacion.update({ where: { id }, data: { titulo: d.titulo, contenido: d.contenido, editadaEn: new Date() } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Publicacion', entidadId: id, antes: { titulo: publicacion.titulo, contenido: publicacion.contenido }, despues: d })
  })
}

/** El autor elimina la suya; la moderación elimina cualquiera (con motivo, y se avisa al autor). */
export async function eliminarPublicacion(usuarioId: string, id: string, motivo: string | null, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { publicacion, acceso } = await publicacionConAcceso(c, id)
  const propia = publicacion.autorId === usuarioId
  if (!propia && !acceso.moderar) throw createError({ statusCode: 403, message: 'No puede eliminar esta publicación' })
  if (publicacion.eliminadaEn) return
  await prisma.$transaction(async (tx) => {
    await eliminarContenido(tx, { publicacionId: id }, usuarioId, propia ? null : motivo)
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Publicacion', entidadId: id, motivo: propia ? 'Eliminada por su autor' : motivo })
    if (!propia) await notificar(tx, publicacion.autorId, { tipo: 'COMUNIDAD', titulo: 'Se retiró una de sus publicaciones', cuerpo: motivo ?? 'Por decisión de la moderación.' })
  })
}

async function eliminarContenido(tx: Tx, destino: { publicacionId?: string, comentarioId?: string }, porId: string, motivo: string | null) {
  const datos = { eliminadoPorId: porId, motivoEliminacion: motivo }
  if (destino.publicacionId) {
    await tx.publicacion.update({ where: { id: destino.publicacionId }, data: { eliminadaEn: new Date(), eliminadaPorId: porId, motivoEliminacion: motivo } })
    await tx.reporte.updateMany({ where: { publicacionId: destino.publicacionId, estado: 'PENDIENTE' }, data: { estado: 'ELIMINADO', resueltoPorId: porId, resueltoEn: new Date() } })
  }
  if (destino.comentarioId) {
    await tx.comentario.update({ where: { id: destino.comentarioId }, data: { eliminadoEn: new Date(), ...datos } })
    await tx.reporte.updateMany({ where: { comentarioId: destino.comentarioId, estado: 'PENDIENTE' }, data: { estado: 'ELIMINADO', resueltoPorId: porId, resueltoEn: new Date() } })
  }
}

export async function fijarPublicacion(usuarioId: string, id: string, fijada: boolean, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { acceso } = await publicacionConAcceso(c, id)
  if (!acceso.moderar) throw createError({ statusCode: 403, message: 'Sólo la moderación fija publicaciones' })
  await prisma.$transaction(async (tx) => {
    await tx.publicacion.update({ where: { id }, data: { fijada } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Publicacion.fijada', entidadId: id, despues: { fijada } })
  })
}

// --- Comentarios y reacciones --------------------------------------------------------------------------

export async function comentar(usuarioId: string, publicacionId: string, d: z.output<typeof comentarioSchema>, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { publicacion, acceso } = await publicacionConAcceso(c, publicacionId)
  if (!acceso.publicar || publicacion.eliminadaEn || !publicacion.grupo.activo) throw createError({ statusCode: 403, message: 'No puede comentar en este grupo' })
  return prisma.$transaction(async (tx) => {
    let padreAutor: string | null = null
    if (d.padreId) {
      const padre = await tx.comentario.findUnique({ where: { id: d.padreId }, select: { publicacionId: true, autorId: true, eliminadoEn: true } })
      if (!padre || padre.publicacionId !== publicacionId || padre.eliminadoEn) throw createError({ statusCode: 400, message: 'El comentario al que responde no existe' })
      padreAutor = padre.autorId
    }
    const cm = await tx.comentario.create({ data: { publicacionId, autorId: usuarioId, padreId: d.padreId, contenido: d.contenido } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Comentario', entidadId: cm.id, despues: { publicacionId, padreId: d.padreId } })
    const u = await tx.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } })
    const avisar = new Set([publicacion.autorId, padreAutor].filter((x): x is string => !!x && x !== usuarioId))
    for (const destino of avisar) {
      await notificar(tx, destino, {
        tipo: 'COMUNIDAD',
        titulo: destino === padreAutor ? `${nombreCompleto(u)} respondió a su comentario` : `${nombreCompleto(u)} comentó su publicación`,
        cuerpo: d.contenido.slice(0, 140),
        enlace: `/plataforma/comunidad/publicacion/${publicacionId}`,
      })
    }
    return cm
  })
}

export async function editarComentario(usuarioId: string, id: string, contenido: string, ctx: ContextoAuditoria) {
  const cm = await prisma.comentario.findUnique({ where: { id } })
  if (!cm || cm.autorId !== usuarioId || cm.eliminadoEn) throw createError({ statusCode: 403, message: 'Sólo el autor edita su comentario' })
  await publicacionConAcceso(await contextoComunidad(usuarioId), cm.publicacionId)
  await prisma.$transaction(async (tx) => {
    await tx.comentario.update({ where: { id }, data: { contenido, editadoEn: new Date() } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Comentario', entidadId: id, antes: { contenido: cm.contenido }, despues: { contenido } })
  })
}

export async function eliminarComentario(usuarioId: string, id: string, motivo: string | null, ctx: ContextoAuditoria) {
  const cm = await prisma.comentario.findUnique({ where: { id } })
  if (!cm) throw createError({ statusCode: 404, message: 'Comentario no encontrado' })
  const { acceso } = await publicacionConAcceso(await contextoComunidad(usuarioId), cm.publicacionId)
  const propio = cm.autorId === usuarioId
  if (!propio && !acceso.moderar) throw createError({ statusCode: 403, message: 'No puede eliminar este comentario' })
  if (cm.eliminadoEn) return
  await prisma.$transaction(async (tx) => {
    await eliminarContenido(tx, { comentarioId: id }, usuarioId, propio ? null : motivo)
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Comentario', entidadId: id, motivo: propio ? 'Eliminado por su autor' : motivo })
    if (!propio) await notificar(tx, cm.autorId, { tipo: 'COMUNIDAD', titulo: 'Se retiró uno de sus comentarios', cuerpo: motivo ?? 'Por decisión de la moderación.' })
  })
}

/** Pone, cambia o quita (tipo = null) la reacción del usuario. */
export async function reaccionar(usuarioId: string, destino: { publicacionId?: string, comentarioId?: string }, tipo: TipoReaccion | null) {
  const c = await contextoComunidad(usuarioId)
  if (!c.participar) throw createError({ statusCode: 403, message: 'Su cuenta aún no participa en la comunidad' })
  const publicacionId = destino.publicacionId
    ?? (await prisma.comentario.findUnique({ where: { id: destino.comentarioId! }, select: { publicacionId: true } }))?.publicacionId
  if (!publicacionId) throw createError({ statusCode: 404, message: 'No encontrado' })
  await publicacionConAcceso(c, publicacionId)
  const where = destino.publicacionId ? { usuarioId, publicacionId: destino.publicacionId } : { usuarioId, comentarioId: destino.comentarioId }
  await prisma.$transaction(async (tx) => {
    const actual = await tx.reaccion.findFirst({ where })
    if (!tipo) {
      if (actual) await tx.reaccion.delete({ where: { id: actual.id } })
    }
    else if (actual) await tx.reaccion.update({ where: { id: actual.id }, data: { tipo } })
    else await tx.reaccion.create({ data: { ...where, tipo } })
  })
}

// --- Adjuntos ----------------------------------------------------------------------------------------------

export async function adjuntar(usuarioId: string, publicacionId: string, archivos: { datos: Buffer, nombre: string }[], ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const { publicacion } = await publicacionConAcceso(c, publicacionId)
  if (publicacion.autorId !== usuarioId || publicacion.eliminadaEn) throw createError({ statusCode: 403, message: 'Sólo el autor adjunta archivos a su publicación' })
  await prisma.$transaction(async (tx) => {
    const existentes = await tx.adjuntoPublicacion.count({ where: { publicacionId } })
    if (existentes + archivos.length > MAX_ADJUNTOS_POR_PUBLICACION) throw createError({ statusCode: 400, message: `Máximo ${MAX_ADJUNTOS_POR_PUBLICACION} archivos por publicación` })
    for (const [i, a] of archivos.entries()) {
      const archivo = await guardarArchivo(tx, { datos: a.datos, nombreOriginal: a.nombre, permitidos: [...IMAGENES, PDF], maxBytes: MAX_ADJUNTO, visibilidad: 'RESTRINGIDO', subidoPorId: usuarioId })
      await tx.adjuntoPublicacion.create({ data: { publicacionId, archivoId: archivo.id, orden: existentes + i } })
    }
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'AdjuntoPublicacion', entidadId: publicacionId, despues: { archivos: archivos.map(a => a.nombre) } })
  })
}

export async function quitarAdjunto(usuarioId: string, adjuntoId: string, ctx: ContextoAuditoria) {
  const a = await prisma.adjuntoPublicacion.findUnique({ where: { id: adjuntoId }, include: { publicacion: { select: { autorId: true } }, archivo: { select: { id: true, ruta: true } } } })
  if (!a || a.publicacion.autorId !== usuarioId) throw createError({ statusCode: 404, message: 'Adjunto no encontrado' })
  await prisma.$transaction(async (tx) => {
    await tx.adjuntoPublicacion.delete({ where: { id: adjuntoId } })
    await tx.archivo.delete({ where: { id: a.archivo.id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'AdjuntoPublicacion', entidadId: adjuntoId })
  })
  await borrarDeDisco(a.archivo.ruta)
}

/** Entrega un adjunto sólo a quien puede ver la publicación. */
export async function leerAdjunto(usuarioId: string, adjuntoId: string) {
  const a = await prisma.adjuntoPublicacion.findUnique({ where: { id: adjuntoId }, include: { archivo: true } })
  if (!a) throw createError({ statusCode: 404, message: 'No encontrado' })
  await publicacionConAcceso(await contextoComunidad(usuarioId), a.publicacionId)
  return { archivo: a.archivo, datos: await leerArchivo(a.archivo.ruta) }
}

// --- Reportes y moderación ------------------------------------------------------------------------------

export async function reportar(usuarioId: string, destino: { publicacionId?: string, comentarioId?: string }, d: z.output<typeof reporteSchema>, ctx: ContextoAuditoria) {
  const c = await contextoComunidad(usuarioId)
  const publicacionId = destino.publicacionId
    ?? (await prisma.comentario.findUnique({ where: { id: destino.comentarioId! }, select: { publicacionId: true } }))?.publicacionId
  if (!publicacionId) throw createError({ statusCode: 404, message: 'No encontrado' })
  const { publicacion } = await publicacionConAcceso(c, publicacionId)
  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.reporte.create({ data: { ...destino, reportadoPorId: usuarioId, motivo: d.motivo as MotivoReporte, detalle: d.detalle } })
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Reporte', entidadId: r.id, despues: { ...destino, motivo: d.motivo } })
      for (const m of await moderadoresDe(tx, publicacion.grupo)) {
        if (m !== usuarioId) await notificar(tx, m, { tipo: 'COMUNIDAD', titulo: d.motivo === 'DATOS_PACIENTE' ? 'Reporte urgente: posibles datos de paciente' : 'Contenido reportado', cuerpo: publicacion.grupo.nombre, enlace: '/plataforma/moderacion' })
      }
    })
  }
  catch (e) {
    if (/Reporte_usuario_(publicacion|comentario)_key/.test(String((e as Error).message)) || (e as { code?: string }).code === 'P2002') {
      throw createError({ statusCode: 409, message: 'Ya reportó este contenido; la moderación lo revisará' })
    }
    throw e
  }
}

/** Reportes pendientes de los grupos que el usuario modera. */
export async function listarReportes(usuarioId: string) {
  const c = await contextoComunidad(usuarioId)
  const grupos = (await gruposVisibles(c)).filter(g => g.acceso.moderar).map(g => g.id)
  if (!grupos.length) throw createError({ statusCode: 403, message: 'No modera ningún grupo' })
  const filas = await prisma.reporte.findMany({
    where: { estado: 'PENDIENTE', OR: [{ publicacion: { grupoId: { in: grupos } } }, { comentario: { publicacion: { grupoId: { in: grupos } } } }] },
    orderBy: { creadoEn: 'asc' },
    select: {
      id: true, motivo: true, detalle: true, creadoEn: true,
      reportadoPor: { select: { nombre: true, apellidoPaterno: true } },
      publicacion: { select: { id: true, titulo: true, contenido: true, autor: { select: { nombre: true, apellidoPaterno: true } }, grupo: { select: { nombre: true } } } },
      comentario: { select: { id: true, contenido: true, publicacionId: true, autor: { select: { nombre: true, apellidoPaterno: true } }, publicacion: { select: { grupo: { select: { nombre: true } } } } } },
    },
  })
  // Los reportes de datos de pacientes primero.
  return filas.sort((a, b) => Number(b.motivo === 'DATOS_PACIENTE') - Number(a.motivo === 'DATOS_PACIENTE'))
}
export type ReporteDto = Awaited<ReturnType<typeof listarReportes>>[number]

export async function resolverReporte(usuarioId: string, id: string, d: z.output<typeof moderarSchema>, ctx: ContextoAuditoria) {
  const r = await prisma.reporte.findUnique({ where: { id }, include: { comentario: { select: { publicacionId: true } } } })
  if (!r || r.estado !== 'PENDIENTE') throw createError({ statusCode: 404, message: 'Reporte no encontrado o ya resuelto' })
  const c = await contextoComunidad(usuarioId)
  const { acceso } = await publicacionConAcceso(c, r.publicacionId ?? r.comentario!.publicacionId)
  if (!acceso.moderar) throw createError({ statusCode: 403, message: 'No modera este grupo' })
  if (d.decision === 'ELIMINAR') {
    if (r.publicacionId) await eliminarPublicacion(usuarioId, r.publicacionId, d.nota ?? 'Contenido reportado', ctx)
    else await eliminarComentario(usuarioId, r.comentarioId!, d.nota ?? 'Contenido reportado', ctx)
    await prisma.reporte.updateMany({ where: { id }, data: { nota: d.nota } })
    return
  }
  await prisma.$transaction(async (tx) => {
    // Desestimar cierra todos los reportes pendientes del mismo contenido.
    await tx.reporte.updateMany({
      where: { estado: 'PENDIENTE', ...(r.publicacionId ? { publicacionId: r.publicacionId } : { comentarioId: r.comentarioId }) },
      data: { estado: 'DESESTIMADO', resueltoPorId: usuarioId, resueltoEn: new Date(), nota: d.nota },
    })
    await auditar(tx, ctx, { accion: 'RECHAZAR', entidad: 'Reporte', entidadId: id, motivo: d.nota })
  })
}

/** Al registrar una organización se crea su espacio privado en la comunidad. */
export async function crearGrupoDeOrganizacion(tx: Tx, org: { id: string, nombre: string, slug: string }) {
  await tx.grupo.create({
    data: {
      tipo: 'ORGANIZACION', organizacionId: org.id, privacidad: 'PRIVADO', nombre: org.nombre,
      descripcion: 'Espacio de comunicación de los integrantes de la organización.', slug: await slugGrupo(tx, `org ${org.slug}`),
    },
  })
}
