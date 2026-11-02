import { describe, expect, it } from 'vitest'
import { cambiarContrasena } from '../../server/services/auth'
import { VIDA_MAXIMA_MS, abrirSesion, cerrarOtrasSesiones, cerrarSesionPropia, listarSesiones, validarSesion } from '../../server/services/sesiones'
import { prisma } from '../../server/utils/prisma'
import { crearUsuarioPrueba, ctxPrueba } from './helpers'

describe('sesiones', () => {
  it('una sesión abierta es válida y registra la actividad', async () => {
    const u = await crearUsuarioPrueba()
    const id = await abrirSesion(u.id, { ...ctxPrueba, userAgent: 'Mozilla/5.0 (iPhone) Safari/604.1' })
    expect(await validarSesion(id, u.id, 0)).toBe(true)
    // Otra persona no puede usar el id de una sesión ajena
    const otro = await crearUsuarioPrueba()
    expect(await validarSesion(id, otro.id, 0)).toBe(false)

    const lista = await listarSesiones(u.id, id)
    expect(lista).toHaveLength(1)
    expect(lista[0]).toMatchObject({ id, actual: true, dispositivo: 'Safari en iPhone' })
  })

  it('vence por inactividad (60 min por defecto) y por vida máxima', async () => {
    const u = await crearUsuarioPrueba()
    const a = await abrirSesion(u.id, ctxPrueba)
    expect(await validarSesion(a, u.id, 0, new Date(Date.now() + 61 * 60_000))).toBe(false)
    expect(await prisma.sesion.findUniqueOrThrow({ where: { id: a } })).toMatchObject({ motivoCierre: 'INACTIVIDAD' })

    const b = await abrirSesion(u.id, ctxPrueba)
    await prisma.sesion.update({ where: { id: b }, data: { creadaEn: new Date(Date.now() - VIDA_MAXIMA_MS - 1000) } })
    expect(await validarSesion(b, u.id, 0)).toBe(false)
  })

  it('cambiar la versión de sesión o desactivar al usuario la invalida', async () => {
    const u = await crearUsuarioPrueba()
    const s = await abrirSesion(u.id, ctxPrueba)
    expect(await validarSesion(s, u.id, 1)).toBe(false)
    await prisma.usuario.update({ where: { id: u.id }, data: { activo: false } })
    expect(await validarSesion(s, u.id, 0)).toBe(false)
  })

  it('cerrar las demás conserva la actual', async () => {
    const u = await crearUsuarioPrueba()
    const ctx = { ...ctxPrueba, usuarioId: u.id }
    const actual = await abrirSesion(u.id, ctx)
    const otra1 = await abrirSesion(u.id, ctx)
    const otra2 = await abrirSesion(u.id, ctx)
    await cerrarSesionPropia(u.id, otra1, actual, ctx)
    await expect(cerrarSesionPropia(u.id, actual, actual, ctx)).rejects.toMatchObject({ statusCode: 400 })
    expect(await cerrarOtrasSesiones(u.id, actual, ctx)).toEqual({ cerradas: 1 })
    expect(await validarSesion(actual, u.id, 0)).toBe(true)
    expect(await validarSesion(otra2, u.id, 0)).toBe(false)
  })

  it('no se puede cerrar la sesión de otro usuario', async () => {
    const u = await crearUsuarioPrueba()
    const otro = await crearUsuarioPrueba()
    const ajena = await abrirSesion(otro.id, ctxPrueba)
    await expect(cerrarSesionPropia(u.id, ajena, undefined, ctxPrueba)).rejects.toMatchObject({ statusCode: 404 })
    expect(await validarSesion(ajena, otro.id, 0)).toBe(true)
  })

  it('cambiar la contraseña cierra las demás sesiones y avisa', async () => {
    const u = await crearUsuarioPrueba()
    const actual = await abrirSesion(u.id, ctxPrueba)
    const otra = await abrirSesion(u.id, ctxPrueba)
    await cambiarContrasena(u.id, { actual: 'Correcta-2026', nueva: 'Nueva-Clave-2026', confirmacion: 'Nueva-Clave-2026' }, { ...ctxPrueba, usuarioId: u.id }, actual)
    expect(await prisma.sesion.findUniqueOrThrow({ where: { id: otra } })).toMatchObject({ motivoCierre: 'CAMBIO_CONTRASENA' })
    expect(await prisma.sesion.findUniqueOrThrow({ where: { id: actual } })).toMatchObject({ cerradaEn: null })
    expect(await prisma.notificacion.count({ where: { usuarioId: u.id, titulo: 'Contraseña actualizada' } })).toBe(1)
  })
})
