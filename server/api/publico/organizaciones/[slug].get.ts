import { fichaPublica } from '~~/server/services/organizaciones'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) throw createError({ statusCode: 404, message: 'No encontrada' })
  return fichaPublica(slug)
})
