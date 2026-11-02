import { describe, expect, it } from 'vitest'
import { MAX_RECUPERACIONES_HORA, VIGENCIA_MS, consultarToken, enviarInvitacion, solicitarRecuperacion, usarToken } from '../../server/services/accesos'
import { iniciarSesion } from '../../server/services/auth'
import { abrirSesion, validarSesion } from '../../server/services/sesiones'
import { bandejaLocal } from '../../server/utils/correo'
import { prisma } from '../../server/utils/prisma'
import { crearUsuarioPrueba, ctxPrueba, unico } from './helpers'

/** Token del último correo enviado a `email` (el enlace lleva ?token=…). */
function tokenDelCorreo(email: string) {
  const correo = bandejaLocal.findLast(c => c.para === email)
  return correo?.texto.match(/token=([\w-]{43})/)?.[1]
}

const nueva = 'Otra-Clave-2026'

describe('recuperación de contraseña', () => {
  it('envía un enlace de un solo uso que cambia la contraseña y cierra las sesiones', async () => {
    const u = await crearUsuarioPrueba()
    const sesion = await abrirSesion(u.id, ctxPrueba)
    await solicitarRecuperacion(u.email, ctxPrueba)
    const token = tokenDelCorreo(u.email)!
    expect(token).toHaveLength(43)
    expect(await consultarToken(token)).toMatchObject({ valido: true, tipo: 'RECUPERACION', email: u.email })

    await usarToken({ token, nueva, confirmacion: nueva }, ctxPrueba)
    await expect(iniciarSesion({ email: u.email, password: nueva }, ctxPrueba)).resolves.toMatchObject({ id: u.id })
    expect(await validarSesion(sesion, u.id, 0)).toBe(false)

    // No se puede reutilizar
    await expect(usarToken({ token, nueva: 'Tercera-Clave-2026', confirmacion: 'Tercera-Clave-2026' }, ctxPrueba)).rejects.toMatchObject({ statusCode: 400 })
    expect(await consultarToken(token)).toEqual({ valido: false })
    // En la base sólo está el hash
    expect(await prisma.tokenAcceso.count({ where: { tokenHash: token } })).toBe(0)
  })

  it('no revela si el correo existe y no envía nada a cuentas inexistentes o inactivas', async () => {
    const antes = bandejaLocal.length
    await expect(solicitarRecuperacion(`nadie.${unico()}@feacomech.test`, ctxPrueba)).resolves.toBeUndefined()
    const inactivo = await crearUsuarioPrueba({ activo: false })
    await expect(solicitarRecuperacion(inactivo.email, ctxPrueba)).resolves.toBeUndefined()
    expect(bandejaLocal.length).toBe(antes)
  })

  it('el enlace vence a los 30 minutos', async () => {
    const u = await crearUsuarioPrueba()
    await solicitarRecuperacion(u.email, ctxPrueba)
    const token = tokenDelCorreo(u.email)!
    const despues = new Date(Date.now() + VIGENCIA_MS.RECUPERACION + 1000)
    await expect(usarToken({ token, nueva, confirmacion: nueva }, ctxPrueba, despues)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('un enlace nuevo anula el anterior', async () => {
    const u = await crearUsuarioPrueba()
    await solicitarRecuperacion(u.email, ctxPrueba)
    const primero = tokenDelCorreo(u.email)!
    await solicitarRecuperacion(u.email, ctxPrueba)
    const segundo = tokenDelCorreo(u.email)!
    expect(segundo).not.toBe(primero)
    expect(await consultarToken(primero)).toEqual({ valido: false })
    expect((await consultarToken(segundo)).valido).toBe(true)
  })

  it(`limita a ${MAX_RECUPERACIONES_HORA} enlaces por hora`, async () => {
    const u = await crearUsuarioPrueba()
    for (let i = 0; i < MAX_RECUPERACIONES_HORA + 2; i++) await solicitarRecuperacion(u.email, ctxPrueba)
    expect(await prisma.tokenAcceso.count({ where: { usuarioId: u.id } })).toBe(MAX_RECUPERACIONES_HORA)
  })
})

describe('invitación', () => {
  it('sin SMTP devuelve el enlace para entregarlo; activa la cuenta y la notifica', async () => {
    const u = await crearUsuarioPrueba()
    const r = await enviarInvitacion(u.id, ctxPrueba)
    expect(r.enviado).toBe(false)
    const token = r.enviado ? '' : r.enlace!.split('token=')[1]!
    expect(await consultarToken(token)).toMatchObject({ valido: true, tipo: 'INVITACION' })

    await usarToken({ token, nueva, confirmacion: nueva }, ctxPrueba)
    expect(await prisma.notificacion.count({ where: { usuarioId: u.id, tipo: 'SEGURIDAD' } })).toBe(1)
  })

  it('no invita a usuarios desactivados', async () => {
    const u = await crearUsuarioPrueba({ activo: false })
    await expect(enviarInvitacion(u.id, ctxPrueba)).rejects.toMatchObject({ statusCode: 400 })
  })
})
