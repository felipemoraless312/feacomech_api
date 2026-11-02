import { describe, expect, it } from 'vitest'
import { MAX_INTENTOS, cambiarContrasena, iniciarSesion } from '../../server/services/auth'
import { prisma } from '../../server/utils/prisma'
import { crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

const login = (email: string, password: string, ahora?: Date) => iniciarSesion({ email, password }, ctxPrueba, ahora)

describe('iniciarSesion', () => {
  it('entra con credenciales correctas y lo registra en la bitácora', async () => {
    const u = await crearUsuarioPrueba()
    const sesion = await login(u.email, 'Correcta-2026')
    expect(sesion).toEqual({ id: u.id, email: u.email, nombre: 'Prueba Integración', debeCambiarPassword: false, versionSesion: 0 })
    expect(await prisma.auditoria.count({ where: { entidadId: u.id, accion: 'LOGIN' } })).toBe(1)
  })

  it('mismo mensaje para correo inexistente y contraseña incorrecta', async () => {
    const u = await crearUsuarioPrueba()
    const mensaje = 'Correo o contraseña incorrectos'
    await expect(login(`nadie.${unico()}@feacomech.test`, 'x')).rejects.toMatchObject({ statusCode: 401, message: mensaje })
    await expect(login(u.email, 'incorrecta')).rejects.toMatchObject({ statusCode: 401, message: mensaje })
  })

  it(`bloquea 15 minutos tras ${MAX_INTENTOS} intentos fallidos`, async () => {
    const u = await crearUsuarioPrueba()
    const t0 = new Date()
    for (let i = 0; i < MAX_INTENTOS; i++) await expect(login(u.email, 'mal', t0)).rejects.toMatchObject({ statusCode: 401 })

    await expect(login(u.email, 'Correcta-2026', t0)).rejects.toMatchObject({ statusCode: 423 })
    const despues = new Date(t0.getTime() + 16 * 60_000)
    await expect(login(u.email, 'Correcta-2026', despues)).resolves.toMatchObject({ id: u.id })
    expect(await prisma.usuario.findUniqueOrThrow({ where: { id: u.id } })).toMatchObject({ intentosFallidos: 0, bloqueadoHasta: null })
  })

  it('un usuario desactivado no entra', async () => {
    const u = await crearUsuarioPrueba({ activo: false })
    await expect(login(u.email, 'Correcta-2026')).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('cambiarContrasena', () => {
  it('exige la actual, quita la marca de cambio obligatorio e invalida otras sesiones', async () => {
    const u = await crearUsuarioPrueba()
    const ctx = { ...ctxPrueba, usuarioId: u.id }
    await expect(cambiarContrasena(u.id, { actual: 'mal', nueva: 'Nueva-Clave-2026', confirmacion: 'Nueva-Clave-2026' }, ctx))
      .rejects.toMatchObject({ statusCode: 400 })

    const sesion = await cambiarContrasena(u.id, { actual: 'Correcta-2026', nueva: 'Nueva-Clave-2026', confirmacion: 'Nueva-Clave-2026' }, ctx)
    expect(sesion).toMatchObject({ debeCambiarPassword: false, versionSesion: 1 })
    await expect(login(u.email, 'Nueva-Clave-2026')).resolves.toBeTruthy()
  })
})
