import { perfilSchema } from '../../../shared/schemas/perfil'
import { actualizarPerfil } from '../../services/perfil'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const datos = await leerCuerpo(event, perfilSchema)
  return actualizarPerfil(usuario.id, datos, ctx)
})
