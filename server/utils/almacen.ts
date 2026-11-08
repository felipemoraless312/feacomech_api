// Almacenamiento de archivos subidos, fuera de public/: nunca se sirven directamente,
// sólo por /api/archivos/:id, que revisa la visibilidad.
//   NUXT_DIR_ALMACEN = carpeta (por defecto ./almacen). En producción, un volumen con respaldo.
//   NUXT_ALMACEN = "disco" | "db". Por defecto "disco", salvo en Vercel (sistema de archivos
//   efímero y de sólo lectura), donde el contenido se guarda en la tabla ContenidoArchivo.
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { createError } from 'h3'
import type { VisibilidadArchivo } from '../generated/prisma/enums'
import type { Db } from './prisma'

/** true si el contenido de los archivos vive en la base de datos en lugar del disco. */
export function almacenEnBaseDeDatos(): boolean {
  const modo = process.env.NUXT_ALMACEN
  if (modo === 'db') return true
  if (modo === 'disco') return false
  return !!process.env.VERCEL
}

/** Cliente global, cargado sólo cuando se necesita (las pruebas unitarias no tienen base). */
async function clienteGlobal() {
  return (await import('./prisma')).prisma
}

export function carpetaAlmacen(): string {
  return resolve(process.env.NUXT_DIR_ALMACEN || join(process.cwd(), 'almacen'))
}

/** Ruta absoluta de un archivo guardado; rechaza rutas que salgan de la carpeta. */
export function rutaAbsoluta(rutaRelativa: string): string {
  const base = carpetaAlmacen()
  const abs = resolve(base, rutaRelativa)
  if (!abs.startsWith(base + sep)) throw createError({ statusCode: 404, message: 'No encontrado' })
  return abs
}

export interface TipoPermitido {
  mime: string
  extension: string
  /**
   * Firma de los primeros bytes (magic bytes): no se confía en el MIME del navegador.
   * Los formatos de Office comparten firma (ZIP u OLE), así que además se exige su extensión.
   */
  coincide: (b: Buffer, nombre: string) => boolean
}

const zip = (b: Buffer) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))
const ole = (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]))
const ext = (nombre: string, e: string) => nombre.toLowerCase().endsWith(`.${e}`)

/** Word, Excel y PowerPoint (formatos actuales y anteriores). */
export const OFFICE: TipoPermitido[] = [
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', coincide: (b, n) => zip(b) && ext(n, 'docx') },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx', coincide: (b, n) => zip(b) && ext(n, 'xlsx') },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extension: 'pptx', coincide: (b, n) => zip(b) && ext(n, 'pptx') },
  { mime: 'application/msword', extension: 'doc', coincide: (b, n) => ole(b) && ext(n, 'doc') },
  { mime: 'application/vnd.ms-excel', extension: 'xls', coincide: (b, n) => ole(b) && ext(n, 'xls') },
]

export const IMAGENES: TipoPermitido[] = [
  { mime: 'image/jpeg', extension: 'jpg', coincide: b => b.length > 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF },
  { mime: 'image/png', extension: 'png', coincide: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) },
  { mime: 'image/webp', extension: 'webp', coincide: b => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
]

export const PDF: TipoPermitido = {
  mime: 'application/pdf', extension: 'pdf', coincide: b => b.subarray(0, 5).toString('latin1') === '%PDF-',
}

export function detectarTipo(datos: Buffer, permitidos: TipoPermitido[], nombre = ''): TipoPermitido | null {
  return permitidos.find(t => t.coincide(datos, nombre)) ?? null
}

export interface GuardarArchivo {
  datos: Buffer
  nombreOriginal: string
  permitidos: TipoPermitido[]
  maxBytes: number
  visibilidad: VisibilidadArchivo
  subidoPorId: string | null
}

/**
 * Valida (tamaño y tipo real) y guarda el archivo; crea su registro con `db`.
 * Si la transacción que lo usa falla, el archivo queda huérfano en disco (no en la base):
 * se puede limpiar con una tarea periódica comparando contra la tabla Archivo.
 */
export async function guardarArchivo(db: Db, a: GuardarArchivo) {
  if (!a.datos.length) throw createError({ statusCode: 400, message: 'El archivo está vacío' })
  if (a.datos.length > a.maxBytes) {
    throw createError({ statusCode: 413, message: `El archivo supera el máximo de ${Math.round(a.maxBytes / 1024 / 1024)} MB` })
  }
  const tipo = detectarTipo(a.datos, a.permitidos, a.nombreOriginal)
  if (!tipo) {
    throw createError({ statusCode: 415, message: `Tipo de archivo no permitido. Formatos aceptados: ${a.permitidos.map(t => t.extension.toUpperCase()).join(', ')}` })
  }

  const id = randomUUID()
  const ruta = `${id.slice(0, 2)}/${id}.${tipo.extension}`
  if (almacenEnBaseDeDatos()) {
    // Dentro de la misma transacción que el registro: si ésta falla, no queda huérfano.
    await db.contenidoArchivo.create({ data: { ruta, datos: new Uint8Array(a.datos) } })
  }
  else {
    const abs = rutaAbsoluta(ruta)
    await mkdir(dirname(abs), { recursive: true })
    await writeFile(abs, a.datos, { flag: 'wx' })
  }

  return db.archivo.create({
    data: {
      nombreOriginal: a.nombreOriginal.replace(/[^\p{L}\p{N} ._()-]/gu, '_').slice(0, 200) || `archivo.${tipo.extension}`,
      mime: tipo.mime,
      tamano: a.datos.length,
      ruta,
      sha256: createHash('sha256').update(a.datos).digest('hex'),
      visibilidad: a.visibilidad,
      subidoPorId: a.subidoPorId,
    },
  })
}

export async function leerArchivo(ruta: string): Promise<Buffer> {
  if (almacenEnBaseDeDatos()) {
    const prisma = await clienteGlobal()
    const c = await prisma.contenidoArchivo.findUnique({ where: { ruta } })
    if (!c) throw createError({ statusCode: 404, message: 'No encontrado' })
    return Buffer.from(c.datos)
  }
  return readFile(rutaAbsoluta(ruta))
}

/** Borra el contenido del archivo (el registro lo borra quien llama). Ignora si ya no existe. */
export async function borrarDeDisco(ruta: string) {
  if (almacenEnBaseDeDatos()) {
    const prisma = await clienteGlobal()
    await prisma.contenidoArchivo.deleteMany({ where: { ruta } })
    return
  }
  await rm(rutaAbsoluta(ruta), { force: true })
}
