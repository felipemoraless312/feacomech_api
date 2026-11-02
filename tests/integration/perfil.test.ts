import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { crearEspecialidad } from '../../server/services/especialidades'
import { actualizarPerfil, guardarFoto, quitarFoto } from '../../server/services/perfil'
import { rutaAbsoluta } from '../../server/utils/almacen'
import { prisma } from '../../server/utils/prisma'
import { perfilSchema } from '../../shared/schemas/perfil'
import { crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

const PNG = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63F8FFFF3F0005FE02FEA7D6A4E20000000049454E44AE426082', 'hex')

const perfil = (d: Partial<Parameters<typeof perfilSchema.parse>[0]> = {}) => perfilSchema.parse({ telefono: '9611234567', cedulaProfesional: '1234567', ...d })

async function usuario() {
  const u = await crearUsuarioPrueba()
  return { ...u, ctx: { ...ctxPrueba, usuarioId: u.id } }
}

describe('perfil profesional', () => {
  it('guarda datos y teléfono; al cambiar la cédula vuelve a validación', async () => {
    const u = await usuario()
    const c = await actualizarPerfil(u.id, perfil(), u.ctx)
    expect(c).toMatchObject({ telefono: '9611234567', perfil: { cedulaProfesional: '1234567', estadoValidacion: 'PENDIENTE' } })

    await prisma.perfilProfesional.update({ where: { usuarioId: u.id }, data: { estadoValidacion: 'VALIDADO', validadoEn: new Date() } })
    // Cambios no validables no la alteran
    expect((await actualizarPerfil(u.id, perfil({ institucionTrabajo: 'Hospital X' }), u.ctx)).perfil?.estadoValidacion).toBe('VALIDADO')
    // Cambiar la cédula sí
    expect((await actualizarPerfil(u.id, perfil({ cedulaProfesional: '7654321' }), u.ctx)).perfil).toMatchObject({ estadoValidacion: 'PENDIENTE', validadoEn: null })
  })

  it('valida especialidad principal y que la subespecialidad le pertenezca', async () => {
    const u = await usuario()
    const e1 = (await crearEspecialidad({ nombre: `Esp ${unico()}`, padreId: null, activo: true }, ctxPrueba))!
    const e2 = (await crearEspecialidad({ nombre: `Esp ${unico()}`, padreId: null, activo: true }, ctxPrueba))!
    const sub = (await crearEspecialidad({ nombre: `Sub ${unico()}`, padreId: e1.id, activo: true }, ctxPrueba))!

    await expect(actualizarPerfil(u.id, perfil({ especialidadId: e2.id, subespecialidadId: sub.id }), u.ctx)).rejects.toMatchObject({ statusCode: 400 })
    await expect(actualizarPerfil(u.id, perfil({ especialidadId: sub.id }), u.ctx)).rejects.toMatchObject({ statusCode: 400 })
    const c = await actualizarPerfil(u.id, perfil({ especialidadId: e1.id, subespecialidadId: sub.id }), u.ctx)
    expect(c.perfil).toMatchObject({ especialidadId: e1.id, subespecialidadId: sub.id })
  })

  it('el consentimiento del directorio queda fechado y en la bitácora; la foto se publica sólo con él', async () => {
    const u = await usuario()
    await guardarFoto(u.id, PNG, 'yo.png', u.ctx)
    let c = await actualizarPerfil(u.id, perfil({ publicarDirectorio: true }), u.ctx)
    expect(c.perfil?.consentimientoEn).toBeInstanceOf(Date)
    expect(await prisma.archivo.findUniqueOrThrow({ where: { id: c.perfil!.fotoId! } })).toMatchObject({ visibilidad: 'PUBLICO' })

    c = await actualizarPerfil(u.id, perfil({ publicarDirectorio: false }), u.ctx)
    expect(c.perfil?.consentimientoEn).toBeNull()
    expect(await prisma.archivo.findUniqueOrThrow({ where: { id: c.perfil!.fotoId! } })).toMatchObject({ visibilidad: 'AUTENTICADO' })
    expect(await prisma.auditoria.count({ where: { entidad: 'PerfilProfesional.consentimiento', entidadId: u.id } })).toBe(2)
  })

  it('cédula con formato inválido se rechaza en el esquema', () => {
    expect(perfilSchema.safeParse({ cedulaProfesional: '12ab' }).success).toBe(false)
    expect(perfilSchema.parse({ cedulaProfesional: ' 1234 5678 ' }).cedulaProfesional).toBe('12345678')
  })
})

describe('foto de perfil', () => {
  it('acepta imágenes por su firma real y reemplaza la anterior (borra el archivo)', async () => {
    const u = await usuario()
    const c1 = await guardarFoto(u.id, PNG, 'yo.png', u.ctx)
    const a1 = await prisma.archivo.findUniqueOrThrow({ where: { id: c1.perfil!.fotoId! } })
    expect(a1).toMatchObject({ mime: 'image/png', visibilidad: 'AUTENTICADO', tamano: PNG.length })
    expect(existsSync(rutaAbsoluta(a1.ruta))).toBe(true)

    const c2 = await guardarFoto(u.id, PNG, 'otra.png', u.ctx)
    expect(c2.perfil!.fotoId).not.toBe(a1.id)
    expect(await prisma.archivo.findUnique({ where: { id: a1.id } })).toBeNull()
    expect(existsSync(rutaAbsoluta(a1.ruta))).toBe(false)

    await quitarFoto(u.id, u.ctx)
    expect((await prisma.perfilProfesional.findUniqueOrThrow({ where: { usuarioId: u.id } })).fotoId).toBeNull()
  })

  it('rechaza archivos que no son imagen aunque digan .png, y los demasiado grandes', async () => {
    const u = await usuario()
    await expect(guardarFoto(u.id, Buffer.from('<svg onload="alert(1)">'), 'x.png', u.ctx)).rejects.toMatchObject({ statusCode: 415 })
    await expect(guardarFoto(u.id, Buffer.concat([PNG, Buffer.alloc(3 * 1024 * 1024)]), 'grande.png', u.ctx)).rejects.toMatchObject({ statusCode: 413 })
  })
})
