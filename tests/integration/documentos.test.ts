import { describe, expect, it } from 'vitest'
import { crearDocumento, eliminarDocumento, leerDocumento, listarDocumentos, reemplazarArchivo } from '../../server/services/documentos'
import { crearOrganizacion } from '../../server/services/organizaciones'
import { detectarTipo, OFFICE } from '../../server/utils/almacen'
import { prisma } from '../../server/utils/prisma'
import { documentoSchema } from '../../shared/schemas/documentos'
import { organizacionCrearSchema } from '../../shared/schemas/organizacion'
import { crearRolPrueba, crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

const ctx = ctxPrueba
const PDF = Buffer.from('%PDF-1.4\n%prueba\n')
const q = { pagina: 1, porPagina: 200 }

async function categoria() {
  return prisma.categoriaDocumento.upsert({ where: { nombre: 'Actas' }, update: {}, create: { nombre: 'Actas', slug: 'actas' } })
}

async function gestor(organizacionId?: string) {
  const rol = await crearRolPrueba(organizacionId ? { 'documento.gestionar': 'ORGANIZACION' } : { 'documento.gestionar': 'TOTAL' })
  const u = await crearUsuarioPrueba()
  await prisma.usuarioRol.create({ data: { usuarioId: u.id, rolId: rol.id, organizacionId: organizacionId ?? null } })
  return u
}

const datos = async (extra: Record<string, unknown>) => documentoSchema.parse({ titulo: `Documento ${unico()}`, categoriaId: (await categoria()).id, nivelAcceso: 'PUBLICO', ...extra })

describe('documentos', () => {
  it('cada nivel de acceso se respeta en la lista y en la descarga', async () => {
    const o = (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Docs ${unico()}` }), ctx))!
    const admin = await gestor()
    const publico = await crearDocumento(admin.id, await datos({ nivelAcceso: 'PUBLICO' }), { datos: PDF, nombre: 'estatutos.pdf' }, ctx)
    const afiliados = await crearDocumento(admin.id, await datos({ nivelAcceso: 'AFILIADOS' }), { datos: PDF, nombre: 'circular.pdf' }, ctx)
    const deOrg = await crearDocumento(admin.id, await datos({ nivelAcceso: 'ORGANIZACION', organizacionId: o.id }), { datos: PDF, nombre: 'acta.pdf' }, ctx)
    const restringido = await crearDocumento(admin.id, await datos({ nivelAcceso: 'RESTRINGIDO' }), { datos: PDF, nombre: 'oficio.pdf' }, ctx)

    const integrante = await crearUsuarioPrueba()
    await prisma.membresia.create({ data: { usuarioId: integrante.id, organizacionId: o.id, estado: 'ACTIVA', desde: new Date() } })
    const otro = await crearUsuarioPrueba()

    const ids = async (u: string | null) => (await listarDocumentos(u, q)).datos.map(d => d.id)
    expect(await ids(null)).toContain(publico.id)
    expect(await ids(null)).not.toContain(afiliados.id)
    expect(await ids(otro.id)).toEqual(expect.arrayContaining([publico.id, afiliados.id]))
    expect(await ids(otro.id)).not.toContain(deOrg.id)
    expect(await ids(integrante.id)).toContain(deOrg.id)
    expect(await ids(integrante.id)).not.toContain(restringido.id)
    expect(await ids(admin.id)).toContain(restringido.id)

    await expect(leerDocumento(null, afiliados.id, ctx)).rejects.toMatchObject({ statusCode: 401 })
    await expect(leerDocumento(otro.id, deOrg.id, ctx)).rejects.toMatchObject({ statusCode: 404 })
    await expect(leerDocumento(integrante.id, deOrg.id, ctx)).resolves.toMatchObject({ archivo: { mime: 'application/pdf' } })
    await leerDocumento(null, publico.id, ctx)
    expect((await prisma.documento.findUniqueOrThrow({ where: { id: publico.id } })).descargas).toBe(1)
    expect(await prisma.auditoria.count({ where: { entidad: 'Documento', entidadId: deOrg.id, accion: 'DESCARGAR' } })).toBe(1)
  })

  it('quien gestiona documentos de una organización sólo gestiona los de ella', async () => {
    const [o1, o2] = await Promise.all([1, 2].map(() => crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Docs ${unico()}` }), ctx)))
    const g = await gestor(o1!.id)
    await expect(crearDocumento(g.id, await datos({ nivelAcceso: 'AFILIADOS' }), { datos: PDF, nombre: 'x.pdf' }, ctx)).rejects.toMatchObject({ statusCode: 403 })
    await expect(crearDocumento(g.id, await datos({ nivelAcceso: 'ORGANIZACION', organizacionId: o2!.id }), { datos: PDF, nombre: 'x.pdf' }, ctx)).rejects.toMatchObject({ statusCode: 403 })
    const d = await crearDocumento(g.id, await datos({ nivelAcceso: 'RESTRINGIDO', organizacionId: o1!.id }), { datos: PDF, nombre: 'acta.pdf' }, ctx)
    expect((await listarDocumentos(g.id, q)).datos.map(x => x.id)).toContain(d.id)

    await reemplazarArchivo(g.id, d.id, { datos: PDF, nombre: 'acta-v2.pdf' }, ctx)
    expect((await prisma.documento.findUniqueOrThrow({ where: { id: d.id }, include: { archivo: true } })).archivo.nombreOriginal).toBe('acta-v2.pdf')
    await eliminarDocumento(g.id, d.id, ctx)
    expect(await prisma.documento.findUnique({ where: { id: d.id } })).toBeNull()
  })

  it('los no vigentes sólo los ve quien gestiona; se rechazan archivos no permitidos', async () => {
    const admin = await gestor()
    const viejo = await crearDocumento(admin.id, await datos({ nivelAcceso: 'PUBLICO', vigente: false }), { datos: PDF, nombre: 'reglamento-2010.pdf' }, ctx)
    expect((await listarDocumentos(null, q)).datos.map(d => d.id)).not.toContain(viejo.id)
    expect((await listarDocumentos(admin.id, { ...q, incluirNoVigentes: true })).datos.map(d => d.id)).toContain(viejo.id)
    await expect(crearDocumento(admin.id, await datos({}), { datos: Buffer.from('MZ\u0090\u0000ejecutable'), nombre: 'virus.pdf' }, ctx)).rejects.toMatchObject({ statusCode: 415 })
  })

  it('Office se reconoce por firma y extensión', () => {
    const zip = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0, 0])
    expect(detectarTipo(zip, OFFICE, 'acta.docx')?.extension).toBe('docx')
    expect(detectarTipo(zip, OFFICE, 'malicioso.zip')).toBeNull()
    expect(detectarTipo(Buffer.from('texto'), OFFICE, 'falso.docx')).toBeNull()
  })
})
