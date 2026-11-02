// Parámetros generales (tabla Parametro, clave → valor JSON).
// Cada uno tiene su esquema Zod y valor por defecto; el seed los crea y Configuración los edita.
import { z } from 'zod'

const texto = (max: number) => z.string().trim().max(max).default('')
const url = z.string().trim().max(500).refine(v => !v || /^https:\/\//.test(v), 'Debe iniciar con https://').default('')

/**
 * Datos institucionales para el portal público, encabezados y constancias.
 * Vacío = no se publica: el portal nunca muestra texto inventado. Lo que se tomó de fuentes
 * públicas y falta validar se marca con corchetes "[…]" y tampoco se publica.
 */
export const datosInstitucionSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  siglas: z.string().trim().min(1).max(30),
  lema: texto(200),
  direccion: texto(300),
  ciudad: texto(120),
  telefono: texto(80),
  email: texto(120),
  horario: texto(200),
  facebook: url,
  sitioWeb: url,
  presentacion: texto(2000),
  historia: texto(6000),
  mision: texto(1500),
  vision: texto(1500),
  objetivos: texto(4000),
  mapaCoordenadas: z.string().trim().max(60).refine(v => !v || /^-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+$/.test(v), 'Formato: 16.7531,-93.1156').default(''),
})
export type DatosInstitucion = z.infer<typeof datosInstitucionSchema>

/** Un valor capturado pero pendiente de validar ("[Tuxtla Gutiérrez, por confirmar]"). */
export const esPorConfirmar = (v: string | null | undefined) => !!v && v.trim().startsWith('[')

/**
 * Contenido de la página de inicio administrable desde el panel: cifras destacadas (con su
 * fuente), hitos de la trayectoria, una cita y las líneas de trabajo. Listas vacías = la
 * sección no se muestra.
 */
export const portadaSchema = z.object({
  cifras: z.array(z.object({
    valor: z.string().trim().min(1).max(20),
    etiqueta: z.string().trim().min(1).max(80),
    nota: z.string().trim().max(160).default(''),
  })).max(6).default([]),
  hitos: z.array(z.object({
    anio: z.string().trim().min(1).max(20),
    titulo: z.string().trim().min(1).max(120),
    texto: z.string().trim().max(600).default(''),
  })).max(20).default([]),
  cita: z.object({
    texto: z.string().trim().max(300).default(''),
    autor: z.string().trim().max(120).default(''),
    cargo: z.string().trim().max(160).default(''),
  }).default({ texto: '', autor: '', cargo: '' }),
  lineas: z.array(z.object({
    icono: z.string().trim().max(40).default('i-lucide-check'),
    titulo: z.string().trim().min(1).max(80),
    texto: z.string().trim().max(300).default(''),
  })).max(9).default([]),
  /** Fechas próximas (propias o del sector salud en Chiapas); las pasadas se ocultan solas. */
  agenda: z.array(z.object({
    fecha: z.iso.date(),
    fin: z.union([z.iso.date(), z.literal('')]).default(''),
    titulo: z.string().trim().min(1).max(160),
    lugar: z.string().trim().max(160).default(''),
    organiza: z.string().trim().max(160).default(''),
    url: z.union([z.url(), z.literal('')]).default(''),
  })).max(8).default([]),
})
export type DatosPortada = z.infer<typeof portadaSchema>

export const DEFINICION_PARAMETROS = {
  sesionInactividadMinutos: {
    schema: z.number().int().min(5).max(480),
    defecto: 60,
    descripcion: 'Minutos sin actividad tras los que se cierra la sesión.',
  },
  institucion: {
    schema: datosInstitucionSchema,
    defecto: {
      nombre: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas',
      siglas: 'FEACOMECH',
      // Lema del escudo oficial de la Federación.
      lema: 'Por la dignificación y unión profesional',
      direccion: '',
      // Tomado de la página pública de Facebook de la Federación; debe confirmarse.
      ciudad: '[Tuxtla Gutiérrez, Chiapas — por confirmar]',
      telefono: '',
      email: '',
      horario: '',
      facebook: 'https://www.facebook.com/feacomech/',
      sitioWeb: '',
      presentacion: '',
      historia: '',
      mision: '',
      vision: '',
      objetivos: '',
      mapaCoordenadas: '',
    } satisfies DatosInstitucion,
    descripcion: 'Datos institucionales de la Federación para el portal público y los documentos.',
  },
  portada: {
    schema: portadaSchema,
    defecto: { cifras: [], hitos: [], cita: { texto: '', autor: '', cargo: '' }, lineas: [], agenda: [] } satisfies DatosPortada,
    descripcion: 'Contenido destacado de la página de inicio (cifras, trayectoria, cita y líneas de trabajo).',
  },
} as const

export type ClaveParametro = keyof typeof DEFINICION_PARAMETROS
export type ValorParametro<K extends ClaveParametro> = z.infer<(typeof DEFINICION_PARAMETROS)[K]['schema']>
