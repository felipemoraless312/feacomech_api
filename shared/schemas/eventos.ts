import { z } from 'zod'
import { opcional, paginacion, requerido } from './comunes'

export const TIPOS_EVENTO = ['CONGRESO', 'CURSO', 'CONFERENCIA', 'TALLER', 'JORNADA', 'OTRO'] as const
export const MODALIDADES = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'] as const
export const ESTADOS_EVENTO = ['BORRADOR', 'PUBLICADO', 'CANCELADO'] as const

export const NOMBRE_TIPO_EVENTO: Record<(typeof TIPOS_EVENTO)[number], string> = {
  CONGRESO: 'Congreso', CURSO: 'Curso', CONFERENCIA: 'Conferencia', TALLER: 'Taller', JORNADA: 'Jornada médica', OTRO: 'Evento',
}
export const NOMBRE_MODALIDAD: Record<(typeof MODALIDADES)[number], string> = { PRESENCIAL: 'Presencial', VIRTUAL: 'Virtual', HIBRIDO: 'Híbrido' }
export const NOMBRE_ESTADO_EVENTO: Record<(typeof ESTADOS_EVENTO)[number], string> = { BORRADOR: 'Borrador', PUBLICADO: 'Publicado', CANCELADO: 'Cancelado' }
export const NOMBRE_INSCRIPCION: Record<string, string> = { CONFIRMADA: 'Confirmada', LISTA_ESPERA: 'Lista de espera', CANCELADA: 'Cancelada' }

/** Fecha y hora local capturada en el formulario ("2026-11-20T09:00"); se interpreta en hora de Chiapas. */
export const fechaHora = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Fecha y hora no válidas')
/** "2026-11-20T09:00" (hora de México, UTC−6) → instante. */
export const aInstante = (v: string) => new Date(`${v}:00-06:00`)

const url = z.string().trim().max(500).optional().nullable()
  .transform(v => (v ? v : null))
  .refine(v => !v || /^https:\/\/\S+$/.test(v), 'Debe iniciar con https://')

export const eventoSchema = z.object({
  tipo: z.enum(TIPOS_EVENTO),
  titulo: requerido(200),
  descripcion: z.string().trim().min(10, 'Describa el evento (mínimo 10 caracteres)').max(10_000),
  inicio: fechaHora,
  fin: fechaHora,
  modalidad: z.enum(MODALIDADES),
  sede: opcional(200),
  direccion: opcional(300),
  enlaceVirtual: url,
  organizacionId: z.uuid().optional().nullable().transform(v => v ?? null),
  organizador: opcional(200),
  capacidad: z.number().int().min(1).max(100_000).optional().nullable().transform(v => v ?? null),
  requisitos: opcional(2000),
  valorCurricular: opcional(200),
  inscripcionAbierta: z.boolean().default(true),
})
  .refine(d => d.fin >= d.inicio, { path: ['fin'], message: 'Debe ser posterior al inicio' })
  .refine(d => d.modalidad === 'VIRTUAL' || d.sede, { path: ['sede'], message: 'Indique la sede' })
export type EventoInput = z.input<typeof eventoSchema>

export const actividadSchema = z.object({
  inicio: fechaHora,
  fin: z.union([fechaHora, z.literal('')]).optional().nullable().transform(v => (v ? v : null)),
  titulo: requerido(200),
  descripcion: opcional(1000),
  ponentes: opcional(300),
  lugar: opcional(150),
})
export type ActividadInput = z.input<typeof actividadSchema>

export const ponenteSchema = z.object({
  nombre: requerido(160),
  semblanza: opcional(2000),
  orden: z.number().int().min(0).max(999).default(0),
})
export type PonenteInput = z.input<typeof ponenteSchema>

export const eventosQuery = z.object({
  q: z.string().trim().max(100).optional(),
  estado: z.enum(ESTADOS_EVENTO).optional(),
  periodo: z.enum(['proximos', 'pasados']).optional(),
  ...paginacion,
})

export const eventosPublicosQuery = z.object({
  tipo: z.enum(TIPOS_EVENTO).optional(),
  periodo: z.enum(['proximos', 'pasados']).default('proximos'),
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  ...paginacion,
})

export const asistenciaSchema = z.object({
  inscripcionIds: z.array(z.uuid()).min(1).max(1000),
  fecha: z.iso.date(),
  asistio: z.boolean(),
})

export const emitirConstanciasSchema = z.object({ inscripcionIds: z.array(z.uuid()).min(1).max(1000) })
