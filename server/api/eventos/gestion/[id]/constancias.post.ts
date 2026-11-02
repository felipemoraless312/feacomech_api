import { emitirConstanciasSchema } from '~~/shared/schemas/eventos'
import { emitirConstancias } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { ctx, ambito } = await requirePermiso(event, 'constancia.emitir')
  const { inscripcionIds } = await leerCuerpo(event, emitirConstanciasSchema)
  return emitirConstancias(idDeRuta(event), inscripcionIds, ambito, ctx)
})
