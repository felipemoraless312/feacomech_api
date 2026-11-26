import { z } from 'zod'
import { elegiblesRifa } from '~~/server/services/rifa-jornadas'

/** Participantes de la rifa del día (quienes ingresaron y aún no ganan), en orden aleatorio. */
export default defineEventHandler(async (event) => {
  await requireRifa(event)
  const { fecha } = leerQuery(event, z.object({ fecha: fechaRifaSchema }))
  return elegiblesRifa(fecha)
})
