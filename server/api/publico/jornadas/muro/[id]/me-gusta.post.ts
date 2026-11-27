import { darMeGusta, huellaDe } from '~~/server/services/muro-jornadas'

export default defineEventHandler(event => darMeGusta(idDeRuta(event), huellaDe(event)))
