import { loginSchema } from '../../../shared/schemas/auth'
import { iniciarSesion } from '../../services/auth'
import { abrirSesion } from '../../services/sesiones'

export default defineEventHandler(async (event) => {
  const ctx = contextoDe(event)
  // Además del bloqueo por cuenta (5 intentos), un límite por IP frena el barrido de cuentas.
  exigirFrecuencia(`login:${ctx.ip}`, 30, 15 * 60_000)
  const datos = await leerCuerpo(event, loginSchema)
  const usuario = await iniciarSesion(datos, ctx)
  const sesionId = await abrirSesion(usuario.id, ctx)
  await replaceUserSession(event, { user: usuario, sesionId })
  return { usuario }
})
