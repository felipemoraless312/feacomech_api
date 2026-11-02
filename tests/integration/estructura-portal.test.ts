import { describe, expect, it } from 'vitest'
import {
  eliminarCargo, estructuraPublica, guardarCargo, guardarFotoNombramiento, guardarNombramiento, guardarOrgano, guardarPeriodo, historialPublico, obtenerEstructura,
} from '../../server/services/estructura'
import { actualizarNoticia, crearNoticia, eliminarNoticia, guardarPortada, noticiaPublica, noticiasPublicas, transicionNoticia } from '../../server/services/noticias'
import { crearOrganizacion } from '../../server/services/organizaciones'
import { guardarVinculo, recibirMensaje, vinculosPublicos } from '../../server/services/portal'
import { prisma } from '../../server/utils/prisma'
import { nombramientoSchema, organoSchema, periodoSchema, cargoSchema } from '../../shared/schemas/estructura'
import { organizacionCrearSchema } from '../../shared/schemas/organizacion'
import { contactoSchema, noticiaSchema, vinculoSchema } from '../../shared/schemas/portal'
import { crearRolPrueba, crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

const ctx = ctxPrueba
const PNG = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63F8FFFF3F0005FE02FEA7D6A4E20000000049454E44AE426082', 'hex')

/** Estructura en una organización nueva (aislada de otras pruebas). */
async function estructura() {
  const org = (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Estructura ${unico()}` }), ctx))!
  const organo = await guardarOrgano(null, organoSchema.parse({ organizacionId: org.id, tipo: 'MESA_DIRECTIVA', nombre: 'Mesa directiva' }), ctx)
  const presidencia = await guardarCargo(null, cargoSchema.parse({ organoId: organo.id, nombre: 'Presidencia' }), ctx)
  const secretaria = await guardarCargo(null, cargoSchema.parse({ organoId: organo.id, nombre: 'Secretaría', orden: 1, superiorId: presidencia.id }), ctx)
  const vacante = await guardarCargo(null, cargoSchema.parse({ organoId: organo.id, nombre: 'Tesorería', orden: 2, superiorId: presidencia.id }), ctx)
  const periodo = await guardarPeriodo(null, periodoSchema.parse({ organizacionId: org.id, nombre: '2025–2027', inicio: '2025-01-01', fin: '2027-12-31' }), ctx)
  return { org, organo, presidencia, secretaria, vacante, periodo }
}

describe('estructura organizacional', () => {
  it('rechaza ciclos y superiores de otra estructura', async () => {
    const e = await estructura()
    const otra = await estructura()
    await expect(guardarCargo(e.presidencia.id, cargoSchema.parse({ organoId: e.organo.id, nombre: 'Presidencia', superiorId: e.secretaria.id }), ctx))
      .rejects.toMatchObject({ statusCode: 400 })
    await expect(guardarCargo(null, cargoSchema.parse({ organoId: e.organo.id, nombre: 'X', superiorId: otra.presidencia.id }), ctx))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('un nombramiento usa cargo y periodo de la misma estructura', async () => {
    const e = await estructura()
    const otra = await estructura()
    await expect(guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.presidencia.id, periodoId: otra.periodo.id, nombrePersona: 'Dra. Prueba', inicio: '2025-01-01' }), ctx))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('el portal sólo muestra nombramientos publicados y vigentes, sin cargos vacíos', async () => {
    const e = await estructura()
    const publicado = await guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.presidencia.id, periodoId: e.periodo.id, nombrePersona: 'Dra. Publicada', inicio: '2025-01-01', publicado: true }), ctx)
    await guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.secretaria.id, periodoId: e.periodo.id, nombrePersona: 'Sin validar', inicio: '2025-01-01' }), ctx)
    await guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.secretaria.id, nombrePersona: 'Revocado', inicio: '2025-01-01', estado: 'REVOCADO', publicado: true }), ctx)

    const pub = await estructuraPublica(e.org.id, ['MESA_DIRECTIVA'])
    expect(pub.periodo?.nombre).toBe('2025–2027')
    const nodos = pub.organos[0]!.organigrama
    expect(nodos.map(n => n.cargo.nombre)).toEqual(['Presidencia'])
    expect(nodos[0]!.cargo.personas.map(p => p.nombre)).toEqual(['Dra. Publicada'])
    expect(nodos[0]!.hijos).toEqual([]) // Secretaría (sin publicar) y Tesorería (vacante) no aparecen

    // En el panel sí están todos
    const panel = await obtenerEstructura(e.org.id)
    expect(panel.nombramientos).toHaveLength(3)
    expect(panel.nombramientos.find(n => n.id === publicado.id)?.vigente).toBe(true)
  })

  it('la foto del perfil sólo se usa en el portal con autorización; la del nombramiento sólo si está publicado', async () => {
    const e = await estructura()
    const u = await crearUsuarioPrueba()
    const archivo = await prisma.archivo.create({ data: { nombreOriginal: 'x.png', mime: 'image/png', tamano: 1, ruta: `prueba/${unico()}.png`, sha256: 'x' } })
    await prisma.perfilProfesional.create({ data: { usuarioId: u.id, fotoId: archivo.id } })
    const n = await guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.presidencia.id, usuarioId: u.id, inicio: '2025-01-01', publicado: true }), ctx)

    let p = (await estructuraPublica(e.org.id)).organos[0]!.organigrama[0]!.cargo.personas[0]!
    expect(p).toMatchObject({ nombre: 'Prueba Integración', fotoId: null })
    await prisma.perfilProfesional.update({ where: { usuarioId: u.id }, data: { publicarDirectorio: true, consentimientoEn: new Date() } })
    p = (await estructuraPublica(e.org.id)).organos[0]!.organigrama[0]!.cargo.personas[0]!
    expect(p.fotoId).toBe(archivo.id)

    await guardarFotoNombramiento(n.id, PNG, 'retrato.png', ctx)
    const conFoto = await prisma.nombramiento.findUniqueOrThrow({ where: { id: n.id }, include: { foto: true } })
    expect(conFoto.foto?.visibilidad).toBe('PUBLICO')
    await guardarNombramiento(n.id, nombramientoSchema.parse({ cargoId: e.presidencia.id, usuarioId: u.id, inicio: '2025-01-01', publicado: false }), ctx)
    expect((await prisma.archivo.findUniqueOrThrow({ where: { id: conFoto.fotoId! } })).visibilidad).toBe('AUTENTICADO')
  })

  it('historial: periodos concluidos con sus nombramientos publicados', async () => {
    const e = await estructura()
    const anterior = await guardarPeriodo(null, periodoSchema.parse({ organizacionId: e.org.id, nombre: '2022–2024', inicio: '2022-01-01', fin: '2024-12-31' }), ctx)
    await guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.presidencia.id, periodoId: anterior.id, nombrePersona: 'Expresidente', inicio: '2022-01-01', fin: '2024-12-31', estado: 'CONCLUIDO', publicado: true }), ctx)
    const h = await historialPublico(e.org.id)
    expect(h).toHaveLength(1)
    expect(h[0]).toMatchObject({ nombre: '2022–2024', integrantes: [{ cargo: 'Presidencia', nombre: 'Expresidente' }] })
  })

  it('un cargo con historial no se elimina; la base exige persona en cada nombramiento', async () => {
    const e = await estructura()
    await guardarNombramiento(null, nombramientoSchema.parse({ cargoId: e.vacante.id, nombrePersona: 'Tesorera', inicio: '2025-01-01' }), ctx)
    await expect(eliminarCargo(e.vacante.id, ctx)).rejects.toMatchObject({ statusCode: 409 })
    await expect(prisma.nombramiento.create({ data: { cargoId: e.vacante.id, inicio: new Date() } })).rejects.toThrow(/Nombramiento_persona/)
  })
})

describe('noticias', () => {
  const datos = (extra: Record<string, unknown> = {}) => noticiaSchema.parse({ tipo: 'NOTICIA', titulo: `Congreso estatal ${unico()}`, contenido: 'Primer párrafo de la noticia.\n\nSegundo párrafo.', ...extra })

  async function autor(permisos: Record<string, 'TOTAL' | 'ORGANIZACION' | 'PROPIO'>) {
    const u = await crearUsuarioPrueba({ rolIds: [(await crearRolPrueba(permisos)).id] })
    return { ...u, ctx: { ...ctx, usuarioId: u.id } }
  }

  it('flujo: borrador → revisión → publicada; el autor no publica ni edita lo publicado', async () => {
    const a = await autor({ 'noticia.publicar': 'PROPIO' })
    const admin = await autor({ 'noticia.administrar': 'TOTAL' })
    const n = await crearNoticia(a.id, datos({ destacada: true }), a.ctx)
    expect(n).toMatchObject({ estado: 'BORRADOR', destacada: false }) // sólo la administración destaca

    await expect(transicionNoticia(a.id, n.id, { accion: 'PUBLICAR', motivo: null }, a.ctx)).rejects.toMatchObject({ statusCode: 403 })
    await transicionNoticia(a.id, n.id, { accion: 'ENVIAR_A_REVISION', motivo: null }, a.ctx)
    await expect(transicionNoticia(admin.id, n.id, { accion: 'DEVOLVER', motivo: null }, admin.ctx)).rejects.toMatchObject({ statusCode: 400 })
    await guardarPortada(a.id, n.id, PNG, 'portada.png', a.ctx)

    await transicionNoticia(admin.id, n.id, { accion: 'PUBLICAR', motivo: null }, admin.ctx)
    const publicada = await prisma.noticia.findUniqueOrThrow({ where: { id: n.id }, include: { portada: true } })
    expect(publicada.publicadaEn).toBeInstanceOf(Date)
    expect(publicada.portada?.visibilidad).toBe('PUBLICO')
    expect(await prisma.notificacion.count({ where: { usuarioId: a.id, titulo: 'Su noticia fue publicada' } })).toBe(1)

    await expect(actualizarNoticia(a.id, n.id, datos(), a.ctx)).rejects.toMatchObject({ statusCode: 403 })
    expect((await noticiaPublica(n.slug)).titulo).toBe(n.titulo)

    await transicionNoticia(admin.id, n.id, { accion: 'RETIRAR', motivo: null }, admin.ctx)
    await expect(noticiaPublica(n.slug)).rejects.toMatchObject({ statusCode: 404 })
    expect((await prisma.archivo.findUniqueOrThrow({ where: { id: publicada.portadaId! } })).visibilidad).toBe('AUTENTICADO')
  })

  it('sólo lo publicado es público; el slug es único', async () => {
    const a = await autor({ 'noticia.publicar': 'TOTAL', 'noticia.administrar': 'TOTAL' })
    const titulo = `Comunicado ${unico()}`
    const n1 = await crearNoticia(a.id, datos({ titulo, tipo: 'COMUNICADO' }), a.ctx)
    const n2 = await crearNoticia(a.id, datos({ titulo, tipo: 'COMUNICADO' }), a.ctx)
    expect(n2.slug).not.toBe(n1.slug)
    await transicionNoticia(a.id, n1.id, { accion: 'PUBLICAR', motivo: null }, a.ctx)
    const slugs = (await noticiasPublicas({ tipo: 'COMUNICADO', pagina: 1, porPagina: 100 })).datos.map(n => n.slug)
    expect(slugs).toContain(n1.slug)
    expect(slugs).not.toContain(n2.slug)
  })

  it('un representante sólo publica a nombre de su organización; sólo se eliminan borradores', async () => {
    const [o1, o2] = await Promise.all([1, 2].map(() => crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Noticias ${unico()}` }), ctx)))
    const rol = await crearRolPrueba({ 'noticia.publicar': 'ORGANIZACION' })
    const u = await crearUsuarioPrueba()
    await prisma.usuarioRol.create({ data: { usuarioId: u.id, rolId: rol.id, organizacionId: o1!.id } })
    const uctx = { ...ctx, usuarioId: u.id }
    await expect(crearNoticia(u.id, datos({ organizacionId: o2!.id }), uctx)).rejects.toMatchObject({ statusCode: 403 })
    const n = await crearNoticia(u.id, datos({ organizacionId: o1!.id }), uctx)
    await transicionNoticia(u.id, n.id, { accion: 'ENVIAR_A_REVISION', motivo: null }, uctx)
    await expect(eliminarNoticia(u.id, n.id, uctx)).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('vinculación y contacto', () => {
  it('sólo los vínculos publicados son públicos', async () => {
    const nombre = `Universidad de prueba ${unico()}`
    const v = await guardarVinculo(null, vinculoSchema.parse({ tipo: 'CONVENIO', nombre, fechaFirma: '2025-05-10' }), ctx)
    expect((await vinculosPublicos()).map(x => x.nombre)).not.toContain(nombre)
    await guardarVinculo(v.id, vinculoSchema.parse({ tipo: 'CONVENIO', nombre, fechaFirma: '2025-05-10', publicado: true }), ctx)
    expect((await vinculosPublicos()).map(x => x.nombre)).toContain(nombre)
  })

  it('un mensaje de contacto se guarda y avisa a quienes lo atienden', async () => {
    const rol = await crearRolPrueba({ 'contacto.ver': 'TOTAL' })
    const atiende = await crearUsuarioPrueba({ rolIds: [rol.id] })
    const asunto = `Afiliación ${unico()}`
    await recibirMensaje(contactoSchema.parse({ nombre: 'Ana', email: 'ana@correo.mx', asunto, mensaje: 'Quisiera información.', aceptaAviso: true }), '10.0.0.1')
    expect(await prisma.mensajeContacto.findFirst({ where: { asunto } })).toMatchObject({ estado: 'NUEVO', ip: '10.0.0.1' })
    expect(await prisma.notificacion.count({ where: { usuarioId: atiende.id, titulo: 'Nuevo mensaje de contacto' } })).toBe(1)
  })
})
