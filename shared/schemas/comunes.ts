import { z } from 'zod'

/** Texto opcional: vacío → null. */
export const opcional = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres`).optional().nullable().transform(v => (v ? v : null))

export const requerido = (max: number) =>
  z.string().trim().min(1, 'Requerido').max(max, `Máximo ${max} caracteres`)

export const telefono = z.string().trim().max(20).optional().nullable()
  .transform(v => (v ? v : null))
  .refine(v => !v || /^[\d\s()+-]{7,20}$/.test(v), 'Teléfono no válido')

/** Cédula profesional (SEP): de 7 a 8 dígitos. */
export const cedula = z.string().trim().optional().nullable()
  .transform(v => (v ? v.replace(/\s/g, '') : null))
  .refine(v => !v || /^\d{7,8}$/.test(v), 'La cédula tiene 7 u 8 dígitos')

export const paginacion = {
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(25),
}

export const booleanoQuery = z.enum(['true', 'false']).optional().transform(v => (v === undefined ? undefined : v === 'true'))

export const motivoSchema = z.object({ motivo: z.string().trim().min(3, 'Escriba el motivo').max(500) })

/** Estado de formulario: los campos opcionales se capturan como "" (el esquema los convierte a null). */
export type EstadoFormulario<T> = { [K in keyof T]: Exclude<T[K], null> }

export interface Pagina<T> {
  total: number
  pagina: number
  porPagina: number
  datos: T[]
}
