import { noticiasPublicasQuery } from '~~/shared/schemas/portal'
import { noticiasPublicas } from '~~/server/services/noticias'

export default defineEventHandler(event => noticiasPublicas(leerQuery(event, noticiasPublicasQuery)))
