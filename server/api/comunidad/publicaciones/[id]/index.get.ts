import { obtenerPublicacion } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return obtenerPublicacion(usuario.id, idDeRuta(event))
})
