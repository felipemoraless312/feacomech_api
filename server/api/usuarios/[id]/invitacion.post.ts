import { enviarInvitacion } from '../../../services/accesos'

/**
 * Envía un enlace para que el usuario defina su contraseña (activar cuenta nueva o
 * restablecer el acceso). La contraseña nunca la ve el administrador.
 */
export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'usuario.administrar')
  return enviarInvitacion(idDeRuta(event), ctx)
})
