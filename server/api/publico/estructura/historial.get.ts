import { historialPublico } from '~~/server/services/estructura'

/** Mesas directivas de periodos anteriores. */
export default defineEventHandler(() => historialPublico(null))
