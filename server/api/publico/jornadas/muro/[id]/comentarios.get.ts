import { comentariosDe } from '~~/server/services/muro-jornadas'

export default defineEventHandler(event => comentariosDe(idDeRuta(event)))
