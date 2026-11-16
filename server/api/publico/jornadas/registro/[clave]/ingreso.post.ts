import { ingresoAsistenteSchema } from '~~/shared/registro-jornadas'
import { exigirClave, ingresoAsistente } from '~~/server/services/registro-asistentes'

/** Ingreso de hoy de alguien ya registrado (con su correo o con el pase guardado en su teléfono). */
export default defineEventHandler(async (event) => {
  exigirClave(getRouterParam(event, 'clave'))
  exigirFrecuencia(`ingreso-jornadas:${contextoDe(event).ip}`, 300, 10 * 60_000)
  return ingresoAsistente(await leerCuerpo(event, ingresoAsistenteSchema))
})
