import { directorioPublico } from '~~/server/services/organizaciones'

/** Colegios y asociaciones afiliados que se publican en el portal. */
export default defineEventHandler(() => directorioPublico())
