// Muro de las Jornadas 2026 (mini foro con fotos): reglas compartidas por la página y el servidor.
import { z } from 'zod'

export const HASHTAG_JORNADAS = '#JornadasFEACOMECH2026'

/** Fotos por publicación. */
export const FOTOS_POR_PUBLICACION = 6
/** Publicaciones que una misma persona puede crear por hora. */
export const PUBLICACIONES_POR_HORA = 8
/** Comentarios que una misma persona puede dejar por hora. */
export const COMENTARIOS_POR_HORA = 30
/** Reportes con los que un comentario se oculta solo hasta que el personal lo revise. */
export const REPORTES_PARA_OCULTAR = 3
/** El navegador reduce cada foto a este lado mayor antes de enviarla (y quita metadatos). */
export const LADO_FOTO = 1920
export const LADO_MINIATURA = 640
export const MAX_BYTES_FOTO = 4 * 1024 * 1024
export const MAX_BYTES_MINIATURA = 600 * 1024

const nombre = z.string().trim().max(60).optional().transform(v => v || null)

// Sin enlaces ni correos: evita spam y estafas en un espacio público.
const ENLACE = /(https?:\/\/|www\.|\b[\w-]+\.(com|net|org|mx|io|ly|me|xyz|info|site|online|link)\b|@[\w-]+\.\w+)/i
// Lista corta de groserías e insultos frecuentes (el personal revisa lo demás).
const GROSERIAS = /\b(pu[tt]+[oa]s?|pendej[oa]s?|cabr[oó]n(es)?|chinga\w*|verga\w*|mierda|culer[oa]s?|joto|put[oa]madre|idiota|imb[eé]cil|est[uú]pid[oa]s?)\b/i

export function textoNoPermitido(texto: string): string | null {
  if (ENLACE.test(texto)) return 'Por seguridad no se permiten enlaces ni correos.'
  if (GROSERIAS.test(texto.normalize('NFD').replace(/\p{M}/gu, ''))) return 'Mantengamos un lenguaje respetuoso.'
  return null
}

const textoLimpio = (max: number) => z.string().trim().max(max).superRefine((v, ctx) => {
  const motivo = v ? textoNoPermitido(v) : null
  if (motivo) ctx.addIssue({ code: 'custom', message: motivo })
})

/** Datos que acompañan a una publicación nueva. */
export const nuevaPublicacionSchema = z.object({
  /** Boleto firmado que entrega el servidor al abrir la página. */
  boleto: z.string().max(200),
  autor: nombre,
  mensaje: textoLimpio(500).optional().transform(v => v || null),
  autorizo: z.literal(true, { error: 'Debe autorizar la publicación para enviar sus fotos' }),
  /** Campo trampa: invisible para las personas; si trae algo, quien envía es un robot. */
  sitio: z.string().max(200).optional(),
})

export const nuevoComentarioSchema = z.object({
  boleto: z.string().max(200),
  autor: nombre,
  texto: textoLimpio(280).pipe(z.string().min(2, 'Escriba su comentario')),
  sitio: z.string().max(200).optional(),
})

export const ESTADOS_PUBLICACION = ['PENDIENTE', 'APROBADA', 'RECHAZADA'] as const
export type EstadoPublicacion = (typeof ESTADOS_PUBLICACION)[number]

export const moderarPublicacionSchema = z.object({
  estado: z.enum(ESTADOS_PUBLICACION).optional(),
  destacada: z.boolean().optional(),
  enRedes: z.boolean().optional(),
})

export interface FotoMuroDto {
  id: string
  ancho: number
  alto: number
}

export interface ComentarioDto {
  id: string
  autor: string | null
  texto: string
  creadoEn: string
}

export interface PublicacionDto {
  id: string
  autor: string | null
  mensaje: string | null
  destacada: boolean
  meGusta: number
  creadoEn: string
  fotos: FotoMuroDto[]
  comentarios: ComentarioDto[]
  totalComentarios: number
}
