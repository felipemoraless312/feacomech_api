import { nuevoComentarioSchema } from '~~/shared/muro-jornadas'
import { comentar, huellaDe } from '~~/server/services/muro-jornadas'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  return comentar(id, huellaDe(event), await leerCuerpo(event, nuevoComentarioSchema))
})
