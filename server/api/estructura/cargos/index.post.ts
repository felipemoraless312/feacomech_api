import { cargoSchema } from '~~/shared/schemas/estructura'
import { ambitoDeEntidad, guardarCargo } from '~~/server/services/estructura'

export default defineEventHandler(async (event) => {
  const datos = await leerCuerpo(event, cargoSchema)
  const { ctx } = await exigirEstructura(event, await ambitoDeEntidad('organo', datos.organoId))
  setResponseStatus(event, 201)
  return guardarCargo(null, datos, ctx)
})
