import { misMembresias } from '~~/server/services/membresias'

/** Historial de afiliaciones del usuario. */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return misMembresias(usuario.id)
})
