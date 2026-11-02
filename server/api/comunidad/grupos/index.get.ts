import { listarGrupos } from '~~/server/services/comunidad'

export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  return listarGrupos(usuario.id)
})
