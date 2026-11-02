import type { DatosInstitucion } from '#shared/parametros'

/** Datos institucionales públicos (nombre, contacto, misión…) para el portal. */
export function useInstitucion() {
  return useFetch<DatosInstitucion>('/api/publico/institucion', { key: 'institucion', dedupe: 'defer' })
}
