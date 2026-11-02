import { cargoSchema } from '~~/shared/schemas/estructura'
import { ambitoDeEntidad, guardarCargo } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const datos = await leerCuerpo(event, cargoSchema)
  const actual = await ambitoDeEntidad('cargo', id)
  if (actual !== await ambitoDeEntidad('organo', datos.organoId)) throw createError({ statusCode: 400, message: 'El cargo no puede cambiar de ámbito' })
  const { ctx } = await exigirEstructura(event, actual)
  return guardarCargo(id, datos, ctx)
})
