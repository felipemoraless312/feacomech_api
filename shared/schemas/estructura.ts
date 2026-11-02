import { z } from 'zod'
import { opcional, requerido } from './comunes'

export const TIPOS_ORGANO = ['MESA_DIRECTIVA', 'CONSEJO_CONSULTIVO', 'COMISION', 'OTRO'] as const
export const ESTADOS_NOMBRAMIENTO = ['VIGENTE', 'CONCLUIDO', 'REVOCADO'] as const

export const NOMBRE_ORGANO: Record<(typeof TIPOS_ORGANO)[number], string> = {
  MESA_DIRECTIVA: 'Mesa directiva',
  CONSEJO_CONSULTIVO: 'Consejo consultivo',
  COMISION: 'Comisión',
  OTRO: 'Otro órgano',
}
export const NOMBRE_NOMBRAMIENTO: Record<(typeof ESTADOS_NOMBRAMIENTO)[number], string> = {
  VIGENTE: 'Vigente',
  CONCLUIDO: 'Concluido',
  REVOCADO: 'Revocado',
}

const fecha = z.iso.date('Fecha no válida')
const fechaOpcional = z.union([fecha, z.literal('')]).optional().nullable().transform(v => (v ? v : null))
const idOpcional = z.uuid().optional().nullable().transform(v => v ?? null)

/** Ámbito de la estructura: la Federación (sin organización) o una organización. */
export const ambitoEstructuraQuery = z.object({ organizacionId: z.uuid().optional() })

export const organoSchema = z.object({
  organizacionId: idOpcional,
  tipo: z.enum(TIPOS_ORGANO),
  nombre: requerido(120),
  descripcion: opcional(1000),
  orden: z.number().int().min(0).max(999).default(0),
  activo: z.boolean().default(true),
})
export type OrganoInput = z.input<typeof organoSchema>

export const cargoSchema = z.object({
  organoId: z.uuid('Elija el órgano'),
  nombre: requerido(120),
  descripcion: opcional(1000),
  orden: z.number().int().min(0).max(999).default(0),
  superiorId: idOpcional,
  activo: z.boolean().default(true),
})
export type CargoInput = z.input<typeof cargoSchema>

export const periodoSchema = z.object({
  organizacionId: idOpcional,
  nombre: requerido(80),
  inicio: fecha,
  fin: fechaOpcional,
  descripcion: opcional(1000),
}).refine(d => !d.fin || d.fin >= d.inicio, { path: ['fin'], message: 'Debe ser posterior al inicio' })
export type PeriodoInput = z.input<typeof periodoSchema>

export const nombramientoSchema = z.object({
  cargoId: z.uuid('Elija el cargo'),
  periodoId: idOpcional,
  usuarioId: idOpcional,
  nombrePersona: opcional(160),
  organizacionProcedenciaId: idOpcional,
  descripcion: opcional(2000),
  inicio: fecha,
  fin: fechaOpcional,
  estado: z.enum(ESTADOS_NOMBRAMIENTO).default('VIGENTE'),
  publicado: z.boolean().default(false),
})
  .refine(d => d.usuarioId || d.nombrePersona, { path: ['nombrePersona'], message: 'Elija un usuario o escriba el nombre de la persona' })
  .refine(d => !d.fin || d.fin >= d.inicio, { path: ['fin'], message: 'Debe ser posterior al inicio' })
export type NombramientoInput = z.input<typeof nombramientoSchema>

export const nombramientosQuery = z.object({
  organizacionId: z.uuid().optional(),
  periodoId: z.uuid().optional(),
  organoId: z.uuid().optional(),
  estado: z.enum(ESTADOS_NOMBRAMIENTO).optional(),
})
