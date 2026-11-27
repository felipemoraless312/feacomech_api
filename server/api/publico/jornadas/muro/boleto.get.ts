import { emitirBoleto, huellaDe } from '~~/server/services/muro-jornadas'

/** Boleto firmado para publicar y comentar (se pide al abrir la página). */
export default defineEventHandler(event => ({ boleto: emitirBoleto(huellaDe(event)) }))
