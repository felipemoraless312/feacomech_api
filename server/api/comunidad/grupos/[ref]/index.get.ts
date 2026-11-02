import { obtenerGrupo } from '~~/server/services/comunidad'

/** [ref] = slug del grupo. */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const slug = getRouterParam(event, 'ref') ?? ''
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) throw createError({ statusCode: 404, message: 'Grupo no encontrado' })
  return obtenerGrupo(usuario.id, slug)
})
