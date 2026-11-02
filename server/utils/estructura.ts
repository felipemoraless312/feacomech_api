import type { H3Event } from 'h3'

/**
 * Exige `estructura.administrar` sobre un ámbito: la Federación (organizacionId null)
 * requiere alcance total; una organización, que sea una de las suyas.
 */
export async function exigirEstructura(event: H3Event, organizacionId: string | null) {
  if (organizacionId) return requirePermisoEn(event, 'estructura.administrar', organizacionId)
  const r = await requirePermiso(event, 'estructura.administrar')
  if (!r.ambito.todas) throw createError({ statusCode: 403, message: 'Sólo la Federación administra su propia estructura' })
  return r
}
