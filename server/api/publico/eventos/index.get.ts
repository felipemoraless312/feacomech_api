import { eventosPublicosQuery } from '~~/shared/schemas/eventos'
import { eventosPublicos } from '~~/server/services/eventos'

export default defineEventHandler(event => eventosPublicos(leerQuery(event, eventosPublicosQuery)))
