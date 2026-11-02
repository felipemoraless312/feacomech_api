import { z } from 'zod'
import { fijarPublicacion } from '~~/server/services/comunidad'

const cuerpo = z.object({ fijada: z.boolean() })

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { fijada } = await leerCuerpo(event, cuerpo)
  await fijarPublicacion(usuario.id, idDeRuta(event), fijada, ctx)
  return { ok: true }
})
