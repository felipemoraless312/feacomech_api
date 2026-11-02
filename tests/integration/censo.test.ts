import { describe, expect, it } from 'vitest'
import { estadisticasCenso, UMBRAL_PUBLICO } from '../../server/services/censo'
import { crearOrganizacion } from '../../server/services/organizaciones'
import { generarReporte } from '../../server/services/reportes'
import { prisma } from '../../server/utils/prisma'
import { organizacionCrearSchema } from '../../shared/schemas/organizacion'
import { crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

async function region() {
  return prisma.region.create({ data: { numero: 1000 + Math.floor(Math.random() * 1_000_000), nombre: `Región ${unico()}` } })
}

async function profesional(municipioId: string | null, extra: { organizacionId?: string, validado?: boolean } = {}) {
  const u = await crearUsuarioPrueba()
  await prisma.perfilProfesional.create({
    data: { usuarioId: u.id, cedulaProfesional: unico(), municipioId, estadoValidacion: extra.validado ? 'VALIDADO' : 'PENDIENTE' },
  })
  if (extra.organizacionId) await prisma.membresia.create({ data: { usuarioId: u.id, organizacionId: extra.organizacionId, estado: 'ACTIVA', desde: new Date() } })
  return u
}

describe('censo médico', () => {
  it('la estadística pública suma en «Otros» los grupos pequeños', async () => {
    const r = await region()
    const grande = await prisma.municipio.create({ data: { nombre: `Municipio grande ${unico()}`, regionId: r.id } })
    const chico = await prisma.municipio.create({ data: { nombre: `Municipio chico ${unico()}`, regionId: r.id } })
    for (let i = 0; i < UMBRAL_PUBLICO + 1; i++) await profesional(grande.id)
    for (let i = 0; i < UMBRAL_PUBLICO - 1; i++) await profesional(chico.id)

    const publico = await estadisticasCenso({ segmento: 'registrados', regionId: r.id }, 'publico')
    expect(publico.porMunicipio).toContainEqual({ etiqueta: grande.nombre, valor: UMBRAL_PUBLICO + 1 })
    expect(publico.porMunicipio.map(b => b.etiqueta)).not.toContain(chico.nombre)
    expect(publico.porMunicipio.find(b => b.etiqueta.startsWith('Otros'))?.valor).toBe(UMBRAL_PUBLICO - 1)
    expect(publico.porInstitucion).toEqual([])

    // Con permiso, el detalle sí aparece.
    const interno = await estadisticasCenso({ segmento: 'registrados', regionId: r.id }, { todas: true })
    expect(interno.porMunicipio).toContainEqual({ etiqueta: chico.nombre, valor: UMBRAL_PUBLICO - 1 })
    expect(interno.porRegion).toEqual([{ etiqueta: r.nombre, valor: 2 * UMBRAL_PUBLICO }])
  })

  it('con alcance por organización sólo cuenta a sus miembros, y distingue segmentos', async () => {
    const [o1, o2] = await Promise.all([1, 2].map(() => crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Censo ${unico()}` }), ctxPrueba)))
    await profesional(null, { organizacionId: o1!.id, validado: true })
    await profesional(null, { organizacionId: o1!.id })
    await profesional(null, { organizacionId: o2!.id })

    const c = await estadisticasCenso({ segmento: 'registrados' }, { todas: false, ids: [o1!.id] })
    expect(c.totales).toMatchObject({ registrados: 2, afiliados: 2, validados: 1, pendientes: 1, organizaciones: 1 })
    expect((await estadisticasCenso({ segmento: 'validados' }, { todas: false, ids: [o1!.id] })).total).toBe(1)
    // Pedir otra organización fuera de su alcance no amplía lo que ve.
    expect((await estadisticasCenso({ segmento: 'registrados', organizacionId: o2!.id }, { todas: false, ids: [o1!.id] })).total).toBe(0)
  })

  it('los reportes respetan el alcance y neutralizan fórmulas', async () => {
    const [o1, o2] = await Promise.all([1, 2].map(() => crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Reporte ${unico()}` }), ctxPrueba)))
    const propio = await profesional(null, { organizacionId: o1!.id })
    await prisma.usuario.update({ where: { id: propio.id }, data: { nombre: '=HIPERVINCULO("x")' } })
    const ajeno = await profesional(null, { organizacionId: o2!.id })

    const csv = await generarReporte('profesionales', {}, { todas: false, ids: [o1!.id] })
    expect(csv.startsWith('﻿"Nombre"')).toBe(true)
    expect(csv).toContain(propio.email)
    expect(csv).not.toContain(ajeno.email)
    expect(csv).toContain('"\'=HIPERVINCULO(""x"")')

    const orgs = await generarReporte('organizaciones', {}, { todas: false, ids: [o1!.id] })
    expect(orgs).toContain(o1!.nombre)
    expect(orgs).not.toContain(o2!.nombre)
  })
})
