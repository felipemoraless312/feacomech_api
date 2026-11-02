import { organizacionesDisponibles } from '~~/server/services/membresias'

/** Organizaciones a las que un profesional puede solicitar afiliarse (cualquier usuario activo). */
export default defineEventHandler(async (event) => {
  await requireUsuarioActivo(event)
  return organizacionesDisponibles()
})
