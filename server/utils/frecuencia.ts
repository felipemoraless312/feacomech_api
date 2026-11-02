// Límite de frecuencia en memoria (ventana fija por clave), p. ej. intentos de inicio de
// sesión o solicitudes de recuperación por IP. Suficiente para una sola instancia; con
// varias instancias habría que moverlo a la base o a Redis.
import { createError } from 'h3'

const ventanas = new Map<string, { cuenta: number, reinicia: number }>()

/**
 * Registra un intento para `clave`. Devuelve `true` si se permite y `false` si ya se
 * superaron `maximo` intentos dentro de `ventanaMs`.
 */
export function permitirIntento(clave: string, maximo: number, ventanaMs: number, ahora = Date.now()): boolean {
  const v = ventanas.get(clave)
  if (!v || v.reinicia <= ahora) {
    ventanas.set(clave, { cuenta: 1, reinicia: ahora + ventanaMs })
    if (ventanas.size > 10_000) limpiar(ahora)
    return true
  }
  v.cuenta++
  return v.cuenta <= maximo
}

/** Lanza 429 si se superó el límite. */
export function exigirFrecuencia(clave: string, maximo: number, ventanaMs: number) {
  if (!permitirIntento(clave, maximo, ventanaMs)) {
    throw createError({ statusCode: 429, message: 'Demasiados intentos. Espere unos minutos e intente de nuevo.' })
  }
}

function limpiar(ahora: number) {
  for (const [k, v] of ventanas) if (v.reinicia <= ahora) ventanas.delete(k)
}
