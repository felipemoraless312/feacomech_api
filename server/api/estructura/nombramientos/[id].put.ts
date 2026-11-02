import { nombramientoSchema } from '~~/shared/schemas/estructura'
import { ambitoDeEntidad, guardarNombramiento } from '~~/server/services/estructura'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  const datos = await leerCuerpo(event, nombramientoSchema)
  const { ctx, ambito } = await exigirEstructura(event, await ambitoDeEntidad('nombramiento', id))
  // Sólo la Federación publica o retira un nombramiento del portal.
  if (!ambito.todas) datos.publicado = (await prisma.nombramiento.findUnique({ where: { id }, select: { publicado: true } }))?.publicado ?? false
  return guardarNombramiento(id, datos, ctx)
})
