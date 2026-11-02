import { eventoPublico } from '~~/server/services/eventos'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) throw createError({ statusCode: 404, message: 'No encontrado' })
  return eventoPublico(slug)
})
