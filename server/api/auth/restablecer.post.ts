import { restablecerSchema } from '../../../shared/schemas/auth'
import { usarToken } from '../../services/accesos'
import { abrirPuerta } from '../../utils/puerta'

export default defineEventHandler(async (event) => {
  const ctx = contextoDe(event)
  exigirFrecuencia(`restablecer:${ctx.ip}`, 10, 15 * 60_000)
  const datos = await leerCuerpo(event, restablecerSchema)
  const r = await usarToken(datos, ctx)
  await clearUserSession(event)
  abrirPuerta(event)
  return r
})
