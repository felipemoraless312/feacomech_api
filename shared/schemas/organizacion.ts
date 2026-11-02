import { z } from 'zod'
import { correoSchema } from './auth'
import { booleanoQuery, cedula, opcional, paginacion, requerido, telefono } from './comunes'

export const TIPOS_ORGANIZACION = ['COLEGIO', 'ASOCIACION'] as const
export const ESTADOS_AFILIACION = ['EN_TRAMITE', 'AFILIADA', 'SUSPENDIDA', 'BAJA'] as const
export const ESTADOS_MEMBRESIA = ['SOLICITADA', 'ACTIVA', 'RECHAZADA', 'BAJA'] as const

export const NOMBRE_TIPO: Record<(typeof TIPOS_ORGANIZACION)[number], string> = { COLEGIO: 'Colegio', ASOCIACION: 'Asociación' }
export const NOMBRE_AFILIACION: Record<(typeof ESTADOS_AFILIACION)[number], string> = {
  EN_TRAMITE: 'En trámite',
  AFILIADA: 'Afiliada',
  SUSPENDIDA: 'Suspendida',
  BAJA: 'Baja',
}
export const NOMBRE_MEMBRESIA: Record<(typeof ESTADOS_MEMBRESIA)[number], string> = {
  SOLICITADA: 'Solicitada',
  ACTIVA: 'Activa',
  RECHAZADA: 'Rechazada',
  BAJA: 'Baja',
}

const fecha = z.iso.date('Fecha no válida')
const fechaOpcional = z.union([fecha, z.literal('')]).optional().nullable().transform(v => (v ? v : null))
const url = z.string().trim().max(300).optional().nullable()
  .transform(v => (v ? v : null))
  .refine(v => !v || /^https:\/\/\S+$/.test(v), 'Debe iniciar con https://')
const correoOpcional = z.string().trim().toLowerCase().max(160).optional().nullable()
  .transform(v => (v ? v : null))
  .refine(v => !v || z.email().safeParse(v).success, 'Correo no válido')

/** Datos que un representante puede proponer (los aplica la Federación al aprobarlos). */
export const datosOrganizacionSchema = z.object({
  nombre: requerido(200),
  siglas: opcional(30),
  descripcion: opcional(3000),
  fechaConstitucion: fechaOpcional,
  municipio: opcional(120),
  direccion: opcional(300),
  telefono,
  email: correoOpcional,
  sitioWeb: url,
})
export type DatosOrganizacionInput = z.input<typeof datosOrganizacionSchema>
export type DatosOrganizacion = z.output<typeof datosOrganizacionSchema>

/** Lo que registra o edita directamente la Federación. */
export const organizacionSchema = datosOrganizacionSchema.extend({
  tipo: z.enum(TIPOS_ORGANIZACION),
  publica: z.boolean().default(true),
})
export type OrganizacionInput = z.input<typeof organizacionSchema>

export const organizacionCrearSchema = organizacionSchema.extend({
  estadoAfiliacion: z.enum(ESTADOS_AFILIACION).default('EN_TRAMITE'),
  afiliadaDesde: fechaOpcional,
})
export type OrganizacionCrearInput = z.input<typeof organizacionCrearSchema>

export const organizacionListaQuery = z.object({
  q: z.string().trim().max(100).optional(),
  tipo: z.enum(TIPOS_ORGANIZACION).optional(),
  estado: z.enum(ESTADOS_AFILIACION).optional(),
  ...paginacion,
})

export const estadoAfiliacionSchema = z.object({
  estado: z.enum(ESTADOS_AFILIACION),
  desde: fecha,
  motivo: opcional(500),
})
export type EstadoAfiliacionInput = z.input<typeof estadoAfiliacionSchema>

export const representanteSchema = z.object({
  usuarioId: z.uuid('Elija un usuario'),
  rolId: z.uuid('Elija un rol'),
})

/** El representante solicita el alta de un integrante (nuevo o ya registrado). */
export const altaIntegranteSchema = z.object({
  email: correoSchema,
  nombre: requerido(80),
  apellidoPaterno: requerido(80),
  apellidoMaterno: opcional(80),
  cedulaProfesional: cedula,
  especialidadId: z.uuid().optional().nullable().transform(v => v ?? null),
  numeroSocio: opcional(40),
  comentario: opcional(500),
})
export type AltaIntegranteInput = z.input<typeof altaIntegranteSchema>

export const solicitudPropiaSchema = z.object({
  organizacionId: z.uuid('Elija una organización'),
  comentario: opcional(500),
})

export const resolverSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('APROBAR'), numeroSocio: opcional(40), desde: fechaOpcional }),
  z.object({ decision: z.literal('RECHAZAR'), motivo: z.string().trim().min(3, 'Escriba el motivo').max(500) }),
])
export type ResolverInput = z.input<typeof resolverSchema>

export const bajaSchema = z.object({
  motivo: z.string().trim().min(3, 'Escriba el motivo').max(500),
  hasta: fechaOpcional,
})

export const integrantesQuery = z.object({
  q: z.string().trim().max(100).optional(),
  estado: z.enum(ESTADOS_MEMBRESIA).optional(),
  ...paginacion,
})

export const profesionalesQuery = z.object({
  q: z.string().trim().max(100).optional(),
  especialidadId: z.uuid().optional(),
  organizacionId: z.uuid().optional(),
  estadoValidacion: z.enum(['PENDIENTE', 'VALIDADO', 'RECHAZADO']).optional(),
  conCedula: booleanoQuery,
  ...paginacion,
})

export const validarPerfilSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('VALIDADO') }),
  z.object({ decision: z.literal('RECHAZADO'), motivo: z.string().trim().min(3, 'Escriba la observación').max(500) }),
])

/** Convierte "2026-11-01" en la fecha (columna DATE) correspondiente. */
export const aFecha = (iso: string) => new Date(`${iso}T00:00:00Z`)
