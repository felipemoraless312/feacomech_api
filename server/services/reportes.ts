// Reportes exportables (CSV). Respetan el ámbito del permiso reporte.ver:
// quien lo tiene por organización sólo exporta lo de sus organizaciones.
import type { z } from 'zod'
import type { reporteQuery, TIPOS_REPORTE } from '../../shared/schemas/censo'
// Inicio del día en Chiapas (UTC−6, sin horario de verano).
const aFecha = (iso: string) => new Date(`${iso}T00:00:00-06:00`)
import { aCsv } from '../utils/csv'
import { prisma } from '../utils/prisma'
import type { Ambito } from './permisos'

type Tipo = (typeof TIPOS_REPORTE)[number]
type Query = z.output<typeof reporteQuery>

const fecha = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '')
const nombre = (u: { nombre: string, apellidoPaterno: string, apellidoMaterno: string | null }) => [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ')

function rango(q: Query) {
  const r: { gte?: Date, lt?: Date } = {}
  if (q.desde) r.gte = aFecha(q.desde)
  if (q.hasta) r.lt = new Date(aFecha(q.hasta).getTime() + 86_400_000)
  return Object.keys(r).length ? r : undefined
}

export async function generarReporte(tipo: Tipo, q: Query, ambito: Ambito): Promise<string> {
  const orgs = ambito.todas ? undefined : { in: ambito.ids }
  const creado = rango(q)
  switch (tipo) {
    case 'profesionales': {
      const filas = await prisma.usuario.findMany({
        where: {
          activo: true,
          perfil: { isNot: null },
          ...(creado ? { creadoEn: creado } : {}),
          ...(orgs ? { membresias: { some: { organizacionId: orgs, estado: { in: ['SOLICITADA', 'ACTIVA'] } } } } : {}),
        },
        orderBy: [{ apellidoPaterno: 'asc' }, { nombre: 'asc' }],
        select: {
          nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true, creadoEn: true,
          perfil: { select: { cedulaProfesional: true, estadoValidacion: true, especialidad: { select: { nombre: true } }, subespecialidad: { select: { nombre: true } }, municipio: { select: { nombre: true, region: { select: { nombre: true } } } } } },
          membresias: { where: { estado: 'ACTIVA', ...(orgs ? { organizacionId: orgs } : {}) }, select: { organizacion: { select: { siglas: true, nombre: true } } } },
        },
      })
      return aCsv(
        ['Nombre', 'Correo', 'Cédula', 'Especialidad', 'Subespecialidad', 'Municipio', 'Región', 'Organizaciones', 'Validación', 'Alta'],
        filas.map(u => [nombre(u), u.email, u.perfil?.cedulaProfesional, u.perfil?.especialidad?.nombre, u.perfil?.subespecialidad?.nombre, u.perfil?.municipio?.nombre, u.perfil?.municipio?.region.nombre, u.membresias.map(m => m.organizacion.siglas || m.organizacion.nombre).join('; '), u.perfil?.estadoValidacion, fecha(u.creadoEn)]),
      )
    }
    case 'organizaciones': {
      const filas = await prisma.organizacion.findMany({
        where: { ...(orgs ? { id: orgs } : {}), ...(creado ? { creadoEn: creado } : {}) },
        orderBy: { nombre: 'asc' },
        select: { nombre: true, siglas: true, tipo: true, estadoAfiliacion: true, municipio: true, email: true, telefono: true, fechaConstitucion: true, _count: { select: { membresias: { where: { estado: 'ACTIVA' } } } } },
      })
      return aCsv(
        ['Nombre', 'Siglas', 'Tipo', 'Afiliación', 'Municipio', 'Correo', 'Teléfono', 'Constitución', 'Miembros activos'],
        filas.map(o => [o.nombre, o.siglas, o.tipo, o.estadoAfiliacion, o.municipio, o.email, o.telefono, fecha(o.fechaConstitucion), o._count.membresias]),
      )
    }
    case 'eventos': {
      const filas = await prisma.evento.findMany({
        where: { ...(orgs ? { organizacionId: orgs } : {}), ...(creado ? { inicio: creado } : {}) },
        orderBy: { inicio: 'desc' },
        select: {
          titulo: true, tipo: true, estado: true, modalidad: true, inicio: true, fin: true, sede: true, capacidad: true,
          organizacion: { select: { siglas: true, nombre: true } },
          inscripciones: { select: { estado: true, _count: { select: { asistencias: true } }, constancia: { select: { id: true } } } },
        },
      })
      return aCsv(
        ['Evento', 'Tipo', 'Estado', 'Modalidad', 'Inicio', 'Fin', 'Sede', 'Organiza', 'Capacidad', 'Confirmados', 'Con asistencia', 'Constancias'],
        filas.map(e => [e.titulo, e.tipo, e.estado, e.modalidad, fecha(e.inicio), fecha(e.fin), e.sede, e.organizacion ? e.organizacion.siglas || e.organizacion.nombre : 'FEACOMECH', e.capacidad,
          e.inscripciones.filter(i => i.estado === 'CONFIRMADA').length, e.inscripciones.filter(i => i._count.asistencias > 0).length, e.inscripciones.filter(i => i.constancia).length]),
      )
    }
    case 'afiliaciones': {
      const filas = await prisma.membresia.findMany({
        where: { ...(orgs ? { organizacionId: orgs } : {}), ...(creado ? { solicitadaEn: creado } : {}) },
        orderBy: { solicitadaEn: 'desc' },
        select: { estado: true, numeroSocio: true, solicitadaEn: true, resueltaEn: true, desde: true, hasta: true, usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, email: true } }, organizacion: { select: { nombre: true, siglas: true } } },
      })
      return aCsv(
        ['Profesional', 'Correo', 'Organización', 'Estado', 'Núm. socio', 'Solicitada', 'Resuelta', 'Desde', 'Hasta'],
        filas.map(m => [nombre(m.usuario), m.usuario.email, m.organizacion.siglas || m.organizacion.nombre, m.estado, m.numeroSocio, fecha(m.solicitadaEn), fecha(m.resueltaEn), fecha(m.desde), fecha(m.hasta)]),
      )
    }
  }
}
