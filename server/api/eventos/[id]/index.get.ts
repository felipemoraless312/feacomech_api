import { eventoParaUsuario } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return eventoParaUsuario(idDeRuta(event), usuario.id)
})
