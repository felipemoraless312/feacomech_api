import { listarVinculos } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  await requirePermiso(event, 'contenido.administrar')
  return listarVinculos()
})
