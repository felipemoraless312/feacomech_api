import { DEFINICION_PARAMETROS, type ClaveParametro, type ValorParametro } from '../../shared/parametros'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { invalidarParametros, obtenerParametro } from '../utils/parametros'
import { prisma } from '../utils/prisma'

export async function obtenerConfiguracion() {
  return {
    institucion: await obtenerParametro('institucion'),
    sesionInactividadMinutos: await obtenerParametro('sesionInactividadMinutos'),
  }
}

/** Guarda un parámetro (ya validado con su esquema) y deja constancia en la bitácora. */
export async function guardarParametro<K extends ClaveParametro>(clave: K, valor: ValorParametro<K>, ctx: ContextoAuditoria) {
  const def = DEFINICION_PARAMETROS[clave]
  await prisma.$transaction(async (tx) => {
    const antes = await tx.parametro.findUnique({ where: { clave } })
    await tx.parametro.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor, descripcion: def.descripcion },
    })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: `Parametro.${clave}`, entidadId: clave, antes: antes?.valor, despues: valor })
  })
  invalidarParametros()
}
