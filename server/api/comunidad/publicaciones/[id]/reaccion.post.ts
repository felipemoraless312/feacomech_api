import { reaccionSchema } from '~~/shared/schemas/comunidad'
import { reaccionar } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const { tipo } = await leerCuerpo(event, reaccionSchema)
  await reaccionar(usuario.id, { publicacionId: idDeRuta(event) }, tipo)
  return { ok: true }
})
