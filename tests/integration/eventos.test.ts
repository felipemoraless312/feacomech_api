import { describe, expect, it } from 'vitest'
import {
  cambiarEstadoEvento, cancelarInscripcion, crearEvento, diasDelEvento, emitirConstancias, eventoParaUsuario, eventoPublico,
  inscribirse, inscritosCsv, registrarAsistencia, revocarConstancia, verificarConstancia,
} from '../../server/services/eventos'
import { crearOrganizacion } from '../../server/services/organizaciones'
import type { Ambito } from '../../server/services/permisos'
import { prisma } from '../../server/utils/prisma'
import { eventoSchema } from '../../shared/schemas/eventos'
import { organizacionCrearSchema } from '../../shared/schemas/organizacion'
import { crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

const ctx = ctxPrueba
const TODAS: Ambito = { todas: true }

/** Fecha y hora local (México) relativa a hoy: ("2026-11-01T09:00"). */
function local(dias: number, hora = '09:00') {
  const d = new Date(Date.now() + dias * 86_400_000 - 6 * 3_600_000)
  return `${d.toISOString().slice(0, 10)}T${hora}`
}

async function evento(extra: Record<string, unknown> = {}, publicar = true) {
  const e = await crearEvento(eventoSchema.parse({
    tipo: 'CURSO', titulo: `Curso de prueba ${unico()}`, descripcion: 'Curso para las pruebas automáticas.',
    inicio: local(5), fin: local(6, '14:00'), modalidad: 'HIBRIDO', sede: 'Auditorio', enlaceVirtual: 'https://reunion.example/sala', ...extra,
  }), TODAS, ctx)
  if (publicar) await cambiarEstadoEvento(e.id, 'PUBLICADO', TODAS, ctx)
  return e
}

describe('inscripción', () => {
  it('con cupo lleno pasa a lista de espera; al cancelar se promueve al siguiente', async () => {
    const e = await evento({ capacidad: 1 })
    const [a, b] = [await crearUsuarioPrueba(), await crearUsuarioPrueba()]
    expect((await inscribirse(e.id, a.id, ctx)).estado).toBe('CONFIRMADA')
    expect((await inscribirse(e.id, b.id, ctx)).estado).toBe('LISTA_ESPERA')
    await expect(inscribirse(e.id, a.id, ctx)).rejects.toMatchObject({ statusCode: 409 })

    // El enlace virtual sólo lo ve el confirmado
    expect((await eventoParaUsuario(e.id, a.id)).enlaceVirtual).toBe('https://reunion.example/sala')
    expect((await eventoParaUsuario(e.id, b.id)).enlaceVirtual).toBeNull()
    expect((await eventoPublico(e.slug))).not.toHaveProperty('enlaceVirtual')

    await cancelarInscripcion(e.id, a.id, ctx)
    expect(await prisma.inscripcion.findUniqueOrThrow({ where: { eventoId_usuarioId: { eventoId: e.id, usuarioId: b.id } } })).toMatchObject({ estado: 'CONFIRMADA' })
    expect(await prisma.notificacion.count({ where: { usuarioId: b.id, titulo: { startsWith: 'Lugar confirmado' } } })).toBe(1)
  })

  it('inscripciones simultáneas no exceden el cupo', async () => {
    const e = await evento({ capacidad: 3 })
    const usuarios = await Promise.all(Array.from({ length: 6 }, () => crearUsuarioPrueba()))
    await Promise.all(usuarios.map(u => inscribirse(e.id, u.id, ctx)))
    expect(await prisma.inscripcion.count({ where: { eventoId: e.id, estado: 'CONFIRMADA' } })).toBe(3)
    expect(await prisma.inscripcion.count({ where: { eventoId: e.id, estado: 'LISTA_ESPERA' } })).toBe(3)
  })

  it('no hay inscripción a borradores; un evento con inscritos no vuelve a borrador', async () => {
    const borrador = await evento({}, false)
    const u = await crearUsuarioPrueba()
    await expect(inscribirse(borrador.id, u.id, ctx)).rejects.toMatchObject({ statusCode: 404 })
    const e = await evento()
    await inscribirse(e.id, u.id, ctx)
    await expect(cambiarEstadoEvento(e.id, 'BORRADOR', TODAS, ctx)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('un representante sólo crea eventos de su organización', async () => {
    const o = (await crearOrganizacion(organizacionCrearSchema.parse({ tipo: 'COLEGIO', nombre: `Colegio Eventos ${unico()}` }), ctx))!
    const ambito: Ambito = { todas: false, ids: [o.id] }
    const datos = { tipo: 'TALLER', titulo: 'Taller', descripcion: 'Taller de prueba de su colegio.', inicio: local(3), fin: local(3, '13:00'), modalidad: 'VIRTUAL' }
    await expect(crearEvento(eventoSchema.parse(datos), ambito, ctx)).rejects.toMatchObject({ statusCode: 403 })
    await expect(crearEvento(eventoSchema.parse({ ...datos, organizacionId: o.id }), ambito, ctx)).resolves.toMatchObject({ organizacionId: o.id })
  })
})

describe('asistencia y constancias', () => {
  it('constancia sólo con asistencia; folio, verificación pública y revocación', async () => {
    // Evento en curso (empezó ayer) para poder emitir constancias.
    const e = await evento({ inicio: local(-1), fin: local(1, '14:00'), valorCurricular: '10 horas' })
    const [conAsistencia, sinAsistencia] = [await crearUsuarioPrueba(), await crearUsuarioPrueba()]
    const i1 = await inscribirse(e.id, conAsistencia.id, ctx)
    const i2 = await inscribirse(e.id, sinAsistencia.id, ctx)
    const dias = diasDelEvento(new Date(e.inicio), new Date(e.fin))
    expect(dias).toHaveLength(3)

    await expect(registrarAsistencia(e.id, { inscripcionIds: [i1.id], fecha: '2020-01-01', asistio: true }, TODAS, ctx)).rejects.toMatchObject({ statusCode: 400 })
    await registrarAsistencia(e.id, { inscripcionIds: [i1.id], fecha: dias[1]!, asistio: true }, TODAS, ctx)
    await registrarAsistencia(e.id, { inscripcionIds: [i1.id], fecha: dias[1]!, asistio: true }, TODAS, ctx) // idempotente

    const r = await emitirConstancias(e.id, [i1.id, i2.id], TODAS, ctx)
    expect(r).toEqual({ emitidas: 1, omitidas: 1 })
    const c = await prisma.constancia.findUniqueOrThrow({ where: { inscripcionId: i1.id } })
    expect(c.folio).toMatch(/^CONST-\d{4}-\d{6}$/)
    expect(c.codigo).toMatch(/^[A-Z2-9]{10}$/)
    expect(await emitirConstancias(e.id, [i1.id], TODAS, ctx)).toEqual({ emitidas: 0, omitidas: 1 })

    const v = await verificarConstancia(c.codigo)
    expect(v).toMatchObject({ valida: true, folio: c.folio, titular: 'Prueba Integración', evento: { valorCurricular: '10 horas' } })
    expect(JSON.stringify(v)).not.toMatch(/@feacomech\.test/)
    await expect(cancelarInscripcion(e.id, conAsistencia.id, ctx)).rejects.toMatchObject({ statusCode: 409 })

    await revocarConstancia(c.id, 'Emitida por error', TODAS, ctx)
    expect(await verificarConstancia(c.codigo)).toMatchObject({ valida: false, revocada: true })
    expect(await verificarConstancia('ZZZZZZZZZZ')).toEqual({ valida: false })
  })

  it('no se emiten constancias antes de que inicie el evento', async () => {
    const e = await evento()
    const u = await crearUsuarioPrueba()
    const i = await inscribirse(e.id, u.id, ctx)
    await expect(emitirConstancias(e.id, [i.id], TODAS, ctx)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('el CSV neutraliza fórmulas de hoja de cálculo', async () => {
    const e = await evento()
    const u = await prisma.usuario.create({ data: { email: `csv.${unico()}@feacomech.test`, passwordHash: 'x', nombre: '=HYPERLINK("http://x")', apellidoPaterno: 'Prueba' } })
    await inscribirse(e.id, u.id, ctx)
    const csv = await inscritosCsv(e.id, TODAS)
    expect(csv).toContain('"\'=HYPERLINK(""http://x"") Prueba"')
  })
})
