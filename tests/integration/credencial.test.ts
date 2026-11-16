import { beforeAll, describe, expect, it } from 'vitest'
import { codigoCredencial, miCredencial, verificarCredencial } from '../../server/services/credencial'
import { prisma } from '../../server/utils/prisma'
import { crearUsuarioPrueba, unico } from './helpers'

beforeAll(() => {
  process.env.NUXT_SESSION_PASSWORD ??= 'clave-de-sesion-solo-para-pruebas-0123456789'
})

async function organizacion(estadoAfiliacion: 'AFILIADA' | 'SUSPENDIDA' = 'AFILIADA') {
  const s = unico()
  return prisma.organizacion.create({ data: { tipo: 'COLEGIO', nombre: `Colegio Credencial ${s}`, slug: `colegio-credencial-${s}`, estadoAfiliacion } })
}

async function afiliado(opts: { validado?: boolean, membresia?: 'ACTIVA' | 'SOLICITADA' | null, afiliacion?: 'AFILIADA' | 'SUSPENDIDA', publicarDirectorio?: boolean } = {}) {
  const u = await crearUsuarioPrueba()
  await prisma.perfilProfesional.create({
    data: { usuarioId: u.id, estadoValidacion: opts.validado === false ? 'PENDIENTE' : 'VALIDADO', publicarDirectorio: opts.publicarDirectorio ?? false, consentimientoEn: opts.publicarDirectorio ? new Date() : null },
  })
  if (opts.membresia !== null) {
    const o = await organizacion(opts.afiliacion)
    await prisma.membresia.create({ data: { usuarioId: u.id, organizacionId: o.id, estado: opts.membresia ?? 'ACTIVA', numeroSocio: 'S-001', desde: (opts.membresia ?? 'ACTIVA') === 'ACTIVA' ? new Date('2026-01-15') : null } })
  }
  return u
}

describe('credencial digital', () => {
  it('es vigente con perfil validado y membresía activa en una organización afiliada', async () => {
    const u = await afiliado()
    const c = await miCredencial(u.id)
    expect(c).toMatchObject({ vigente: true, validado: true })
    expect(c.membresias).toHaveLength(1)
    expect(c.folio).toMatch(/^FEA-[A-Z0-9]{8}$/)

    const v = await verificarCredencial(c.codigo)
    expect(v).toMatchObject({ encontrada: true, vigente: true, folio: c.folio })
  })

  it('no es vigente sin validación, sin membresía activa o si la organización no está afiliada', async () => {
    for (const opts of [{ validado: false }, { membresia: null }, { membresia: 'SOLICITADA' as const }, { afiliacion: 'SUSPENDIDA' as const }]) {
      const u = await afiliado(opts)
      expect((await miCredencial(u.id)).vigente).toBe(false)
      expect(await verificarCredencial(codigoCredencial(u.id))).toMatchObject({ encontrada: true, vigente: false })
    }
  })

  it('rechaza códigos sin firma válida, igual que si no existieran', async () => {
    const u = await afiliado()
    const codigo = codigoCredencial(u.id)
    const [id, firma] = codigo.split('.')
    const alterada = `${firma!.slice(0, -1)}${firma!.endsWith('A') ? 'B' : 'A'}`

    expect(await verificarCredencial(`${id}.${alterada}`)).toEqual({ encontrada: false })
    expect(await verificarCredencial(id!)).toEqual({ encontrada: false })
    expect(await verificarCredencial('cualquier-cosa')).toEqual({ encontrada: false })
    // La firma de otro usuario no sirve para este id.
    const otro = await afiliado()
    expect(await verificarCredencial(`${id}.${codigoCredencial(otro.id).split('.')[1]}`)).toEqual({ encontrada: false })
  })

  it('la verificación pública sólo muestra la foto si su titular la hizo pública', async () => {
    for (const publicarDirectorio of [false, true]) {
      const u = await afiliado({ publicarDirectorio })
      const foto = await prisma.archivo.create({ data: { nombreOriginal: 'foto.jpg', ruta: `pruebas/${unico()}.jpg`, mime: 'image/jpeg', tamano: 1, sha256: 'x'.repeat(64), visibilidad: 'AUTENTICADO' } })
      await prisma.perfilProfesional.update({ where: { usuarioId: u.id }, data: { fotoId: foto.id } })
      const v = await verificarCredencial(codigoCredencial(u.id))
      expect(v.encontrada && v.fotoId).toBe(publicarDirectorio ? foto.id : null)
    }
  })
})
