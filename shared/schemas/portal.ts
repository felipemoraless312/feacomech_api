import { z } from 'zod'
import { correoSchema } from './auth'
import { opcional, paginacion, requerido, telefono } from './comunes'

export const TIPOS_NOTICIA = ['COMUNICADO', 'NOTICIA', 'ACTIVIDAD', 'PUBLICACION'] as const
export const ESTADOS_NOTICIA = ['BORRADOR', 'REVISION', 'PUBLICADA', 'RETIRADA'] as const
export const TIPOS_VINCULO = ['INSTITUCION', 'CONVENIO', 'ORGANISMO'] as const
export const ESTADOS_MENSAJE = ['NUEVO', 'ATENDIDO', 'ARCHIVADO'] as const

export const NOMBRE_NOTICIA: Record<(typeof TIPOS_NOTICIA)[number], string> = {
  COMUNICADO: 'Comunicado oficial',
  NOTICIA: 'Noticia',
  ACTIVIDAD: 'Actividad',
  PUBLICACION: 'Publicación',
}
export const NOMBRE_ESTADO_NOTICIA: Record<(typeof ESTADOS_NOTICIA)[number], string> = {
  BORRADOR: 'Borrador',
  REVISION: 'En revisión',
  PUBLICADA: 'Publicada',
  RETIRADA: 'Retirada',
}
export const NOMBRE_VINCULO: Record<(typeof TIPOS_VINCULO)[number], string> = {
  INSTITUCION: 'Institución colaboradora',
  CONVENIO: 'Convenio',
  ORGANISMO: 'Organismo relacionado',
}

const fechaOpcional = z.union([z.iso.date('Fecha no válida'), z.literal('')]).optional().nullable().transform(v => (v ? v : null))
const url = z.string().trim().max(300).optional().nullable()
  .transform(v => (v ? v : null))
  .refine(v => !v || /^https:\/\/\S+$/.test(v), 'Debe iniciar con https://')

export const noticiaSchema = z.object({
  tipo: z.enum(TIPOS_NOTICIA),
  titulo: requerido(200),
  resumen: opcional(400),
  contenido: z.string().trim().min(20, 'Escriba el contenido (mínimo 20 caracteres)').max(30_000),
  destacada: z.boolean().default(false),
  organizacionId: z.uuid().optional().nullable().transform(v => v ?? null),
})
export type NoticiaInput = z.input<typeof noticiaSchema>

export const noticiasQuery = z.object({
  q: z.string().trim().max(100).optional(),
  tipo: z.enum(TIPOS_NOTICIA).optional(),
  estado: z.enum(ESTADOS_NOTICIA).optional(),
  ...paginacion,
})

export const noticiasPublicasQuery = z.object({
  tipo: z.enum(TIPOS_NOTICIA).optional(),
  ...paginacion,
})

/** Transición de estado de una noticia. */
export const transicionNoticiaSchema = z.object({
  accion: z.enum(['ENVIAR_A_REVISION', 'DEVOLVER', 'PUBLICAR', 'RETIRAR']),
  motivo: opcional(500),
})

export const vinculoSchema = z.object({
  tipo: z.enum(TIPOS_VINCULO),
  nombre: requerido(200),
  descripcion: opcional(2000),
  sitioWeb: url,
  fechaFirma: fechaOpcional,
  vigenciaHasta: fechaOpcional,
  orden: z.number().int().min(0).max(999).default(0),
  publicado: z.boolean().default(false),
})
export type VinculoInput = z.input<typeof vinculoSchema>

/** Formulario de contacto. `sitio` es un campo trampa: las personas lo dejan vacío. */
export const contactoSchema = z.object({
  nombre: requerido(120),
  email: correoSchema,
  telefono,
  asunto: requerido(160),
  mensaje: z.string().trim().min(10, 'Escriba su mensaje (mínimo 10 caracteres)').max(5000),
  aceptaAviso: z.literal(true, 'Debe aceptar el aviso de privacidad'),
  sitio: z.string().max(0).optional(),
})
export type ContactoInput = z.input<typeof contactoSchema>

export const mensajesQuery = z.object({
  estado: z.enum(ESTADOS_MENSAJE).optional(),
  ...paginacion,
})

export const atenderMensajeSchema = z.object({
  estado: z.enum(ESTADOS_MENSAJE),
  nota: opcional(1000),
})
