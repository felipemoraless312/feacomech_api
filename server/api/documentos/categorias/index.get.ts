import { listarCategorias } from '~~/server/services/documentos'

export default defineEventHandler(async (event) => {
  await requireUsuarioActivo(event)
  return listarCategorias(getQuery(event).todas === 'true')
})
