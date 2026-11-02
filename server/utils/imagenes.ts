import type { H3Event } from 'h3'
import { createError } from 'h3'

/** Lee la imagen del campo `campo` de un multipart/form-data, con tope de tamaño. */
export async function leerImagenSubida(event: H3Event, campo: string, maxBytes: number) {
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (largo > maxBytes + 64 * 1024) {
    throw createError({ statusCode: 413, message: `La imagen supera el máximo de ${Math.round(maxBytes / 1024 / 1024)} MB` })
  }
  const partes = await readMultipartFormData(event)
  const parte = partes?.find(p => p.name === campo && p.filename)
  if (!parte) throw createError({ statusCode: 400, message: 'Adjunte una imagen' })
  return { datos: parte.data, nombre: parte.filename ?? campo }
}
