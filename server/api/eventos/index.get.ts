import { eventosParaUsuario } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return eventosParaUsuario(usuario.id)
})
