import { nombramientoSchema } from '~~/shared/schemas/estructura'
import { ambitoDeEntidad, guardarNombramiento } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const datos = await leerCuerpo(event, nombramientoSchema)
  const { ctx, ambito } = await exigirEstructura(event, await ambitoDeEntidad('cargo', datos.cargoId))
  // Publicar en el portal requiere validación de la Federación (alcance total).
  if (!ambito.todas) datos.publicado = false
  setResponseStatus(event, 201)
  return guardarNombramiento(null, datos, ctx)
})
