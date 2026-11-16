// Registro en sede e ingresos diarios de las Jornadas 2026 (enlace oculto por QR).
import { z } from 'zod'
import { ZONA_HORARIA } from './texto'

export const CATEGORIAS_ASISTENTE = ['COLEGIADO', 'NO_COLEGIADO', 'ESTUDIANTE', 'OTRO'] as const
export type CategoriaAsistente = (typeof CATEGORIAS_ASISTENTE)[number]

export const NOMBRE_CATEGORIA: Record<CategoriaAsistente, string> = {
  COLEGIADO: 'Médico colegiado',
  NO_COLEGIADO: 'Médico no colegiado',
  ESTUDIANTE: 'Estudiante o área afín',
  OTRO: 'Otro',
}

/** Días del evento (fecha de Ciudad de México), en orden. */
export const DIAS_JORNADAS = [
  { fecha: '2026-11-26', etiqueta: 'Jueves 26', corta: 'Jue 26' },
  { fecha: '2026-11-27', etiqueta: 'Viernes 27', corta: 'Vie 27' },
  { fecha: '2026-11-28', etiqueta: 'Sábado 28', corta: 'Sáb 28' },
] as const

/** Fecha de hoy en Ciudad de México, "AAAA-MM-DD". */
export function hoyMexico(ahora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(ahora)
}

export const diaDelEvento = (fecha: string) => DIAS_JORNADAS.find(d => d.fecha === fecha) ?? null

const correo = z.string().trim().toLowerCase().max(160).email('Escriba un correo válido')

export const registroAsistenteSchema = z.object({
  nombre: z.string().trim().min(5, 'Escriba su nombre completo').max(150)
    .refine(v => v.split(/\s+/).length >= 2, 'Escriba nombre y apellidos'),
  correo,
  telefono: z.string().trim().max(20).regex(/^[\d\s+()-]*$/, 'Sólo números').default(''),
  categoria: z.enum(CATEGORIAS_ASISTENTE, 'Elija una opción'),
  procedencia: z.string().trim().max(200).default(''),
})
export type RegistroAsistenteEntrada = z.input<typeof registroAsistenteSchema>

/** Marcar el ingreso de hoy con el correo o con el pase guardado en el teléfono. */
export const ingresoAsistenteSchema = z.union([
  z.object({ correo }),
  z.object({ codigo: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/) }),
])

/** Corrección desde la plataforma: marcar o quitar el ingreso de un día. */
export const correccionIngresoSchema = z.object({
  fecha: z.enum(DIAS_JORNADAS.map(d => d.fecha) as [string, ...string[]]),
  presente: z.boolean(),
})
