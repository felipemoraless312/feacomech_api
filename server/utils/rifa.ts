import type { H3Event } from 'h3'
import { z } from 'zod'
import { hoyMexico } from '~~/shared/registro-jornadas'
import { exigirSuperadmin } from '../services/rifa-jornadas'

/** La rifa de las Jornadas es sólo del superadministrador. */
export async function requireRifa(event: H3Event) {
  const r = await requireUsuarioActivo(event)
  await exigirSuperadmin(r.usuario.id)
  return r
}

/** Día de la rifa: "AAAA-MM-DD"; por omisión, hoy en Ciudad de México. */
export const fechaRifaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida').optional().transform(f => f ?? hoyMexico())
