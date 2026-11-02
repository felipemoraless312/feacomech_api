import { obtenerMiCuenta } from '../../services/perfil'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return obtenerMiCuenta(usuario.id)
})
