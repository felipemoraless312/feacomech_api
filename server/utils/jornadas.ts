import type { H3Event } from 'h3'

/** El registro de las Jornadas es de la Federación: exige `evento.gestionar` con alcance total. */
export async function requireGestionJornadas(event: H3Event) {
  const r = await requirePermiso(event, 'evento.gestionar')
  if (r.alcance !== 'TOTAL') throw createError({ statusCode: 403, message: 'No tiene permiso para esta acción' })
  return r
}
