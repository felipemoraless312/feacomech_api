import { TZDate } from '@date-fns/tz'
import { ZONA_HORARIA } from '../../shared/texto'
import type { Tx } from './prisma'

interface FormatoFolio {
  prefijo: string
  /** Reinicia el consecutivo cada año (y lo incluye en el folio). */
  anual: boolean
  digitos: number
}

// Se agregan tipos conforme los módulos los necesiten (constancias, credenciales…).
export const FORMATO_FOLIO = {
  CONSTANCIA: { prefijo: 'CONST', anual: true, digitos: 6 },
  CREDENCIAL: { prefijo: 'CRED', anual: false, digitos: 6 },
} as const satisfies Record<string, FormatoFolio>

export type TipoFolio = keyof typeof FORMATO_FOLIO

/**
 * Siguiente folio consecutivo, p. ej. "CRED-000123" o "CONST-2026-000456".
 *
 * Debe llamarse dentro de la transacción que crea el documento: el UPSERT bloquea la fila
 * del contador hasta el COMMIT, así que dos peticiones simultáneas nunca obtienen el mismo
 * número y, si la transacción falla, el número no se pierde (sin huecos).
 */
export async function siguienteFolio(tx: Tx, tipo: TipoFolio, ahora: Date = new Date()): Promise<string> {
  const f: FormatoFolio = FORMATO_FOLIO[tipo]
  const anio = f.anual ? new TZDate(ahora.getTime(), ZONA_HORARIA).getFullYear() : 0

  const [fila] = await tx.$queryRaw<{ ultimo: number, prefijo: string }[]>`
    INSERT INTO "Folio" ("tipo", "anio", "prefijo", "ultimo")
    VALUES (${tipo}, ${anio}, ${f.prefijo}, 1)
    ON CONFLICT ("tipo", "anio") DO UPDATE SET "ultimo" = "Folio"."ultimo" + 1
    RETURNING "ultimo", "prefijo"`

  const numero = String(fila!.ultimo).padStart(f.digitos, '0')
  return f.anual ? `${fila!.prefijo}-${anio}-${numero}` : `${fila!.prefijo}-${numero}`
}
