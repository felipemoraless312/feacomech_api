import { unirse } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return unirse(usuario.id, idDeRuta(event, 'ref'))
})
