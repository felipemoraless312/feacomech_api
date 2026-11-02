import { z } from 'zod'
import { opcional, paginacion, requerido } from './comunes'

export const TIPOS_GRUPO = ['GENERAL', 'ESPECIALIDAD', 'ORGANIZACION', 'DEBATE'] as const
export const PRIVACIDADES = ['ABIERTO', 'MIEMBROS', 'PRIVADO'] as const
export const TIPOS_REACCION = ['ME_GUSTA', 'UTIL', 'INTERESANTE'] as const
export const MOTIVOS_REPORTE = ['DATOS_PACIENTE', 'INAPROPIADO', 'SPAM', 'OTRO'] as const

export const NOMBRE_TIPO_GRUPO: Record<(typeof TIPOS_GRUPO)[number], string> = {
  GENERAL: 'Comunidad general', ESPECIALIDAD: 'Especialidad', ORGANIZACION: 'Organización', DEBATE: 'Debate académico',
}
export const NOMBRE_PRIVACIDAD: Record<(typeof PRIVACIDADES)[number], string> = {
  ABIERTO: 'Abierto: todos leen y publican',
  MIEMBROS: 'Todos leen; publican los miembros',
  PRIVADO: 'Privado: sólo miembros aprobados',
}
export const REACCIONES: Record<(typeof TIPOS_REACCION)[number], { etiqueta: string, icono: string }> = {
  ME_GUSTA: { etiqueta: 'Me gusta', icono: 'i-lucide-thumbs-up' },
  UTIL: { etiqueta: 'Útil', icono: 'i-lucide-lightbulb' },
  INTERESANTE: { etiqueta: 'Interesante', icono: 'i-lucide-sparkles' },
}
export const NOMBRE_MOTIVO: Record<(typeof MOTIVOS_REPORTE)[number], string> = {
  DATOS_PACIENTE: 'Contiene datos de pacientes',
  INAPROPIADO: 'Contenido inapropiado',
  SPAM: 'Publicidad o spam',
  OTRO: 'Otro motivo',
}

/**
 * Datos que pueden identificar a un paciente (la comunidad no es un expediente clínico).
 * Detección básica: CURP y número de seguridad social. No sustituye la moderación.
 */
export function datosIdentificables(texto: string): string[] {
  const hallazgos: string[] = []
  if (/\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z\d]\d\b/i.test(texto)) hallazgos.push('una CURP')
  if (/\b(NSS|n[uú]mero de seguridad social|afiliaci[oó]n IMSS)\b[^0-9]{0,15}\d{10,11}\b/i.test(texto)) hallazgos.push('un número de seguridad social')
  if (/\b(expediente|exp\.)\s*(n[uú]m\.?|no\.?|#)?\s*\d{4,}\b/i.test(texto)) hallazgos.push('un número de expediente')
  return hallazgos
}

const sinDatosPaciente = (campo: string) => (v: string | null | undefined, ctx: z.RefinementCtx) => {
  const h = v ? datosIdentificables(v) : []
  if (h.length) ctx.addIssue({ code: 'custom', path: [campo], message: `Parece incluir ${h.join(' y ')}. No publique datos que identifiquen a pacientes.` })
}

export const publicacionSchema = z.object({
  titulo: opcional(200),
  contenido: z.string().trim().min(2, 'Escriba su publicación').max(10_000),
}).superRefine((d, ctx) => {
  sinDatosPaciente('contenido')(d.contenido, ctx)
  sinDatosPaciente('titulo')(d.titulo, ctx)
})
export type PublicacionInput = z.input<typeof publicacionSchema>

export const comentarioSchema = z.object({
  contenido: z.string().trim().min(1, 'Escriba su comentario').max(5000),
  padreId: z.uuid().optional().nullable().transform(v => v ?? null),
}).superRefine((d, ctx) => sinDatosPaciente('contenido')(d.contenido, ctx))
export type ComentarioInput = z.input<typeof comentarioSchema>

export const reaccionSchema = z.object({ tipo: z.enum(TIPOS_REACCION).nullable() })

export const reporteSchema = z.object({
  motivo: z.enum(MOTIVOS_REPORTE),
  detalle: opcional(1000),
})

export const grupoSchema = z.object({
  tipo: z.enum(TIPOS_GRUPO),
  nombre: requerido(120),
  descripcion: opcional(1000),
  privacidad: z.enum(PRIVACIDADES),
  especialidadId: z.uuid().optional().nullable().transform(v => v ?? null),
  activo: z.boolean().default(true),
}).refine(d => d.tipo !== 'ESPECIALIDAD' || d.especialidadId, { path: ['especialidadId'], message: 'Elija la especialidad' })
export type GrupoInput = z.input<typeof grupoSchema>

export const publicacionesQuery = z.object({
  q: z.string().trim().max(100).optional(),
  grupoId: z.uuid().optional(),
  ...paginacion,
})

export const moderarSchema = z.object({
  decision: z.enum(['ELIMINAR', 'DESESTIMAR']),
  nota: opcional(500),
})

export const eliminarContenidoSchema = z.object({ motivo: opcional(500) })
