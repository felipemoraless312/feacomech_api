import { contactoSchema } from '~~/shared/schemas/portal'
import { recibirMensaje } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  const { ip } = contextoDe(event)
  exigirFrecuencia(`contacto:${ip}`, 5, 60 * 60_000)
  const datos = await leerCuerpo(event, contactoSchema)
  await recibirMensaje(datos, ip ?? null)
  return { ok: true }
})
