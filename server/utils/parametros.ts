import { DEFINICION_PARAMETROS, type ClaveParametro, type ValorParametro } from '../../shared/parametros'
import { prisma } from './prisma'

// Caché en memoria de corta duración: los parámetros se leen en casi cada petición
// (p. ej. la inactividad de sesión) y cambian muy rara vez.
const TTL_MS = 60_000
const cache = new Map<string, { valor: unknown, expira: number }>()

export function invalidarParametros() {
  cache.clear()
}

/** Valor del parámetro; si no existe o es inválido en BD, el valor por defecto. */
export async function obtenerParametro<K extends ClaveParametro>(clave: K): Promise<ValorParametro<K>> {
  const enCache = cache.get(clave)
  if (enCache && enCache.expira > Date.now()) return enCache.valor as ValorParametro<K>

  const def = DEFINICION_PARAMETROS[clave]
  const fila = await prisma.parametro.findUnique({ where: { clave } })
  const parsed = fila ? def.schema.safeParse(fila.valor) : undefined
  const valor = (parsed?.success ? parsed.data : def.defecto) as ValorParametro<K>

  cache.set(clave, { valor, expira: Date.now() + TTL_MS })
  return valor
}
