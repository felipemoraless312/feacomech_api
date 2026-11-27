import { emitirBoleto } from '~~/server/services/muro-jornadas'

/** Boleto firmado para publicar y comentar (se pide al abrir la página). */
export default defineEventHandler(() => ({ boleto: emitirBoleto() }))
