import { recuperarSchema } from '../../../shared/schemas/auth'
import { solicitarRecuperacion } from '../../services/accesos'

// Siempre responde lo mismo, exista o no el correo.
export default defineEventHandler(async (event) => {
  const ctx = contextoDe(event)
  exigirFrecuencia(`recuperar:${ctx.ip}`, 5, 15 * 60_000)
  const { email } = await leerCuerpo(event, recuperarSchema)
  await solicitarRecuperacion(email, ctx)
  return { ok: true }
})
