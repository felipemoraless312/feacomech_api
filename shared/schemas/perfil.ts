import { z } from 'zod'
import { cedula, opcional, requerido, telefono } from './comunes'

/** Lo que el propio usuario edita de su cuenta y perfil profesional. */
export const perfilSchema = z.object({
  telefono,
  cedulaProfesional: cedula,
  especialidadId: z.uuid().optional().nullable().transform(v => v ?? null),
  subespecialidadId: z.uuid().optional().nullable().transform(v => v ?? null),
  cedulaEspecialidad: cedula,
  municipioId: z.uuid().optional().nullable().transform(v => v ?? null),
  institucionTrabajo: opcional(160),
  mostrarInstitucion: z.boolean().default(false),
  cargoInstitucional: opcional(120),
  publicarDirectorio: z.boolean().default(false),
}).refine(d => !d.subespecialidadId || d.especialidadId, { path: ['subespecialidadId'], message: 'Elija primero la especialidad' })
export type PerfilInput = z.input<typeof perfilSchema>
export type PerfilDatos = z.output<typeof perfilSchema>

export const especialidadSchema = z.object({
  nombre: requerido(120),
  padreId: z.uuid().optional().nullable().transform(v => v ?? null),
  activo: z.boolean().default(true),
})
export type EspecialidadInput = z.input<typeof especialidadSchema>

