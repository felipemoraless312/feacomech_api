import { z } from 'zod'
import { booleanoQuery, opcional, paginacion, requerido } from './comunes'

export const NIVELES_ACCESO = ['PUBLICO', 'AFILIADOS', 'ORGANIZACION', 'RESTRINGIDO'] as const
export const NOMBRE_NIVEL: Record<(typeof NIVELES_ACCESO)[number], string> = {
  PUBLICO: 'Público (también en el portal)',
  AFILIADOS: 'Usuarios de la plataforma',
  ORGANIZACION: 'Integrantes de la organización',
  RESTRINGIDO: 'Restringido (dirigentes)',
}

const fechaOpcional = z.union([z.iso.date('Fecha no válida'), z.literal('')]).optional().nullable().transform(v => (v ? v : null))
const idOpcional = z.uuid().optional().nullable().transform(v => v ?? null)

export const documentoSchema = z.object({
  titulo: requerido(200),
  descripcion: opcional(2000),
  categoriaId: z.uuid('Elija la categoría'),
  nivelAcceso: z.enum(NIVELES_ACCESO),
  organizacionId: idOpcional,
  eventoId: idOpcional,
  fechaDocumento: fechaOpcional,
  responsable: opcional(160),
  vigente: z.boolean().default(true),
}).refine(d => d.nivelAcceso !== 'ORGANIZACION' || d.organizacionId, { path: ['organizacionId'], message: 'Elija la organización' })
export type DocumentoInput = z.input<typeof documentoSchema>

export const documentosQuery = z.object({
  q: z.string().trim().max(100).optional(),
  categoriaId: z.uuid().optional(),
  organizacionId: z.uuid().optional(),
  incluirNoVigentes: booleanoQuery,
  ...paginacion,
})

export const categoriaDocumentoSchema = z.object({
  nombre: requerido(80),
  descripcion: opcional(300),
  orden: z.number().int().min(0).max(999).default(0),
  activo: z.boolean().default(true),
})
