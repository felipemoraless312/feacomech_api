import type { H3Event } from 'h3'
import { createError } from 'h3'
import type { z } from 'zod'

/**
 * multipart/form-data con un campo "datos" (JSON validado con el esquema) y un archivo.
 * El archivo es opcional si `requerido` es false.
 */
export async function leerDatosYArchivo<S extends z.ZodType>(event: H3Event, schema: S, maxBytes: number, requerido = true) {
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (largo > maxBytes + 256 * 1024) throw createError({ statusCode: 413, message: `El archivo supera el máximo de ${Math.round(maxBytes / 1024 / 1024)} MB` })
  const partes = (await readMultipartFormData(event)) ?? []
  const json = partes.find(p => p.name === 'datos')?.data.toString('utf8')
  let crudo: unknown
  try {
    crudo = json ? JSON.parse(json) : undefined
  }
  catch {
    throw createError({ statusCode: 400, message: 'Datos no válidos' })
  }
  const datos = validar(schema, crudo)
  const parte = partes.find(p => p.name === 'archivo' && p.filename)
  if (requerido && !parte) throw createError({ statusCode: 400, message: 'Adjunte el archivo', data: { campos: { archivo: 'Requerido' } } })
  return { datos, archivo: parte ? { datos: parte.data, nombre: parte.filename! } : null }
}
