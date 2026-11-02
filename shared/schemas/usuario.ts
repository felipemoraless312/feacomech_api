import { z } from 'zod'
import { correoSchema } from './auth'
import { booleanoQuery, opcional, paginacion, requerido, telefono } from './comunes'

/** Datos que administra la Federación (identidad y acceso). */
export const usuarioAdminSchema = z.object({
  email: correoSchema,
  nombre: requerido(80),
  apellidoPaterno: requerido(80),
  apellidoMaterno: opcional(80),
  telefono,
  rolIds: z.array(z.uuid()).max(20).default([]),
})
export type UsuarioAdminInput = z.input<typeof usuarioAdminSchema>
export type UsuarioAdminDatos = z.output<typeof usuarioAdminSchema>

export const usuarioListaQuery = z.object({
  q: z.string().trim().max(100).optional(),
  activo: booleanoQuery,
  rolId: z.uuid().optional(),
  ...paginacion,
})
