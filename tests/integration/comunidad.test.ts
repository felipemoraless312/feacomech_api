import { describe, expect, it } from 'vitest'
import {
  adjuntar, comentar, leerAdjunto, listarPublicaciones, listarReportes, obtenerGrupo, obtenerPublicacion, publicar,
  reaccionar, reportar, resolverReporte, resolverSolicitudGrupo, unirse,
} from '../../server/services/comunidad'
import { crearOrganizacion } from '../../server/services/organizaciones'
import { prisma } from '../../server/utils/prisma'
import { comentarioSchema, publicacionSchema, datosIdentificables } from '../../shared/schemas/comunidad'
import { organizacionCrearSchema } from '../../shared/schemas/organizacion'
import { crearRolPrueba, crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

const ctx = ctxPrueba
const PNG = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63F8FFFF3F0005FE02FEA7D6A4E20000000049454E44AE426082', 'hex')
const texto = (contenido = 'Pregunta clínica sin datos de pacientes.') => publicacionSchema.parse({ contenido })

async function participante(extra: Record<string, 'TOTAL' | 'ORGANIZACION'> = {}) {
  const rol = await crearRolPrueba({ 'comunidad.participar': 'TOTAL', ...extra })
  return crearUsuarioPrueba({ rolIds: [rol.id] })
}

async function grupo(privacidad: 'ABIERTO' | 'MIEMBROS' | 'PRIVADO') {
  return prisma.grupo.create({ data: { tipo: 'DEBATE', nombre: `Grupo ${unico()}`, slug: `grupo-${unico()}`, privacidad } })
}

describe('acceso a grupos', () => {
  it('ABIERTO: participantes leen y publican; sin permiso de comunidad, no', async () => {
    const g = await grupo('ABIERTO')
    const p = await participante()
    const sinPermiso = await crearUsuarioPrueba()
    await publicar(p.id, g.id, texto(), ctx)
    await expect(obtenerGrupo(sinPermiso.id, g.slug)).rejects.toMatchObject({ statusCode: 404 })
    await expect(publicar(sinPermiso.id, g.id, texto(), ctx)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('MIEMBROS: todos leen; para publicar hay que unirse', async () => {
    const g = await grupo('MIEMBROS')
    const p = await participante()
    expect((await obtenerGrupo(p.id, g.slug)).acceso).toMatchObject({ ver: true, publicar: false })
    await expect(publicar(p.id, g.id, texto(), ctx)).rejects.toMatchObject({ statusCode: 403 })
    expect(await unirse(p.id, g.id)).toEqual({ estado: 'ACTIVO' })
    await expect(publicar(p.id, g.id, texto(), ctx)).resolves.toBeTruthy()
  })

  it('PRIVADO: la solicitud queda pendiente hasta que la moderación la aprueba; lo publicado no se ve fuera', async () => {
    const g = await grupo('PRIVADO')
    const moderador = await participante({ 'comunidad.moderar': 'TOTAL' })
    const p = await participante()
    const pub = await publicar(moderador.id, g.id, texto('Aviso para el grupo privado'), ctx)
    await expect(obtenerGrupo(p.id, g.slug)).rejects.toMatchObject({ statusCode: 404 })
    expect((await listarPublicaciones(p.id, { pagina: 1, porPagina: 100 })).datos.map(x => x.id)).not.toContain(pub.id)

    expect(await unirse(p.id, g.id)).toEqual({ estado: 'PENDIENTE' })
    await expect(obtenerPublicacion(p.id, pub.id)).rejects.toMatchObject({ statusCode: 404 })
    await resolverSolicitudGrupo(moderador.id, g.id, p.id, true, ctx)
    await expect(obtenerPublicacion(p.id, pub.id)).resolves.toMatchObject({ id: pub.id })
  })

  it('el grupo de una organización se crea con ella y sólo lo ven sus integrantes', async () => {
    const o = (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Comunidad ${unico()}` }), ctx))!
    const g = await prisma.grupo.findUniqueOrThrow({ where: { organizacionId: o.id } })
    expect(g).toMatchObject({ tipo: 'ORGANIZACION', privacidad: 'PRIVADO' })
    const integrante = await participante()
    const externo = await participante()
    await prisma.membresia.create({ data: { usuarioId: integrante.id, organizacionId: o.id, estado: 'ACTIVA', desde: new Date() } })
    await expect(publicar(integrante.id, g.id, texto(), ctx)).resolves.toBeTruthy()
    await expect(obtenerGrupo(externo.id, g.slug)).rejects.toMatchObject({ statusCode: 404 })
    await expect(unirse(externo.id, g.id)).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('publicaciones', () => {
  it('rechaza datos que identifican pacientes', () => {
    expect(datosIdentificables('Paciente con CURP GOMA800101HCSRRN09 ingresó')).toEqual(['una CURP'])
    expect(publicacionSchema.safeParse({ contenido: 'Expediente núm. 123456 con fiebre' }).success).toBe(false)
    expect(publicacionSchema.safeParse({ contenido: 'Revisión del tema de sepsis neonatal' }).success).toBe(true)
  })

  it('comentarios con respuestas y avisos; una reacción por persona', async () => {
    const g = await grupo('ABIERTO')
    const [autor, a, b] = [await participante(), await participante(), await participante()]
    const pub = await publicar(autor.id, g.id, texto(), ctx)
    const c1 = await comentar(a.id, pub.id, comentarioSchema.parse({ contenido: 'Buena pregunta' }), ctx)
    await comentar(b.id, pub.id, comentarioSchema.parse({ contenido: 'Coincido', padreId: c1.id }), ctx)
    expect(await prisma.notificacion.count({ where: { usuarioId: autor.id, titulo: { endsWith: 'comentó su publicación' } } })).toBe(2)
    expect(await prisma.notificacion.count({ where: { usuarioId: a.id, titulo: { endsWith: 'respondió a su comentario' } } })).toBe(1)

    const otra = await publicar(autor.id, g.id, texto(), ctx)
    await expect(comentar(a.id, otra.id, comentarioSchema.parse({ contenido: 'x', padreId: c1.id }), ctx)).rejects.toMatchObject({ statusCode: 400 })

    await reaccionar(a.id, { publicacionId: pub.id }, 'ME_GUSTA')
    await reaccionar(a.id, { publicacionId: pub.id }, 'UTIL')
    let det = await obtenerPublicacion(a.id, pub.id)
    expect(det.reacciones).toMatchObject({ total: 1, mia: 'UTIL', conteo: { UTIL: 1 } })
    await reaccionar(a.id, { publicacionId: pub.id }, null)
    det = await obtenerPublicacion(a.id, pub.id)
    expect(det.reacciones.total).toBe(0)
    expect(det.comentarios.map(c => c.padreId)).toEqual([null, c1.id])
  })

  it('reporte → la moderación elimina: deja de verse y se avisa al autor; no se reporta dos veces', async () => {
    const g = await grupo('ABIERTO')
    const [autor, lector] = [await participante(), await participante()]
    const moderador = await participante({ 'comunidad.moderar': 'TOTAL' })
    const pub = await publicar(autor.id, g.id, texto('Publicación inapropiada'), ctx)
    await reportar(lector.id, { publicacionId: pub.id }, { motivo: 'INAPROPIADO', detalle: null }, ctx)
    await expect(reportar(lector.id, { publicacionId: pub.id }, { motivo: 'SPAM', detalle: null }, ctx)).rejects.toMatchObject({ statusCode: 409 })

    const pendientes = await listarReportes(moderador.id)
    const r = pendientes.find(x => x.publicacion?.id === pub.id)!
    await expect(listarReportes(lector.id)).rejects.toMatchObject({ statusCode: 403 })
    await resolverReporte(moderador.id, r.id, { decision: 'ELIMINAR', nota: 'Fuera de las normas' }, ctx)

    await expect(obtenerPublicacion(lector.id, pub.id)).rejects.toMatchObject({ statusCode: 404 })
    expect((await obtenerPublicacion(moderador.id, pub.id)).motivoEliminacion).toBe('Fuera de las normas')
    expect(await prisma.notificacion.count({ where: { usuarioId: autor.id, titulo: 'Se retiró una de sus publicaciones' } })).toBe(1)
    expect(await prisma.reporte.findUniqueOrThrow({ where: { id: r.id } })).toMatchObject({ estado: 'ELIMINADO' })
  })

  it('los adjuntos son restringidos: sólo los ve quien ve la publicación', async () => {
    const g = await grupo('PRIVADO')
    const autor = await participante({ 'comunidad.moderar': 'TOTAL' })
    const externo = await participante()
    const pub = await publicar(autor.id, g.id, texto(), ctx)
    await adjuntar(autor.id, pub.id, [{ datos: PNG, nombre: 'imagen.png' }], ctx)
    const adj = await prisma.adjuntoPublicacion.findFirstOrThrow({ where: { publicacionId: pub.id }, include: { archivo: true } })
    expect(adj.archivo.visibilidad).toBe('RESTRINGIDO')
    await expect(leerAdjunto(autor.id, adj.id)).resolves.toMatchObject({ archivo: { mime: 'image/png' } })
    await expect(leerAdjunto(externo.id, adj.id)).rejects.toMatchObject({ statusCode: 404 })
    await expect(adjuntar(externo.id, pub.id, [{ datos: PNG, nombre: 'x.png' }], ctx)).rejects.toMatchObject({ statusCode: 404 })
  })
})
