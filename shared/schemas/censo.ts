import { z } from 'zod'

export const SEGMENTOS = ['registrados', 'afiliados', 'validados', 'pendientes'] as const
export const NOMBRE_SEGMENTO: Record<(typeof SEGMENTOS)[number], string> = {
  registrados: 'Profesionales registrados',
  afiliados: 'Miembros afiliados',
  validados: 'Registros validados',
  pendientes: 'Pendientes de validación',
}

export const censoQuery = z.object({
  segmento: z.enum(SEGMENTOS).default('registrados'),
  especialidadId: z.uuid().optional(),
  regionId: z.uuid().optional(),
  organizacionId: z.uuid().optional(),
})

export const TIPOS_REPORTE = ['profesionales', 'organizaciones', 'eventos', 'afiliaciones'] as const

export const reporteQuery = z.object({
  desde: z.iso.date().optional(),
  hasta: z.iso.date().optional(),
})
