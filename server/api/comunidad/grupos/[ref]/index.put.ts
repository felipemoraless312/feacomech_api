import { grupoSchema } from '~~/shared/schemas/comunidad'
import { actualizarGrupo } from '~~/server/services/comunidad'

/** [ref] = id del grupo. */
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const datos = await leerCuerpo(event, grupoSchema)
  await actualizarGrupo(usuario.id, idDeRuta(event, 'ref'), datos, ctx)
  return { ok: true }
})
