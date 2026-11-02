import { salir } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  await salir(usuario.id, idDeRuta(event, 'ref'))
  return { ok: true }
})
