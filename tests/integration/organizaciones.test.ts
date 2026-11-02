import { describe, expect, it } from 'vitest'
import { darDeBaja, resolverMembresia, solicitarAfiliacionPropia, solicitarAlta, solicitarBaja, misMembresias } from '../../server/services/membresias'
import {
  asignarRepresentante, cambiarEstadoAfiliacion, crearOrganizacion, fichaPublica, proponerCambio, quitarRepresentante, resolverCambio, slugDe,
} from '../../server/services/organizaciones'
import { accesoDeUsuario, ambitoDe, exigirEnOrganizacion } from '../../server/services/permisos'
import { listarProfesionales } from '../../server/services/profesionales'
import { listarUsuarios } from '../../server/services/usuarios'
import { prisma } from '../../server/utils/prisma'
import { datosOrganizacionSchema, organizacionCrearSchema } from '../../shared/schemas/organizacion'
import { crearRolPrueba, crearUsuarioPrueba, ctxPrueba, rolSuperadmin, unico } from './helpers'

const ctx = ctxPrueba

function rolAfiliado() {
  return prisma.rol.upsert({
    where: { clave: 'MEDICO_AFILIADO' },
    update: { activo: true },
    create: { clave: 'MEDICO_AFILIADO', nombre: 'Médico afiliado', sistema: true, permisos: { create: [{ permiso: 'comunidad.participar', alcance: 'TOTAL' }] } },
  })
}

async function organizacion(extra: Record<string, unknown> = {}) {
  return (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio de Prueba ${unico()}`, municipio: 'Tuxtla Gutiérrez', ...extra }), ctx))!
}

const rolRepresentante = () => crearRolPrueba({ 'organizacion.ver': 'ORGANIZACION', 'afiliacion.solicitar': 'ORGANIZACION', 'censo.ver': 'TOTAL' })

const alta = (extra: Record<string, unknown> = {}) => ({
  email: `medico.${unico()}@feacomech.test`,
  nombre: 'Laura',
  apellidoPaterno: 'Gómez',
  apellidoMaterno: null,
  cedulaProfesional: '1234567',
  especialidadId: null,
  numeroSocio: null,
  comentario: null,
  ...extra,
})

describe('alcance por organización', () => {
  it('un rol ligado a una organización sólo da permisos sobre ella', async () => {
    const [a, b] = [await organizacion(), await organizacion()]
    const rol = await rolRepresentante()
    const u = await crearUsuarioPrueba()
    await asignarRepresentante(a.id, u.id, rol.id, ctx)

    const acceso = await accesoDeUsuario(u.id)
    expect(acceso.permisos).toMatchObject({ 'organizacion.ver': 'ORGANIZACION', 'censo.ver': 'TOTAL' })
    expect(acceso.organizaciones['organizacion.ver']).toEqual([a.id])
    expect(await ambitoDe(u.id, 'afiliacion.solicitar')).toEqual({ todas: false, ids: [a.id] })
    await expect(exigirEnOrganizacion(u.id, 'organizacion.ver', a.id)).resolves.toBeTruthy()
    await expect(exigirEnOrganizacion(u.id, 'organizacion.ver', b.id)).rejects.toMatchObject({ statusCode: 403 })
  })

  it('el mismo rol sin organización no da permisos de ese alcance', async () => {
    const rol = await rolRepresentante()
    const u = await crearUsuarioPrueba({ rolIds: [rol.id] })
    expect((await accesoDeUsuario(u.id)).permisos).toEqual({ 'censo.ver': 'TOTAL' })
  })

  it('valida los roles que se ligan a organizaciones y al quitar el rol se pierde el acceso', async () => {
    const o = await organizacion()
    const u = await crearUsuarioPrueba()
    const sinAlcance = await crearRolPrueba({ 'censo.ver': 'TOTAL' })
    await expect(asignarRepresentante(o.id, u.id, sinAlcance.id, ctx)).rejects.toMatchObject({ statusCode: 400 })
    await expect(asignarRepresentante(o.id, u.id, (await rolSuperadmin()).id, ctx)).rejects.toMatchObject({ statusCode: 400 })

    const rol = await rolRepresentante()
    await asignarRepresentante(o.id, u.id, rol.id, ctx)
    await expect(asignarRepresentante(o.id, u.id, rol.id, ctx)).rejects.toMatchObject({ statusCode: 409 })
    const asignacion = await prisma.usuarioRol.findFirstOrThrow({ where: { usuarioId: u.id, organizacionId: o.id } })
    await quitarRepresentante(o.id, asignacion.id, ctx)
    expect(await ambitoDe(u.id, 'organizacion.ver')).toBeNull()
  })

  it('con alcance de organización sólo lista a sus integrantes', async () => {
    const [a, b] = [await organizacion(), await organizacion()]
    const deA = await solicitarAlta(a.id, alta(), ctx)
    const deB = await solicitarAlta(b.id, alta(), ctx)
    const r = await listarUsuarios({ pagina: 1, porPagina: 100 }, { todas: false, ids: [a.id] })
    const ids = r.datos.map(u => u.id)
    expect(ids).toContain(deA.usuarioId)
    expect(ids).not.toContain(deB.usuarioId)

    const p = await listarProfesionales({ pagina: 1, porPagina: 100 }, { todas: false, ids: [a.id] })
    expect(p.datos.map(u => u.id)).toEqual([deA.usuarioId])
    // Pedir otra organización fuera de su ámbito no amplía lo visible
    expect((await listarProfesionales({ organizacionId: b.id, pagina: 1, porPagina: 100 }, { todas: false, ids: [a.id] })).total).toBe(0)
  })
})

describe('organizaciones', () => {
  it('se registra con su primer periodo de afiliación y un slug único', async () => {
    const nombre = `Colegio Médico de Prueba ${unico()}`
    const o = (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre, estadoAfiliacion: 'AFILIADA', afiliadaDesde: '2020-01-15' }), ctx))!
    expect(o.slug).toBe(slugDe(nombre))
    expect(await prisma.afiliacionOrganizacion.findMany({ where: { organizacionId: o.id } })).toMatchObject([{ estado: 'AFILIADA', hasta: null }])
    // Mismo nombre y tipo: rechazado (sin distinguir mayúsculas)
    await expect(crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: nombre.toUpperCase() }), ctx)).rejects.toMatchObject({ statusCode: 409 })
    // Mismo nombre como asociación: permitido, con otro slug
    const otra = (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'ASOCIACION', nombre }), ctx))!
    expect(otra.slug).not.toBe(o.slug)
  })

  it('cambiar el estado cierra el periodo vigente y conserva el historial', async () => {
    const o = await organizacion({ estadoAfiliacion: 'AFILIADA', afiliadaDesde: '2024-01-01' })
    await cambiarEstadoAfiliacion(o.id, { estado: 'SUSPENDIDA', desde: '2025-06-01', motivo: 'Acta 12' }, ctx)
    const periodos = await prisma.afiliacionOrganizacion.findMany({ where: { organizacionId: o.id }, orderBy: { desde: 'asc' } })
    expect(periodos.map(p => [p.estado, p.hasta?.toISOString().slice(0, 10) ?? null])).toEqual([['AFILIADA', '2025-06-01'], ['SUSPENDIDA', null]])
    expect((await prisma.organizacion.findUniqueOrThrow({ where: { id: o.id } })).estadoAfiliacion).toBe('SUSPENDIDA')
    await expect(cambiarEstadoAfiliacion(o.id, { estado: 'AFILIADA', desde: '2025-01-01', motivo: null }, ctx)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('los cambios del representante se aplican sólo al aprobarlos', async () => {
    const o = await organizacion()
    const rep = await crearUsuarioPrueba()
    const datos = datosOrganizacionSchema.parse({ nombre: o.nombre, telefono: '9611112233', sitioWeb: 'https://colegio.example' })
    await proponerCambio(o.id, datos, { ...ctx, usuarioId: rep.id })
    // Una segunda propuesta reemplaza la pendiente
    const s = await proponerCambio(o.id, { ...datos, telefono: '9619998877' }, { ...ctx, usuarioId: rep.id })
    expect(await prisma.solicitudCambio.count({ where: { organizacionId: o.id, estado: 'PENDIENTE' } })).toBe(1)
    expect((await prisma.organizacion.findUniqueOrThrow({ where: { id: o.id } })).telefono).toBeNull()

    await expect(resolverCambio(s.id, false, null, ctx)).rejects.toMatchObject({ statusCode: 400 })
    await resolverCambio(s.id, true, null, ctx)
    expect(await prisma.organizacion.findUniqueOrThrow({ where: { id: o.id } })).toMatchObject({ telefono: '9619998877', sitioWeb: 'https://colegio.example' })
    await expect(resolverCambio(s.id, true, null, ctx)).rejects.toMatchObject({ statusCode: 409 })
    expect(await prisma.notificacion.count({ where: { usuarioId: rep.id, titulo: { startsWith: 'Cambios aprobados' } } })).toBe(1)
  })
})

describe('integrantes', () => {
  it('alta: solicitud → validación → membresía activa, rol de afiliado e invitación', async () => {
    await rolAfiliado()
    const o = await organizacion()
    const m = await solicitarAlta(o.id, alta(), ctx)
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: m.usuarioId }, include: { roles: true, perfil: true } })
    expect(usuario.roles).toHaveLength(0)
    expect(usuario.perfil?.cedulaProfesional).toBe('1234567')
    expect((await accesoDeUsuario(m.usuarioId)).permisos).toEqual({})

    // Otra solicitud abierta para la misma organización: rechazada
    await expect(solicitarAfiliacionPropia(m.usuarioId, o.id, null, ctx)).rejects.toMatchObject({ statusCode: 409 })

    const { invitacion } = await resolverMembresia(m.id, { decision: 'APROBAR', numeroSocio: 'A-17', desde: '2026-10-01' }, ctx)
    expect(invitacion?.enviado).toBe(false) // sin SMTP en pruebas
    expect(await prisma.membresia.findUniqueOrThrow({ where: { id: m.id } })).toMatchObject({ estado: 'ACTIVA', numeroSocio: 'A-17' })
    expect((await accesoDeUsuario(m.usuarioId)).permisos).toEqual({ 'comunidad.participar': 'TOTAL' })
    await expect(resolverMembresia(m.id, { decision: 'APROBAR', numeroSocio: null, desde: null }, ctx)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('rechazo con motivo; después puede volver a solicitar', async () => {
    const o = await organizacion()
    const u = await crearUsuarioPrueba()
    const m = await solicitarAfiliacionPropia(u.id, o.id, 'Ingresé en 2019', ctx)
    await resolverMembresia(m.id, { decision: 'RECHAZAR', motivo: 'No acreditó su pertenencia' }, ctx)
    expect(await prisma.membresia.findUniqueOrThrow({ where: { id: m.id } })).toMatchObject({ estado: 'RECHAZADA', motivo: 'No acreditó su pertenencia' })
    await expect(solicitarAfiliacionPropia(u.id, o.id, null, ctx)).resolves.toMatchObject({ estado: 'SOLICITADA' })
    expect(await misMembresias(u.id)).toHaveLength(2)
  })

  it('baja: se solicita, la Federación la confirma y sin otra membresía activa pierde el rol de afiliado', async () => {
    await rolAfiliado()
    const [a, b] = [await organizacion(), await organizacion()]
    const ma = await solicitarAlta(a.id, alta(), ctx)
    await resolverMembresia(ma.id, { decision: 'APROBAR', numeroSocio: null, desde: '2026-01-10' }, ctx)
    const mb = await solicitarAfiliacionPropia(ma.usuarioId, b.id, null, ctx)
    await resolverMembresia(mb.id, { decision: 'APROBAR', numeroSocio: null, desde: null }, ctx)

    await solicitarBaja(ma.id, 'Cambio de residencia', ctx)
    await expect(solicitarBaja(ma.id, 'otra vez', ctx)).rejects.toMatchObject({ statusCode: 409 })
    await expect(darDeBaja(ma.id, { motivo: 'Cambio de residencia', hasta: '2025-12-31' }, ctx)).rejects.toMatchObject({ statusCode: 400 })
    await darDeBaja(ma.id, { motivo: 'Cambio de residencia', hasta: null }, ctx)
    // Sigue activo en b: conserva el rol
    expect((await accesoDeUsuario(ma.usuarioId)).roles.map(r => r.clave)).toContain('MEDICO_AFILIADO')

    await darDeBaja(mb.id, { motivo: 'Retiro', hasta: null }, ctx)
    expect((await accesoDeUsuario(ma.usuarioId)).roles.map(r => r.clave)).not.toContain('MEDICO_AFILIADO')
    expect((await misMembresias(ma.usuarioId)).map(m => m.estado)).toEqual(['BAJA', 'BAJA'])
  })

  it('no se aceptan solicitudes en organizaciones dadas de baja', async () => {
    const o = await organizacion({ estadoAfiliacion: 'BAJA' })
    await expect(solicitarAlta(o.id, alta(), ctx)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('la base impide dos membresías abiertas para la misma persona y organización', async () => {
    const o = await organizacion()
    const u = await crearUsuarioPrueba()
    await prisma.membresia.create({ data: { usuarioId: u.id, organizacionId: o.id } })
    await expect(prisma.membresia.create({ data: { usuarioId: u.id, organizacionId: o.id } })).rejects.toThrow()
    // Activa sin fecha de alta: rechazada por la regla de fechas
    await expect(prisma.membresia.create({ data: { usuarioId: (await crearUsuarioPrueba()).id, organizacionId: o.id, estado: 'ACTIVA' } })).rejects.toThrow(/Membresia_fechas/)
  })
})

describe('directorio público', () => {
  it('sólo publica organizaciones afiliadas y visibles, y sólo a profesionales que lo autorizaron', async () => {
    await rolAfiliado()
    const o = await organizacion({ estadoAfiliacion: 'AFILIADA', descripcion: 'Colegio de prueba' })
    const oculta = await organizacion({ estadoAfiliacion: 'AFILIADA', publica: false })
    const tramite = await organizacion()

    const conPermiso = await solicitarAlta(o.id, alta({ nombre: 'Publicable' }), ctx)
    const sinPermiso = await solicitarAlta(o.id, alta({ nombre: 'Reservado' }), ctx)
    for (const m of [conPermiso, sinPermiso]) await resolverMembresia(m.id, { decision: 'APROBAR', numeroSocio: null, desde: null }, ctx)
    await prisma.perfilProfesional.update({ where: { usuarioId: conPermiso.usuarioId }, data: { publicarDirectorio: true, consentimientoEn: new Date() } })

    const ficha = await fichaPublica(o.slug)
    expect(ficha.integrantes).toBe(2)
    expect(ficha.profesionales.map(p => p.nombre)).toEqual(['Publicable Gómez'])
    // Nunca datos personales: ni correo ni cédula ni ids internos
    const json = JSON.stringify(ficha)
    expect(json).not.toMatch(/@feacomech\.test|1234567/)
    expect(ficha).not.toHaveProperty('id')

    await expect(fichaPublica(oculta.slug)).rejects.toMatchObject({ statusCode: 404 })
    await expect(fichaPublica(tramite.slug)).rejects.toMatchObject({ statusCode: 404 })
  })
})
