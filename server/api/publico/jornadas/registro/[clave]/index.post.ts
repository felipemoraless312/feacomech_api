import { registroAsistenteSchema } from '~~/shared/registro-jornadas'
import { exigirClave, registrarAsistente } from '~~/server/services/registro-asistentes'

/** Registro en sede desde el teléfono del asistente: lo da de alta y marca su ingreso de hoy. */
export default defineEventHandler(async (event) => {
  exigirClave(getRouterParam(event, 'clave'))
  // Holgado: en la sede muchas personas pueden salir a internet por la misma IP (wifi del recinto).
  exigirFrecuencia(`registro-jornadas:${contextoDe(event).ip}`, 300, 10 * 60_000)
  return registrarAsistente(await leerCuerpo(event, registroAsistenteSchema))
})
