import type { H3Event } from 'h3'
import type { z } from 'zod'

/** Valida con Zod; si falla responde 400 con `data.campos = { "ruta.del.campo": "mensaje" }`. */
export function validar<S extends z.ZodType>(schema: S, datos: unknown): z.output<S> {
  const r = schema.safeParse(datos)
  if (r.success) return r.data
  const campos: Record<string, string> = {}
  for (const issue of r.error.issues) {
    const ruta = issue.path.join('.') || '_'
    campos[ruta] ??= issue.message
  }
  throw createError({ statusCode: 400, message: 'Revise los datos capturados', data: { campos } })
}

export async function leerCuerpo<S extends z.ZodType>(event: H3Event, schema: S): Promise<z.output<S>> {
  return validar(schema, await readBody(event).catch(() => undefined))
}

export function leerQuery<S extends z.ZodType>(event: H3Event, schema: S): z.output<S> {
  return validar(schema, getQuery(event))
}
