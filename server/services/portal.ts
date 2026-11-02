// Vinculación institucional y mensajes del formulario de contacto.
import { createError } from 'h3'
import type { z } from 'zod'
import type { atenderMensajeSchema, contactoSchema, mensajesQuery, vinculoSchema } from '../../shared/schemas/portal'
import { aFecha } from '../../shared/schemas/organizacion'
import { IMAGENES, borrarDeDisco, guardarArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma } from '../utils/prisma'
import { notificar } from './notificaciones'
import { usuariosConPermisoTotal } from './permisos'

export const MAX_LOGO_VINCULO = 2 * 1024 * 1024
type Vinculo = z.output<typeof vinculoSchema>

const datosVinculo = (d: Vinculo) => ({
  ...d,
  fechaFirma: d.fechaFirma ? aFecha(d.fechaFirma) : null,
  vigenciaHasta: d.vigenciaHasta ? aFecha(d.vigenciaHasta) : null,
})

export function listarVinculos() {
  return prisma.vinculo.findMany({ orderBy: [{ tipo: 'asc' }, { orden: 'asc' }, { nombre: 'asc' }] })
}
export type VinculoDto = Awaited<ReturnType<typeof listarVinculos>>[number]

export async function guardarVinculo(id: string | null, d: Vinculo, ctx: ContextoAuditoria) {
  return prisma.$transaction(async (tx) => {
    if (id) {
      const antes = await tx.vinculo.findUnique({ where: { id } })
      if (!antes) throw createError({ statusCode: 404, message: 'No encontrado' })
      const v = await tx.vinculo.update({ where: { id }, data: datosVinculo(d) })
      if (v.logoId) await tx.archivo.update({ where: { id: v.logoId }, data: { visibilidad: d.publicado ? 'PUBLICO' : 'AUTENTICADO' } })
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Vinculo', entidadId: id, antes, despues: v })
      return v
    }
    const v = await tx.vinculo.create({ data: datosVinculo(d) })
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Vinculo', entidadId: v.id, despues: v })
    return v
  })
}

export async function eliminarVinculo(id: string, ctx: ContextoAuditoria) {
  const ruta = await prisma.$transaction(async (tx) => {
    const v = await tx.vinculo.findUnique({ where: { id }, include: { logo: { select: { id: true, ruta: true } } } })
    if (!v) throw createError({ statusCode: 404, message: 'No encontrado' })
    await tx.vinculo.delete({ where: { id } })
    if (v.logo) await tx.archivo.delete({ where: { id: v.logo.id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'Vinculo', entidadId: id, antes: v })
    return v.logo?.ruta
  })
  if (ruta) await borrarDeDisco(ruta)
}

export async function guardarLogoVinculo(id: string, datos: Buffer, nombre: string, ctx: ContextoAuditoria) {
  const rutaAnterior = await prisma.$transaction(async (tx) => {
    const v = await tx.vinculo.findUnique({ where: { id }, include: { logo: { select: { id: true, ruta: true } } } })
    if (!v) throw createError({ statusCode: 404, message: 'No encontrado' })
    const archivo = await guardarArchivo(tx, { datos, nombreOriginal: nombre, permitidos: IMAGENES, maxBytes: MAX_LOGO_VINCULO, visibilidad: v.publicado ? 'PUBLICO' : 'AUTENTICADO', subidoPorId: ctx.usuarioId ?? null })
    await tx.vinculo.update({ where: { id }, data: { logoId: archivo.id } })
    if (v.logo) await tx.archivo.delete({ where: { id: v.logo.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Vinculo.logo', entidadId: id })
    return v.logo?.ruta
  })
  if (rutaAnterior) await borrarDeDisco(rutaAnterior)
}

export function vinculosPublicos() {
  return prisma.vinculo.findMany({
    where: { publicado: true },
    orderBy: [{ tipo: 'asc' }, { orden: 'asc' }, { nombre: 'asc' }],
    select: { tipo: true, nombre: true, descripcion: true, sitioWeb: true, logoId: true, fechaFirma: true, vigenciaHasta: true },
  })
}

// --- Contacto -------------------------------------------------------------------------

/** Guarda el mensaje y avisa a quienes atienden el contacto. El campo trampa ya lo validó el esquema. */
export async function recibirMensaje(d: z.output<typeof contactoSchema>, ip: string | null) {
  await prisma.$transaction(async (tx) => {
    const m = await tx.mensajeContacto.create({
      data: { nombre: d.nombre, email: d.email, telefono: d.telefono, asunto: d.asunto, mensaje: d.mensaje, ip },
    })
    for (const u of await usuariosConPermisoTotal(tx, 'contacto.ver')) {
      await notificar(tx, u.id, { tipo: 'CUENTA', titulo: 'Nuevo mensaje de contacto', cuerpo: `${d.nombre}: ${d.asunto}`, enlace: `/plataforma/mensajes?id=${m.id}` })
    }
  })
}

export async function listarMensajes(q: z.output<typeof mensajesQuery>) {
  const where = q.estado ? { estado: q.estado } : {}
  const [total, datos, nuevos] = await Promise.all([
    prisma.mensajeContacto.count({ where }),
    prisma.mensajeContacto.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      skip: (q.pagina - 1) * q.porPagina,
      take: q.porPagina,
      include: { atendidoPor: { select: { nombre: true, apellidoPaterno: true } } },
    }),
    prisma.mensajeContacto.count({ where: { estado: 'NUEVO' } }),
  ])
  return { total, pagina: q.pagina, porPagina: q.porPagina, nuevos, datos }
}
export type MensajeDto = Awaited<ReturnType<typeof listarMensajes>>['datos'][number]

export async function atenderMensaje(id: string, d: z.output<typeof atenderMensajeSchema>, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    const m = await tx.mensajeContacto.findUnique({ where: { id }, select: { estado: true } })
    if (!m) throw createError({ statusCode: 404, message: 'Mensaje no encontrado' })
    await tx.mensajeContacto.update({
      where: { id },
      data: { estado: d.estado, nota: d.nota, ...(d.estado !== 'NUEVO' ? { atendidoPorId: ctx.usuarioId ?? null, atendidoEn: new Date() } : { atendidoPorId: null, atendidoEn: null }) },
    })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'MensajeContacto', entidadId: id, antes: m, despues: d })
  })
}
