import { motivoSchema } from '~~/shared/schemas/comunes'
import { organizacionDeMembresia, solicitarBaja } from '~~/server/services/membresias'
import { exigirEnOrganizacion } from '~~/server/services/permisos'

/** La pide el propio integrante o un representante de la organización. */
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const id = idDeRuta(event)
  const m = await organizacionDeMembresia(id)
  if (m.usuarioId !== usuario.id) await exigirEnOrganizacion(usuario.id, 'afiliacion.solicitar', m.organizacionId)
  const { motivo } = await leerCuerpo(event, motivoSchema)
  await solicitarBaja(id, motivo, ctx)
  return { ok: true }
})
