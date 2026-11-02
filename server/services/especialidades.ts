import { createError } from 'h3'
import type { z } from 'zod'
import type { especialidadSchema } from '../../shared/schemas/perfil'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma } from '../utils/prisma'
import { slugDe } from './organizaciones'

type Datos = z.output<typeof especialidadSchema>

/** Catálogo en árbol: especialidades con sus subespecialidades. */
export async function listarEspecialidades(opts: { incluirInactivas?: boolean } = {}) {
  const filas = await prisma.especialidad.findMany({
    where: opts.incluirInactivas ? {} : { activo: true },
    orderBy: { nombre: 'asc' },
    select: {
      id: true,
      nombre: true,
      padreId: true,
      activo: true,
      _count: { select: { perfiles: true, perfilesSub: true } },
    },
  })
  const nodo = (f: typeof filas[number]) => ({ id: f.id, nombre: f.nombre, activo: f.activo, perfiles: f._count.perfiles + f._count.perfilesSub })
  return filas
    .filter(f => !f.padreId)
    .map(p => ({ ...nodo(p), subespecialidades: filas.filter(s => s.padreId === p.id).map(nodo) }))
}
export type EspecialidadDto = Awaited<ReturnType<typeof listarEspecialidades>>[number]

async function validarPadre(padreId: string | null, id?: string) {
  if (!padreId) return
  if (padreId === id) throw createError({ statusCode: 400, message: 'No puede ser subespecialidad de sí misma' })
  const padre = await prisma.especialidad.findUnique({ where: { id: padreId }, select: { padreId: true } })
  if (!padre || padre.padreId) {
    throw createError({ statusCode: 400, message: 'La especialidad principal no es válida', data: { campos: { padreId: 'No válida' } } })
  }
  if (id && await prisma.especialidad.count({ where: { padreId: id } })) {
    throw createError({ statusCode: 400, message: 'Tiene subespecialidades: no puede convertirse en subespecialidad' })
  }
}

function duplicada(e: unknown): never {
  if ((e as { code?: string }).code === 'P2002') {
    throw createError({ statusCode: 409, message: 'Ya existe con ese nombre', data: { campos: { nombre: 'Ya existe' } } })
  }
  throw e
}

export async function crearEspecialidad(d: Datos, ctx: ContextoAuditoria) {
  await validarPadre(d.padreId)
  try {
    return await prisma.$transaction(async (tx) => {
      const e = await tx.especialidad.create({ data: d })
      // Cada especialidad principal tiene su comunidad.
      if (!d.padreId) await tx.grupo.create({ data: { tipo: 'ESPECIALIDAD', especialidadId: e.id, privacidad: 'MIEMBROS', nombre: d.nombre, slug: `esp-${slugDe(d.nombre)}-${e.id.slice(-4)}` } })
      await auditar(tx, ctx, { accion: 'CREAR', entidad: 'Especialidad', entidadId: e.id, despues: d })
      return e
    })
  }
  catch (e) {
    duplicada(e)
  }
}

/** No se borran (hay perfiles que las usan): se desactivan y dejan de ofrecerse. */
export async function actualizarEspecialidad(id: string, d: Datos, ctx: ContextoAuditoria) {
  await validarPadre(d.padreId, id)
  try {
    return await prisma.$transaction(async (tx) => {
      const antes = await tx.especialidad.findUnique({ where: { id } })
      if (!antes) throw createError({ statusCode: 404, message: 'No encontrada' })
      const e = await tx.especialidad.update({ where: { id }, data: d })
      await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Especialidad', entidadId: id, antes, despues: e })
      return e
    })
  }
  catch (e) {
    duplicada(e)
  }
}
