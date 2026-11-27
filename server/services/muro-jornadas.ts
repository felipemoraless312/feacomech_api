// Muro de las Jornadas 2026: mini foro público donde los asistentes publican fotos y comentan.
//
// Va separado del resto de la plataforma a propósito:
//   - Tablas y carpeta propias (muro-jornadas/): una foto nunca comparte ruta, permisos ni
//     endpoint con documentos o archivos internos, y estas rutas no leen ningún otro dato.
//   - Sólo JPEG, y el servidor lo reconstruye sin metadatos (utils/jpeg-limpio).
//   - Cada envío necesita un boleto firmado que se pide al abrir la página (caduca, va ligado
//     a quien lo pidió y exige unos segundos de espera), más un campo trampa para robots.
//   - Límites por persona y por hora, y topes generales.
//   - No se pide correo ni teléfono; de la IP sólo se guarda una huella (HMAC) irreversible.
//   - Las publicaciones no se ven hasta que el personal las aprueba. Los comentarios se
//     publican al momento, sin enlaces ni groserías, y se ocultan solos al acumular reportes.
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createError, getRequestIP, type H3Event } from 'h3'
import { JORNADAS_2026 } from '~~/shared/jornadas2026'
import {
  COMENTARIOS_POR_HORA, FOTOS_POR_PUBLICACION, MAX_BYTES_FOTO, MAX_BYTES_MINIATURA, PUBLICACIONES_POR_HORA, REPORTES_PARA_OCULTAR,
  type ComentarioDto, type EstadoPublicacion, type PublicacionDto,
} from '~~/shared/muro-jornadas'
import { almacenEnBaseDeDatos, borrarDeDisco, leerArchivo, rutaAbsoluta } from '../utils/almacen'
import { permitirIntento } from '../utils/frecuencia'
import { limpiarJpeg } from '../utils/jpeg-limpio'
import { prisma } from '../utils/prisma'

const SLUG = JORNADAS_2026.slug
const CARPETA = 'muro-jornadas'
const HORA = 60 * 60_000

function secreto(): string {
  const s = process.env.NUXT_MURO_SECRETO?.trim() || process.env.NUXT_SESSION_PASSWORD
  if (!s) throw createError({ statusCode: 503, message: 'Servicio no disponible' })
  return s
}
const firmar = (texto: string) => createHmac('sha256', secreto()).update(texto).digest('base64url')
const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
const limite = (clave: string, maximo: number, mensaje: string) => {
  if (!permitirIntento(clave, maximo, HORA)) throw createError({ statusCode: 429, message: mensaje })
}

/** Huella irreversible de quien envía (no se guarda la IP). */
export function huellaDe(event: H3Event): string {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'desconocida'
  return firmar(`huella:${ip}`).slice(0, 24)
}

// -----------------------------------------------------------------------------
//  Boleto de envío
// -----------------------------------------------------------------------------
const ESPERA_MINIMA_MS = 2_000
const VIGENCIA_BOLETO_MS = 6 * HORA

export function emitirBoleto(huella: string): string {
  const t = Date.now().toString(36)
  return `${t}.${firmar(`boleto:${t}:${huella}`).slice(0, 32)}`
}

function verificarBoleto(boleto: string, huella: string) {
  const [t = '', firma = ''] = boleto.split('.')
  const emitido = Number.parseInt(t, 36)
  const edad = Date.now() - emitido
  if (!Number.isFinite(emitido) || !igual(firma, firmar(`boleto:${t}:${huella}`).slice(0, 32)) || edad > VIGENCIA_BOLETO_MS) {
    throw createError({ statusCode: 400, message: 'La página caducó. Intente de nuevo.' })
  }
  if (edad < ESPERA_MINIMA_MS) throw createError({ statusCode: 429, message: 'Espere un momento e intente de nuevo.' })
}

/** Clave para agregar más fotos a una publicación recién creada (sólo quien la creó). */
const claveDe = (id: string, huella: string) => firmar(`publicacion:${id}:${huella}`).slice(0, 32)
const VENTANA_FOTOS_MS = 30 * 60_000

// -----------------------------------------------------------------------------
//  Fotos (almacenamiento propio)
// -----------------------------------------------------------------------------
async function guardarBytes(ruta: string, datos: Buffer) {
  if (almacenEnBaseDeDatos()) {
    await prisma.contenidoArchivo.create({ data: { ruta, datos: new Uint8Array(datos) } })
    return
  }
  const abs = rutaAbsoluta(ruta)
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, datos, { flag: 'wx' })
}

export interface ImagenSubida {
  foto: Buffer
  miniatura: Buffer
}

async function guardarFoto(publicacionId: string, img: ImagenSubida) {
  if (img.foto.length > MAX_BYTES_FOTO || img.miniatura.length > MAX_BYTES_MINIATURA) {
    throw createError({ statusCode: 413, message: 'La foto es demasiado grande' })
  }
  const grande = limpiarJpeg(img.foto)
  const mini = limpiarJpeg(img.miniatura)
  const valida = (j: typeof grande, min: number, max: number) => !!j && Math.max(j.ancho, j.alto) >= min && Math.max(j.ancho, j.alto) <= max && Math.min(j.ancho, j.alto) >= 50
  if (!valida(grande, 300, 4096) || !valida(mini, 100, 900)) {
    throw createError({ statusCode: 415, message: 'No pudimos leer la imagen. Intente con otra foto.' })
  }
  limite('muro:fotos:total', 1500, 'Estamos recibiendo muchas fotos. Intente en unos minutos.')

  const id = randomUUID()
  const ruta = `${CARPETA}/${id.slice(0, 2)}/${id}.jpg`
  const rutaMiniatura = `${CARPETA}/${id.slice(0, 2)}/${id}-mini.jpg`
  await guardarBytes(ruta, grande!.datos)
  await guardarBytes(rutaMiniatura, mini!.datos)
  try {
    return await prisma.fotoMuro.create({
      data: { id, publicacionId, ruta, rutaMiniatura, ancho: grande!.ancho, alto: grande!.alto, tamano: grande!.datos.length },
      select: { id: true, ancho: true, alto: true },
    })
  }
  catch (e) {
    await Promise.all([borrarDeDisco(ruta), borrarDeDisco(rutaMiniatura)])
    throw e
  }
}

// -----------------------------------------------------------------------------
//  Público
// -----------------------------------------------------------------------------
export interface NuevaPublicacion {
  boleto: string
  autor: string | null
  mensaje: string | null
  sitio?: string
}

/** Crea la publicación (pendiente de revisión) con su primera foto, si la trae. */
export async function crearPublicacion(huella: string, p: NuevaPublicacion, img: ImagenSubida | null) {
  // Campo trampa lleno: se responde como si todo fuera bien, sin guardar nada.
  if (p.sitio) return { id: randomUUID(), clave: '' }
  verificarBoleto(p.boleto, huella)
  if (!img && !p.mensaje) throw createError({ statusCode: 400, message: 'Escriba un mensaje o agregue una foto' })
  limite(`muro:pub:${huella}`, PUBLICACIONES_POR_HORA, `Puede publicar hasta ${PUBLICACIONES_POR_HORA} veces por hora. Intente más tarde.`)
  limite('muro:pub:total', 400, 'Estamos recibiendo muchas publicaciones. Intente en unos minutos.')

  const pub = await prisma.publicacionMuro.create({
    data: { eventoSlug: SLUG, autor: p.autor, mensaje: p.mensaje, huella },
    select: { id: true },
  })
  if (img) {
    try {
      await guardarFoto(pub.id, img)
    }
    catch (e) {
      await prisma.publicacionMuro.delete({ where: { id: pub.id } })
      throw e
    }
  }
  return { id: pub.id, clave: claveDe(pub.id, huella) }
}

/** Agrega otra foto a una publicación recién creada (mismo autor, mientras espera revisión). */
export async function agregarFoto(publicacionId: string, huella: string, clave: string, img: ImagenSubida) {
  if (!igual(clave, claveDe(publicacionId, huella))) throw createError({ statusCode: 403, message: 'No autorizado' })
  const pub = await prisma.publicacionMuro.findFirst({
    where: { id: publicacionId, eventoSlug: SLUG, estado: 'PENDIENTE' },
    select: { creadoEn: true, _count: { select: { fotos: true } } },
  })
  if (!pub || Date.now() - pub.creadoEn.getTime() > VENTANA_FOTOS_MS) throw createError({ statusCode: 403, message: 'Ya no se pueden agregar fotos a esta publicación' })
  if (pub._count.fotos >= FOTOS_POR_PUBLICACION) throw createError({ statusCode: 400, message: `Máximo ${FOTOS_POR_PUBLICACION} fotos por publicación` })
  limite(`muro:fotos:${huella}`, FOTOS_POR_PUBLICACION * PUBLICACIONES_POR_HORA, 'Llegó al límite de fotos por hora. Intente más tarde.')
  return guardarFoto(publicacionId, img)
}

const comentarioDto = (c: { id: string, autor: string | null, texto: string, creadoEn: Date }): ComentarioDto =>
  ({ id: c.id, autor: c.autor, texto: c.texto, creadoEn: c.creadoEn.toISOString() })

const COMENTARIOS_VISTA_PREVIA = 3

export async function publicacionesAprobadas(antesDe?: string): Promise<{ publicaciones: PublicacionDto[], total: number, totalFotos: number, hayMas: boolean }> {
  const TAM = 15
  const where = { eventoSlug: SLUG, estado: 'APROBADA' as const }
  const [filas, total, totalFotos] = await Promise.all([
    prisma.publicacionMuro.findMany({
      where: { ...where, ...(antesDe ? { id: { lt: antesDe } } : {}) },
      orderBy: { id: 'desc' }, // uuid v7: ordena por fecha
      take: TAM + 1,
      select: {
        id: true, autor: true, mensaje: true, destacada: true, meGusta: true, creadoEn: true,
        fotos: { orderBy: { id: 'asc' }, select: { id: true, ancho: true, alto: true } },
        comentarios: { where: { oculto: false }, orderBy: { id: 'desc' }, take: COMENTARIOS_VISTA_PREVIA, select: { id: true, autor: true, texto: true, creadoEn: true } },
        _count: { select: { comentarios: { where: { oculto: false } } } },
      },
    }),
    prisma.publicacionMuro.count({ where }),
    prisma.fotoMuro.count({ where: { publicacion: where } }),
  ])
  return {
    publicaciones: filas.slice(0, TAM).map(({ _count, comentarios, creadoEn, ...p }) => ({
      ...p,
      creadoEn: creadoEn.toISOString(),
      comentarios: comentarios.reverse().map(comentarioDto),
      totalComentarios: _count.comentarios,
    })),
    total,
    totalFotos,
    hayMas: filas.length > TAM,
  }
}

async function exigirAprobada(id: string) {
  const p = await prisma.publicacionMuro.findFirst({ where: { id, eventoSlug: SLUG, estado: 'APROBADA' }, select: { meGusta: true } })
  if (!p) throw createError({ statusCode: 404, message: 'No encontrado' })
  return p
}

export async function comentariosDe(publicacionId: string) {
  await exigirAprobada(publicacionId)
  const filas = await prisma.comentarioMuro.findMany({
    where: { publicacionId, oculto: false },
    orderBy: { id: 'asc' },
    take: 200,
    select: { id: true, autor: true, texto: true, creadoEn: true },
  })
  return filas.map(comentarioDto)
}

export async function comentar(publicacionId: string, huella: string, c: { boleto: string, autor: string | null, texto: string, sitio?: string }) {
  if (c.sitio) return comentarioDto({ id: randomUUID(), autor: c.autor, texto: c.texto, creadoEn: new Date() })
  verificarBoleto(c.boleto, huella)
  await exigirAprobada(publicacionId)
  limite(`muro:com:${huella}`, COMENTARIOS_POR_HORA, 'Escribió muchos comentarios seguidos. Intente en unos minutos.')
  limite('muro:com:total', 2000, 'Hay mucha actividad. Intente en unos minutos.')
  const r = await prisma.comentarioMuro.create({
    data: { publicacionId, autor: c.autor, texto: c.texto, huella },
    select: { id: true, autor: true, texto: true, creadoEn: true },
  })
  return comentarioDto(r)
}

/** Un reporte por persona y comentario; con varios, el comentario se oculta hasta revisarlo. */
export async function reportarComentario(id: string, huella: string) {
  if (!permitirIntento(`muro:rep:${huella}:${id}`, 1, 24 * HORA) || !permitirIntento(`muro:rep:${huella}`, 30, HORA)) return { ok: true }
  const c = await prisma.comentarioMuro.updateMany({ where: { id, oculto: false, publicacion: { eventoSlug: SLUG } }, data: { reportes: { increment: 1 } } })
  if (c.count) await prisma.comentarioMuro.updateMany({ where: { id, reportes: { gte: REPORTES_PARA_OCULTAR } }, data: { oculto: true } })
  return { ok: true }
}

/** Un "me gusta" por persona y publicación al día. Devuelve el total. */
export async function darMeGusta(id: string, huella: string) {
  const p = await exigirAprobada(id)
  if (!permitirIntento(`muro:like:${huella}:${id}`, 1, 24 * HORA) || !permitirIntento(`muro:like:${huella}`, 300, HORA)) return { meGusta: p.meGusta }
  return prisma.publicacionMuro.update({ where: { id }, data: { meGusta: { increment: 1 } }, select: { meGusta: true } })
}

/** Imagen de una foto. En público sólo se sirven las de publicaciones aprobadas. */
export async function contenidoFoto(id: string, tam: 'grande' | 'mini', soloAprobadas: boolean) {
  const f = await prisma.fotoMuro.findFirst({
    where: { id, publicacion: { eventoSlug: SLUG, ...(soloAprobadas ? { estado: 'APROBADA' as const } : {}) } },
    select: { ruta: true, rutaMiniatura: true, creadoEn: true },
  })
  if (!f) throw createError({ statusCode: 404, message: 'No encontrado' })
  const datos = await leerArchivo(tam === 'mini' ? f.rutaMiniatura : f.ruta).catch(() => {
    throw createError({ statusCode: 404, message: 'No encontrado' })
  })
  return { datos, creadoEn: f.creadoEn }
}

// -----------------------------------------------------------------------------
//  Personal de la Federación
// -----------------------------------------------------------------------------
export async function publicacionesModeracion(estado: EstadoPublicacion) {
  const [filas, conteo, reportados] = await Promise.all([
    prisma.publicacionMuro.findMany({
      where: { eventoSlug: SLUG, estado },
      orderBy: { id: estado === 'PENDIENTE' ? 'asc' : 'desc' },
      take: 150,
      select: {
        id: true, autor: true, mensaje: true, estado: true, destacada: true, enRedes: true, meGusta: true, creadoEn: true, huella: true,
        fotos: { orderBy: { id: 'asc' }, select: { id: true, ancho: true, alto: true } },
        _count: { select: { comentarios: true } },
      },
    }),
    prisma.publicacionMuro.groupBy({ by: ['estado'], where: { eventoSlug: SLUG }, _count: { _all: true } }),
    prisma.comentarioMuro.count({ where: { publicacion: { eventoSlug: SLUG }, OR: [{ oculto: true }, { reportes: { gt: 0 } }] } }),
  ])
  return {
    publicaciones: filas,
    conteo: Object.fromEntries(conteo.map(c => [c.estado, c._count._all])) as Partial<Record<EstadoPublicacion, number>>,
    comentariosPorRevisar: reportados,
  }
}
export type PublicacionModeracion = Awaited<ReturnType<typeof publicacionesModeracion>>['publicaciones'][number]

export async function comentariosModeracion(soloReportados: boolean) {
  return prisma.comentarioMuro.findMany({
    where: { publicacion: { eventoSlug: SLUG }, ...(soloReportados ? { OR: [{ oculto: true }, { reportes: { gt: 0 } }] } : {}) },
    orderBy: { id: 'desc' },
    take: 200,
    select: { id: true, autor: true, texto: true, oculto: true, reportes: true, creadoEn: true, huella: true, publicacion: { select: { id: true, autor: true, mensaje: true } } },
  })
}
export type ComentarioModeracion = Awaited<ReturnType<typeof comentariosModeracion>>[number]

export async function moderarPublicacion(id: string, revisorId: string, cambios: { estado?: EstadoPublicacion, destacada?: boolean, enRedes?: boolean }) {
  const p = await prisma.publicacionMuro.findFirst({ where: { id, eventoSlug: SLUG }, select: { id: true } })
  if (!p) throw createError({ statusCode: 404, message: 'Publicación no encontrada' })
  return prisma.publicacionMuro.update({
    where: { id },
    data: { ...cambios, ...(cambios.estado ? { revisadoEn: new Date(), revisadoPorId: revisorId } : {}) },
    select: { id: true, estado: true, destacada: true, enRedes: true },
  })
}

export async function eliminarPublicacion(id: string) {
  const p = await prisma.publicacionMuro.findFirst({ where: { id, eventoSlug: SLUG }, select: { fotos: { select: { ruta: true, rutaMiniatura: true } } } })
  if (!p) throw createError({ statusCode: 404, message: 'Publicación no encontrada' })
  await prisma.publicacionMuro.delete({ where: { id } })
  await Promise.all(p.fotos.flatMap(f => [borrarDeDisco(f.ruta), borrarDeDisco(f.rutaMiniatura)]))
}

/** Ocultar o volver a mostrar un comentario (al mostrarlo se limpian sus reportes). */
export async function moderarComentario(id: string, oculto: boolean) {
  const r = await prisma.comentarioMuro.updateMany({ where: { id, publicacion: { eventoSlug: SLUG } }, data: { oculto, ...(oculto ? {} : { reportes: 0 }) } })
  if (!r.count) throw createError({ statusCode: 404, message: 'Comentario no encontrado' })
}

export async function eliminarComentario(id: string) {
  const r = await prisma.comentarioMuro.deleteMany({ where: { id, publicacion: { eventoSlug: SLUG } } })
  if (!r.count) throw createError({ statusCode: 404, message: 'Comentario no encontrado' })
}
