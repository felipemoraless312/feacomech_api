// Colegios y asociaciones: registro, datos, afiliación a la Federación (con historial),
// representantes, cambios propuestos por los representantes y estadísticas.
import { createError } from 'h3'
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { EstadoAfiliacion } from '../generated/prisma/enums'
import { CATALOGO_PERMISOS, ROL_SUPERADMIN, esPermiso } from '../../shared/permisos'
import {
  aFecha, datosOrganizacionSchema, type DatosOrganizacion, type estadoAfiliacionSchema,
  type organizacionCrearSchema, type organizacionListaQuery, type organizacionSchema,
} from '../../shared/schemas/organizacion'
import { normalizarNombre } from '../../shared/texto'
import { IMAGENES, borrarDeDisco, guardarArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma, type Tx } from '../utils/prisma'
import { notificar } from './notificaciones'
import { crearGrupoDeOrganizacion } from './comunidad'
import { estructuraPublica } from './estructura'
import { invalidarPermisos, usuariosConPermisoTotal, type Ambito } from './permisos'

export const MAX_LOGO_BYTES = 2 * 1024 * 1024

type Crear = z.output<typeof organizacionCrearSchema>
type Editar = z.output<typeof organizacionSchema>
type ListaQuery = z.output<typeof organizacionListaQuery>

const hoy = () => aFecha(new Date().toISOString().slice(0, 10))

/** "Colegio Médico de Tapachula" → "colegio-medico-de-tapachula" */
export function slugDe(texto: string) {
  return normalizarNombre(texto).toLowerCase().replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'organizacion'
}

/** Rutas fijas del directorio público que ninguna organización puede usar como slug. */
const RESERVADOS = new Set(['mesa-directiva', 'consejo-consultivo', 'profesionales', 'organizaciones', 'historial'])

async function slugDisponible(tx: Tx, base: string, excepto?: string) {
  let slug = RESERVADOS.has(base) ? `${base}-org` : base
  for (let i = 2; await tx.organizacion.findFirst({ where: { slug, ...(excepto ? { id: { not: excepto } } : {}) }, select: { id: true } }); i++) {
    slug = `${base}-${i}`
  }
  return slug
}

function nombreDuplicado(e: unknown): never {
  if ((e as { code?: string }).code === 'P2002' || /Organizacion_tipo_nombre_key/.test(String((e as Error).message))) {
    throw createError({ statusCode: 409, message: 'Ya existe una organización de ese tipo con ese nombre', data: { campos: { nombre: 'Ya existe' } } })
  }
  throw e
}

const datosColumna = (d: DatosOrganizacion) => ({
  ...d,
  fechaConstitucion: d.fechaConstitucion ? aFecha(d.fechaConstitucion) : null,
})

const filtroAmbito = (ambito: Ambito): Prisma.OrganizacionWhereInput => (ambito.todas ? {} : { id: { in: ambito.ids } })

export async function listarOrganizaciones(q: ListaQuery, ambito: Ambito) {
  const where: Prisma.OrganizacionWhereInput = {
    ...filtroAmbito(ambito),
    ...(q.tipo ? { tipo: q.tipo } : {}),
    ...(q.estado ? { estadoAfiliacion: q.estado } : {}),
    ...(q.q ? { OR: [{ nombre: { contains: q.q, mode: 'insensitive' } }, { siglas: { contains: q.q, mode: 'insensitive' } }, { municipio: { contains: q.q, mode: 'insensitive' } }] } : {}),
  }
  const [total, filas] = await Promise.all([
    prisma.organizacion.count({ where }),
    prisma.organizacion.findMany({
      where,
      orderBy: { nombre: 'asc' },
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      select: {
        id: true, tipo: true, nombre: true, siglas: true, municipio: true, logoId: true, estadoAfiliacion: true, publica: true,
        _count: { select: { membresias: { where: { estado: 'ACTIVA' } }, solicitudesCambio: { where: { estado: 'PENDIENTE' } } } },
      },
    }),
  ])
  const pendientes = await prisma.membresia.groupBy({
    by: ['organizacionId'],
    where: { organizacionId: { in: filas.map(f => f.id) }, OR: [{ estado: 'SOLICITADA' }, { estado: 'ACTIVA', bajaSolicitadaEn: { not: null } }] },
    _count: true,
  })
  return {
    total,
    pagina: q.pagina,
    porPagina: q.porPagina,
    datos: filas.map(({ _count, ...o }) => ({
      ...o,
      integrantes: _count.membresias,
      solicitudes: (pendientes.find(p => p.organizacionId === o.id)?._count ?? 0) + _count.solicitudesCambio,
    })),
  }
}
export type OrganizacionFila = Awaited<ReturnType<typeof listarOrganizaciones>>['datos'][number]

export async function obtenerOrganizacion(id: string) {
  const o = await prisma.organizacion.findUnique({
    where: { id },
    include: {
      afiliaciones: { orderBy: { desde: 'desc' }, include: { registradoPor: { select: { nombre: true, apellidoPaterno: true } } } },
      roles: {
        orderBy: { asignadoEn: 'asc' },
        select: {
          id: true,
          asignadoEn: true,
          rol: { select: { id: true, nombre: true } },
          usuario: { select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true, perfil: { select: { fotoId: true } } } },
        },
      },
      solicitudesCambio: {
        where: { estado: 'PENDIENTE' },
        include: { solicitadaPor: { select: { nombre: true, apellidoPaterno: true } } },
      },
    },
  })
  if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
  const { solicitudesCambio, ...resto } = o
  return { ...resto, cambioPendiente: solicitudesCambio[0] ?? null }
}
export type OrganizacionDetalle = Awaited<ReturnType<typeof obtenerOrganizacion>>

export async function crearOrganizacion(d: Crear, ctx: ContextoAuditoria) {
  try {
    return await prisma.$transaction(async (tx) => {
      const { estadoAfiliacion, afiliadaDesde, tipo, publica, ...datos } = d
      const o = await tx.organizacion.create({
        data: {
          ...datosColumna(datos),
          tipo,
          publica,
          slug: await slugDisponible(tx, slugDe(d.siglas ? `${d.siglas} ${d.municipio ?? ''}` : d.nombre)),
          estadoAfiliacion,
        },
      })
      await tx.afiliacionOrganizacion.create({
        data: {
          organizacionId: o.id,
          estado: estadoAfiliacion,
          desde: afiliadaDesde ? aFecha(afiliadaDesde) : hoy(),
          motivo: 'Registro en la plataforma',
          registradoPorId: ctx.usuarioId ?? null,
        },
      })
      await crearGrupoDeOrganizacion(tx, o)
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Organizacion', entidadId: o.id, despues: o })
      return o
    })
  }
  catch (e) {
    nombreDuplicado(e)
  }
}

async function aplicarDatos(tx: Tx, id: string, datos: DatosOrganizacion & Partial<Pick<Editar, 'tipo' | 'publica'>>, ctx: ContextoAuditoria, motivo?: string) {
  const antes = await tx.organizacion.findUnique({ where: { id } })
  if (!antes) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
  const o = await tx.organizacion.update({ where: { id }, data: datosColumna(datos) })
  await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Organizacion', entidadId: id, antes, despues: o, motivo })
  return o
}

/** Edición directa por la Federación. */
export async function actualizarOrganizacion(id: string, d: Editar, ctx: ContextoAuditoria) {
  try {
    return await prisma.$transaction(tx => aplicarDatos(tx, id, d, ctx))
  }
  catch (e) {
    nombreDuplicado(e)
  }
}

/** Cierra el periodo vigente y abre uno nuevo con el estado indicado. */
export async function cambiarEstadoAfiliacion(id: string, d: z.output<typeof estadoAfiliacionSchema>, ctx: ContextoAuditoria) {
  const desde = aFecha(d.desde)
  await prisma.$transaction(async (tx) => {
    const o = await tx.organizacion.findUnique({ where: { id }, select: { estadoAfiliacion: true, nombre: true } })
    if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
    const vigente = await tx.afiliacionOrganizacion.findFirst({ where: { organizacionId: id, hasta: null } })
    if (vigente && desde < vigente.desde) {
      throw createError({ statusCode: 400, message: 'La fecha no puede ser anterior al inicio del periodo vigente', data: { campos: { desde: 'Anterior al periodo vigente' } } })
    }
    if (vigente) await tx.afiliacionOrganizacion.update({ where: { id: vigente.id }, data: { hasta: desde } })
    await tx.afiliacionOrganizacion.create({
      data: { organizacionId: id, estado: d.estado, desde, motivo: d.motivo, registradoPorId: ctx.usuarioId ?? null },
    })
    await tx.organizacion.update({ where: { id }, data: { estadoAfiliacion: d.estado as EstadoAfiliacion } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Organizacion.afiliacion', entidadId: id, antes: { estado: o.estadoAfiliacion }, despues: d, motivo: d.motivo })
  })
}

// --- Cambios propuestos por representantes ---------------------------------

/** Propone cambios; si ya hay una propuesta pendiente, la reemplaza. */
export async function proponerCambio(id: string, d: DatosOrganizacion, ctx: ContextoAuditoria) {
  const s = await prisma.$transaction(async (tx) => {
    const o = await tx.organizacion.findUnique({ where: { id }, select: { nombre: true } })
    if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
    const pendiente = await tx.solicitudCambio.findFirst({ where: { organizacionId: id, estado: 'PENDIENTE' } })
    const sol = pendiente
      ? await tx.solicitudCambio.update({ where: { id: pendiente.id }, data: { datos: d, solicitadaPorId: ctx.usuarioId ?? null, creadaEn: new Date() } })
      : await tx.solicitudCambio.create({ data: { organizacionId: id, datos: d, solicitadaPorId: ctx.usuarioId ?? null } })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'SolicitudCambio', entidadId: sol.id, despues: d })
    for (const u of await usuariosConPermisoTotal(tx, 'organizacion.administrar')) {
      await notificar(tx, u.id, { tipo: 'AFILIACION', titulo: `Cambios propuestos: ${o.nombre}`, cuerpo: 'Un representante propuso actualizar los datos de su organización.', enlace: '/plataforma/afiliaciones' })
    }
    return sol
  })
  return s
}

export async function resolverCambio(solicitudId: string, aprobar: boolean, motivo: string | null, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const s = await tx.solicitudCambio.findUnique({ where: { id: solicitudId }, include: { organizacion: { select: { nombre: true } } } })
    if (!s) throw createError({ statusCode: 404, message: 'Solicitud no encontrada' })
    if (s.estado !== 'PENDIENTE') throw createError({ statusCode: 409, message: 'La solicitud ya fue resuelta' })
    if (!aprobar && !motivo) throw createError({ statusCode: 400, message: 'Escriba el motivo del rechazo' })

    if (aprobar) {
      const datos = datosOrganizacionSchema.parse(s.datos)
      await aplicarDatos(tx, s.organizacionId, datos, ctx, 'Cambio propuesto por el representante y aprobado').catch(nombreDuplicado)
    }
    await tx.solicitudCambio.update({
      where: { id: solicitudId },
      data: { estado: aprobar ? 'APROBADA' : 'RECHAZADA', resueltaPorId: ctx.usuarioId ?? null, resueltaEn: new Date(), motivo },
    })
    await auditar(tx, ctx, { accion: aprobar ? 'VALIDAR' : 'RECHAZAR', entidad: 'SolicitudCambio', entidadId: solicitudId, motivo })
    if (s.solicitadaPorId) {
      await notificar(tx, s.solicitadaPorId, {
        tipo: 'AFILIACION',
        titulo: aprobar ? `Cambios aprobados: ${s.organizacion.nombre}` : `Cambios no aprobados: ${s.organizacion.nombre}`,
        cuerpo: aprobar ? 'La Federación aplicó los datos que propuso.' : motivo ?? undefined,
        enlace: `/plataforma/organizaciones/${s.organizacionId}`,
      })
    }
  })
}

// --- Logotipo ----------------------------------------------------------------

export async function guardarLogo(id: string, datos: Buffer, nombre: string, ctx: ContextoAuditoria) {
  const rutaAnterior = await prisma.$transaction(async (tx) => {
    const o = await tx.organizacion.findUnique({ where: { id }, select: { logo: { select: { id: true, ruta: true } } } })
    if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
    // El logotipo de una organización es información pública.
    const archivo = await guardarArchivo(tx, { datos, nombreOriginal: nombre, permitidos: IMAGENES, maxBytes: MAX_LOGO_BYTES, visibilidad: 'PUBLICO', subidoPorId: ctx.usuarioId ?? null })
    await tx.organizacion.update({ where: { id }, data: { logoId: archivo.id } })
    if (o.logo) await tx.archivo.delete({ where: { id: o.logo.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Organizacion.logo', entidadId: id, despues: { archivoId: archivo.id } })
    return o.logo?.ruta
  })
  if (rutaAnterior) await borrarDeDisco(rutaAnterior)
}

// --- Representantes ------------------------------------------------------------

/**
 * Asigna un rol ligado a la organización (p. ej. representante de colegio). El rol debe
 * tener algún permiso de alcance ORGANIZACION; el superadministrador no se liga a organizaciones.
 */
export async function asignarRepresentante(organizacionId: string, usuarioId: string, rolId: string, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const [o, u, rol] = await Promise.all([
      tx.organizacion.findUnique({ where: { id: organizacionId }, select: { nombre: true } }),
      tx.usuario.findUnique({ where: { id: usuarioId }, select: { activo: true } }),
      tx.rol.findUnique({ where: { id: rolId }, select: { clave: true, nombre: true, activo: true, permisos: { select: { permiso: true, alcance: true } } } }),
    ])
    if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
    if (!u?.activo) throw createError({ statusCode: 400, message: 'El usuario no existe o está desactivado', data: { campos: { usuarioId: 'No válido' } } })
    if (!rol?.activo || rol.clave === ROL_SUPERADMIN) throw createError({ statusCode: 400, message: 'Rol no válido', data: { campos: { rolId: 'No válido' } } })
    const conAlcance = rol.permisos.some(p => p.alcance === 'ORGANIZACION' && esPermiso(p.permiso) && (CATALOGO_PERMISOS[p.permiso].alcances as readonly string[]).includes('ORGANIZACION'))
    if (!conAlcance) {
      throw createError({ statusCode: 400, message: `El rol “${rol.nombre}” no tiene permisos con alcance de organización`, data: { campos: { rolId: 'Sin alcance de organización' } } })
    }
    try {
      const a = await tx.usuarioRol.create({ data: { usuarioId, rolId, organizacionId, asignadoPorId: ctx.usuarioId ?? null } })
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'UsuarioRol', entidadId: a.id, despues: { usuarioId, rolId, organizacionId } })
    }
    catch (e) {
      if ((e as { code?: string }).code === 'P2002') throw createError({ statusCode: 409, message: 'Ya tiene ese rol en esta organización' })
      throw e
    }
    await notificar(tx, usuarioId, {
      tipo: 'CUENTA',
      titulo: `Nuevo rol: ${rol.nombre}`,
      cuerpo: `En ${o.nombre}.`,
      enlace: `/plataforma/organizaciones/${organizacionId}`,
    })
  })
  invalidarPermisos(usuarioId)
}

export async function quitarRepresentante(organizacionId: string, asignacionId: string, ctx: ContextoAuditoria) {
  const usuarioId = await prisma.$transaction(async (tx) => {
    const a = await tx.usuarioRol.findUnique({ where: { id: asignacionId } })
    if (!a || a.organizacionId !== organizacionId) throw createError({ statusCode: 404, message: 'Asignación no encontrada' })
    await tx.usuarioRol.delete({ where: { id: asignacionId } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'UsuarioRol', entidadId: asignacionId, antes: a })
    return a.usuarioId
  })
  invalidarPermisos(usuarioId)
}

// --- Estadísticas ----------------------------------------------------------------

export async function estadisticasOrganizacion(id: string) {
  const [porEstado, porEspecialidad, altas] = await Promise.all([
    prisma.membresia.groupBy({ by: ['estado'], where: { organizacionId: id }, _count: true }),
    prisma.$queryRaw<{ especialidad: string | null, total: bigint }[]>`
      SELECT e."nombre" AS especialidad, count(*) AS total
      FROM "Membresia" m
      LEFT JOIN "PerfilProfesional" p ON p."usuarioId" = m."usuarioId"
      LEFT JOIN "Especialidad" e ON e."id" = p."especialidadId"
      WHERE m."organizacionId" = ${id}::uuid AND m."estado" = 'ACTIVA'
      GROUP BY e."nombre" ORDER BY total DESC`,
    prisma.$queryRaw<{ mes: string, total: bigint }[]>`
      SELECT to_char(date_trunc('month', m."desde"), 'YYYY-MM') AS mes, count(*) AS total
      FROM "Membresia" m
      WHERE m."organizacionId" = ${id}::uuid AND m."desde" >= (current_date - interval '11 months')
      GROUP BY 1 ORDER BY 1`,
  ])
  const conteo = Object.fromEntries(porEstado.map(p => [p.estado, p._count])) as Partial<Record<string, number>>
  return {
    activos: conteo.ACTIVA ?? 0,
    solicitudes: conteo.SOLICITADA ?? 0,
    bajas: conteo.BAJA ?? 0,
    porEspecialidad: porEspecialidad.map(r => ({ especialidad: r.especialidad ?? 'Sin especialidad registrada', total: Number(r.total) })),
    altasPorMes: altas.map(r => ({ mes: r.mes, total: Number(r.total) })),
  }
}

// --- Directorio público -------------------------------------------------------------

const PUBLICA: Prisma.OrganizacionWhereInput = { publica: true, estadoAfiliacion: 'AFILIADA' }

export async function directorioPublico() {
  const filas = await prisma.organizacion.findMany({
    where: PUBLICA,
    orderBy: { nombre: 'asc' },
    select: { slug: true, tipo: true, nombre: true, siglas: true, municipio: true, logoId: true, descripcion: true },
  })
  return filas.map(o => ({ ...o, descripcion: o.descripcion?.slice(0, 240) ?? null }))
}

/** Ficha pública: datos de contacto institucionales y profesionales que autorizaron publicarse. */
export async function fichaPublica(slug: string) {
  const o = await prisma.organizacion.findFirst({
    where: { slug, ...PUBLICA },
    select: {
      id: true, slug: true, tipo: true, nombre: true, siglas: true, descripcion: true, fechaConstitucion: true,
      municipio: true, direccion: true, telefono: true, email: true, sitioWeb: true, logoId: true,
    },
  })
  if (!o) throw createError({ statusCode: 404, message: 'Organización no encontrada' })
  const [integrantes, profesionales] = await Promise.all([
    prisma.membresia.count({ where: { organizacionId: o.id, estado: 'ACTIVA' } }),
    prisma.membresia.findMany({
      where: { organizacionId: o.id, estado: 'ACTIVA', usuario: { activo: true, perfil: { publicarDirectorio: true } } },
      orderBy: [{ usuario: { apellidoPaterno: 'asc' } }],
      select: {
        usuario: {
          select: {
            nombre: true, apellidoPaterno: true, apellidoMaterno: true,
            perfil: { select: { fotoId: true, especialidad: { select: { nombre: true } }, subespecialidad: { select: { nombre: true } } } },
          },
        },
      },
    }),
  ])
  const { id: _id, ...publica } = o
  return {
    ...publica,
    mesaDirectiva: await estructuraPublica(o.id, ['MESA_DIRECTIVA']),
    integrantes,
    profesionales: profesionales.map(({ usuario: u }) => ({
      nombre: [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' '),
      especialidad: u.perfil?.especialidad?.nombre ?? null,
      subespecialidad: u.perfil?.subespecialidad?.nombre ?? null,
      fotoId: u.perfil?.fotoId ?? null,
    })),
  }
}
