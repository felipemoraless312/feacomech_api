import { quitarFoto } from '../../services/perfil'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  return quitarFoto(usuario.id, ctx)
})
