import { z } from 'zod'
import { ganadoresRifa } from '~~/server/services/rifa-jornadas'

/** Ganadores del día, del más reciente al primero (con teléfono para verificar al entregar). */
export default defineEventHandler(async (event) => {
  await requireRifa(event)
  const { fecha } = leerQuery(event, z.object({ fecha: fechaRifaSchema }))
  return ganadoresRifa(fecha)
})
