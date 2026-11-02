// Censo médico estatal: estadísticas de los profesionales registrados.
//
//   registrados – profesionales con cuenta activa y cédula capturada;
//   afiliados   – registrados con al menos una membresía activa en una organización;
//   validados   – registrados cuya información validó la Federación;
//   pendientes  – registrados con su información pendiente de validación.
//
// Las cifras públicas son agregadas: los grupos con menos de UMBRAL_PUBLICO personas se
// suman en «Otros», para que nadie sea identificable, y no incluyen instituciones de trabajo.
import type { z } from 'zod'
import type { Prisma } from '../generated/prisma/client'
import type { censoQuery } from '../../shared/schemas/censo'
import { ZONA_HORARIA } from '../../shared/texto'
import { prisma } from '../utils/prisma'
import type { Ambito } from './permisos'

export const UMBRAL_PUBLICO = 3
type Query = z.output<typeof censoQuery>

export interface Barra { etiqueta: string, valor: number }

function contar(claves: (string | null)[], nombre: (k: string | null) => string): Barra[] {
  const m = new Map<string, number>()
  for (const k of claves) {
    const e = nombre(k)
    m.set(e, (m.get(e) ?? 0) + 1)
  }
  return [...m.entries()].map(([etiqueta, valor]) => ({ etiqueta, valor })).sort((a, b) => b.valor - a.valor || a.etiqueta.localeCompare(b.etiqueta, 'es'))
}

/** Deja los primeros `n` y suma el resto en «Otros». */
function recortar(barras: Barra[], n: number, otros = 'Otros'): Barra[] {
  if (barras.length <= n) return barras
  const resto = barras.slice(n).reduce((s, b) => s + b.valor, 0)
  return [...barras.slice(0, n), { etiqueta: otros, valor: resto }]
}

/** Grupos pequeños a «Otros» (estadística pública). */
function suprimir(barras: Barra[]): Barra[] {
  const grandes = barras.filter(b => b.valor >= UMBRAL_PUBLICO)
  const chicos = barras.filter(b => b.valor < UMBRAL_PUBLICO).reduce((s, b) => s + b.valor, 0)
  return chicos ? [...grandes, { etiqueta: `Otros (grupos de menos de ${UMBRAL_PUBLICO})`, valor: chicos }] : grandes
}

const mesLocal = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA, year: 'numeric', month: '2-digit' }).format(d)

export async function estadisticasCenso(q: Query, ambito: Ambito | 'publico') {
  const publico = ambito === 'publico'
  const orgs = publico || ambito.todas ? null : ambito.ids
  const where: Prisma.PerfilProfesionalWhereInput = {
    cedulaProfesional: { not: null },
    usuario: {
      activo: true,
      AND: [
        ...(orgs ? [{ membresias: { some: { organizacionId: { in: orgs }, estado: { in: ['SOLICITADA', 'ACTIVA'] as ('SOLICITADA' | 'ACTIVA')[] } } } }] : []),
        ...(q.organizacionId && !publico ? [{ membresias: { some: { organizacionId: q.organizacionId, estado: 'ACTIVA' as const } } }] : []),
      ],
    },
    ...(q.especialidadId ? { especialidadId: q.especialidadId } : {}),
    ...(q.regionId ? { municipio: { regionId: q.regionId } } : {}),
  }
  const [filas, especialidades, municipios, organizaciones] = await Promise.all([
    prisma.perfilProfesional.findMany({
      where,
      select: {
        estadoValidacion: true, especialidadId: true, subespecialidadId: true, municipioId: true, mostrarInstitucion: true, institucionTrabajo: true,
        usuario: { select: { creadoEn: true, membresias: { where: { estado: 'ACTIVA' }, select: { organizacionId: true } } } },
      },
    }),
    prisma.especialidad.findMany({ select: { id: true, nombre: true } }),
    prisma.municipio.findMany({ select: { id: true, nombre: true, region: { select: { id: true, nombre: true, numero: true } } } }),
    prisma.organizacion.findMany({
      where: orgs ? { id: { in: orgs } } : publico ? { publica: true } : {},
      select: { id: true, nombre: true, siglas: true, estadoAfiliacion: true, tipo: true },
    }),
  ])

  const segmento = filas.filter(f => {
    switch (q.segmento) {
      case 'afiliados': return f.usuario.membresias.length > 0
      case 'validados': return f.estadoValidacion === 'VALIDADO'
      case 'pendientes': return f.estadoValidacion === 'PENDIENTE'
      default: return true
    }
  })

  const nEsp = new Map(especialidades.map(e => [e.id, e.nombre]))
  const nMun = new Map(municipios.map(m => [m.id, m]))
  const nOrg = new Map(organizaciones.map(o => [o.id, o.siglas || o.nombre]))

  const porEspecialidad = contar(segmento.map(f => f.especialidadId), k => (k ? nEsp.get(k) ?? 'Otra' : 'Sin especialidad registrada'))
  const porSubespecialidad = contar(segmento.filter(f => f.subespecialidadId).map(f => f.subespecialidadId), k => nEsp.get(k!) ?? 'Otra')
  const porRegion = contar(segmento.map(f => (f.municipioId ? nMun.get(f.municipioId)?.region.nombre ?? null : null)), k => k ?? 'Sin municipio registrado')
  const porMunicipio = contar(segmento.map(f => f.municipioId), k => (k ? nMun.get(k)?.nombre ?? 'Otro' : 'Sin municipio registrado'))
  const porOrganizacion = contar(segmento.flatMap(f => f.usuario.membresias.map(m => m.organizacionId)).filter(id => nOrg.has(id)), k => nOrg.get(k!)!)
  const porInstitucion = publico
    ? []
    : contar(segmento.filter(f => f.mostrarInstitucion && f.institucionTrabajo).map(f => f.institucionTrabajo!.trim()), k => k!)

  // Registros de los últimos 12 meses (por fecha de alta de la cuenta) y acumulado.
  const hoy = new Date()
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 11 + i, 15))
    return d.toISOString().slice(0, 7)
  })
  const antes = segmento.filter(f => mesLocal(f.usuario.creadoEn) < meses[0]!).length
  let acumulado = antes
  const evolucion = meses.map((mes) => {
    const nuevos = segmento.filter(f => mesLocal(f.usuario.creadoEn) === mes).length
    acumulado += nuevos
    return { mes, nuevos, acumulado }
  })

  const ajustar = (b: Barra[], n: number) => (publico ? suprimir(recortar(b, n)) : recortar(b, n))
  return {
    totales: {
      registrados: filas.length,
      afiliados: filas.filter(f => f.usuario.membresias.length > 0).length,
      validados: filas.filter(f => f.estadoValidacion === 'VALIDADO').length,
      pendientes: filas.filter(f => f.estadoValidacion === 'PENDIENTE').length,
      organizaciones: organizaciones.length,
      organizacionesAfiliadas: organizaciones.filter(o => o.estadoAfiliacion === 'AFILIADA').length,
      municipios: new Set(filas.map(f => f.municipioId).filter(Boolean)).size,
      especialidades: new Set(filas.map(f => f.especialidadId).filter(Boolean)).size,
    },
    segmento: q.segmento,
    total: segmento.length,
    porEspecialidad: ajustar(porEspecialidad, 15),
    porSubespecialidad: ajustar(porSubespecialidad, 10),
    porRegion: publico ? suprimir(porRegion) : porRegion,
    porMunicipio: ajustar(porMunicipio, 15),
    porOrganizacion: ajustar(porOrganizacion, 15),
    porInstitucion: recortar(porInstitucion, 10),
    evolucion,
  }
}
export type CensoDto = Awaited<ReturnType<typeof estadisticasCenso>>
