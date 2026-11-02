import type { AccionAuditoria } from '../generated/prisma/enums'
import type { Db } from './prisma'

/** Quién hizo la acción y desde dónde. Se arma en el handler con `contextoDe(event)`. */
export interface ContextoAuditoria {
  usuarioId?: string | null
  ip?: string | null
  userAgent?: string | null
}

export interface DatosAuditoria {
  accion: AccionAuditoria
  /** "Usuario", "Rol.permisos", "Organizacion"… */
  entidad: string
  entidadId: string
  antes?: unknown
  despues?: unknown
  motivo?: string | null
}

/** Convierte Decimal, Date y BigInt a valores JSON (Decimal y Date ya traen toJSON). */
function aJson(valor: unknown) {
  if (valor === undefined || valor === null) return undefined
  return JSON.parse(JSON.stringify(valor, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)))
}

const OCULTOS = new Set(['passwordHash', 'tokenHash'])

function sinSecretos(valor: unknown): unknown {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return valor
  return Object.fromEntries(Object.entries(valor).filter(([k]) => !OCULTOS.has(k)))
}

/**
 * Inserta un renglón en la bitácora. Llamar con el `tx` de la transacción que hace
 * el cambio para que ambos se confirmen o se reviertan juntos.
 */
export async function auditar(db: Db, ctx: ContextoAuditoria, datos: DatosAuditoria) {
  await db.auditoria.create({
    data: {
      usuarioId: ctx.usuarioId ?? null,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent?.slice(0, 500) ?? null,
      accion: datos.accion,
      entidad: datos.entidad,
      entidadId: datos.entidadId,
      antes: aJson(sinSecretos(datos.antes)),
      despues: aJson(sinSecretos(datos.despues)),
      motivo: datos.motivo ?? null,
    },
  })
}
