import { solicitudPropiaSchema } from '~~/shared/schemas/organizacion'
import { solicitarAfiliacionPropia } from '~~/server/services/membresias'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const { organizacionId, comentario } = await leerCuerpo(event, solicitudPropiaSchema)
  setResponseStatus(event, 201)
  return solicitarAfiliacionPropia(usuario.id, organizacionId, comentario, ctx)
})
