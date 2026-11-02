import { z } from 'zod'

export const correoSchema = z.string().trim().toLowerCase().min(1, 'Escriba su correo').max(160).email('Correo no válido')

export const loginSchema = z.object({
  email: correoSchema,
  password: z.string().min(1, 'Escriba su contraseña').max(200),
})
export type LoginInput = z.infer<typeof loginSchema>

export const politicaContrasena = z
  .string()
  .min(10, 'Mínimo 10 caracteres')
  .max(200, 'Máximo 200 caracteres')
  .regex(/\p{L}/u, 'Debe incluir al menos una letra')
  .regex(/\d/, 'Debe incluir al menos un número')

export const cambiarPasswordSchema = z
  .object({
    actual: z.string().min(1, 'Escriba su contraseña actual'),
    nueva: politicaContrasena,
    confirmacion: z.string(),
  })
  .refine(d => d.nueva === d.confirmacion, { path: ['confirmacion'], message: 'Las contraseñas no coinciden' })
  .refine(d => d.nueva !== d.actual, { path: ['nueva'], message: 'Debe ser distinta de la contraseña actual' })
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>

export const recuperarSchema = z.object({ email: correoSchema })
export type RecuperarInput = z.infer<typeof recuperarSchema>

/** Definir contraseña con un enlace de recuperación o de invitación. */
export const restablecerSchema = z
  .object({
    token: z.string().regex(/^[\w-]{43}$/, 'Enlace inválido'),
    nueva: politicaContrasena,
    confirmacion: z.string(),
  })
  .refine(d => d.nueva === d.confirmacion, { path: ['confirmacion'], message: 'Las contraseñas no coinciden' })
export type RestablecerInput = z.infer<typeof restablecerSchema>
