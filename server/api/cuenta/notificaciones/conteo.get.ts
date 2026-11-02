import { contarNoLeidas } from '../../../services/notificaciones'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return { noLeidas: await contarNoLeidas(usuario.id) }
})
