import { accesoDeUsuario } from '../../services/permisos'

/** Usuario de la sesión, sus roles y sus permisos efectivos (el cliente los usa para menús y botones). */
export default defineEventHandler(async (event) => {
  const usuario = await requireUsuario(event)
  const { roles, permisos, organizaciones } = await accesoDeUsuario(usuario.id)
  return { usuario, roles, permisos, organizaciones }
})
