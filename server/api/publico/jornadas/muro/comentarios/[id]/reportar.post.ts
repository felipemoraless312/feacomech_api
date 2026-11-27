import { huellaDe, reportarComentario } from '~~/server/services/muro-jornadas'

export default defineEventHandler(event => reportarComentario(idDeRuta(event), huellaDe(event)))
