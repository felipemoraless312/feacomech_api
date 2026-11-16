// Registro en sede e ingresos diarios de las Jornadas 2026.
//
// Se entra por un enlace oculto (/jornadas-2026/registro/<clave>) que se reparte por QR en
// la sede. La clave es la credencial: sin ella las rutas responden 404, igual que si no
// existieran. Sale de NUXT_JORNADAS_CLAVE o, si no se define, se deriva de la clave de sesión
// (así funciona sin configurar nada). Para invalidar un QR filtrado basta cambiar la variable.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createError } from 'h3'
import type { z } from 'zod'
import { JORNADAS_2026 } from '~~/shared/jornadas2026'
import { DIAS_JORNADAS, NOMBRE_CATEGORIA, diaDelEvento, hoyMexico, type ingresoAsistenteSchema, type registroAsistenteSchema } from '~~/shared/registro-jornadas'
import type { OrigenRegistro } from '../generated/prisma/enums'
import { prisma } from '../utils/prisma'
import { aCsv } from '../utils/csv'

const SLUG = JORNADAS_2026.slug

export function claveRegistro(): string {
  const propia = process.env.NUXT_JORNADAS_CLAVE?.trim()
  if (propia) return propia
  const secreto = process.env.NUXT_SESSION_PASSWORD
  if (!secreto) throw createError({ statusCode: 404, message: 'No encontrado' })
  return createHmac('sha256', secreto).update(`registro:${SLUG}`).digest('base64url').slice(0, 20)
}

/** 404 si la clave no coincide (comparación en tiempo constante). */
export function exigirClave(clave: string | undefined) {
  const a = Buffer.from(clave ?? '')
  const b = Buffer.from(claveRegistro())
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw createError({ statusCode: 404, message: 'No encontrado' })
}

export const rutaRegistro = () => `/jornadas-2026/registro/${claveRegistro()}`

/** En desarrollo, o con NUXT_JORNADAS_INGRESO_LIBRE=1, se aceptan ingresos fuera de los días del evento (para probar). */
const ingresoLibre = () => import.meta.dev || process.env.NUXT_JORNADAS_INGRESO_LIBRE === '1'

/** Fecha del ingreso de hoy, o null si hoy no hay evento. */
function fechaIngresoHoy(): string | null {
  const hoy = hoyMexico()
  return diaDelEvento(hoy) || ingresoLibre() ? hoy : null
}

const aDate = (fecha: string) => new Date(`${fecha}T00:00:00Z`)
const aTexto = (d: Date) => d.toISOString().slice(0, 10)

export function estadoRegistro() {
  const hoy = hoyMexico()
  return {
    hoy,
    dia: diaDelEvento(hoy),
    ingresoAbierto: fechaIngresoHoy() !== null,
    dias: DIAS_JORNADAS,
  }
}

export interface ResultadoIngreso {
  id: string
  nombre: string
  codigo: string
  /** El correo ya estaba registrado (no se cambiaron sus datos). */
  yaRegistrado: boolean
  /** Fecha del ingreso de hoy, o null si hoy no hay evento (sólo quedó registrado). */
  ingresoHoy: string | null
  /** Hoy ya había marcado su ingreso antes. */
  ingresoRepetido: boolean
  diasAsistidos: string[]
}

async function marcarIngreso(registroId: string, origen: OrigenRegistro) {
  const fecha = fechaIngresoHoy()
  if (!fecha) return { fecha: null, repetido: false }
  const r = await prisma.ingresoAsistente.createMany({
    data: [{ registroId, fecha: aDate(fecha), origen }],
    skipDuplicates: true,
  })
  return { fecha, repetido: r.count === 0 }
}

async function resultado(registro: { id: string, nombre: string, codigo: string }, yaRegistrado: boolean, ingreso: { fecha: string | null, repetido: boolean }): Promise<ResultadoIngreso> {
  const dias = await prisma.ingresoAsistente.findMany({ where: { registroId: registro.id }, select: { fecha: true }, orderBy: { fecha: 'asc' } })
  return {
    id: registro.id,
    nombre: registro.nombre,
    codigo: registro.codigo,
    yaRegistrado,
    ingresoHoy: ingreso.fecha,
    ingresoRepetido: ingreso.repetido,
    diasAsistidos: dias.map(d => aTexto(d.fecha)),
  }
}

/**
 * Registra a la persona (si su correo no existe) y marca su ingreso de hoy.
 * Si el correo ya estaba registrado no se modifican sus datos: sólo se marca el ingreso.
 */
export async function registrarAsistente(datos: z.output<typeof registroAsistenteSchema>, origen: OrigenRegistro = 'AUTOREGISTRO'): Promise<ResultadoIngreso> {
  const select = { id: true, nombre: true, codigo: true } as const
  let registro = await prisma.registroAsistente.findUnique({ where: { eventoSlug_correo: { eventoSlug: SLUG, correo: datos.correo } }, select })
  const yaRegistrado = !!registro
  if (!registro) {
    registro = await prisma.registroAsistente.upsert({
      where: { eventoSlug_correo: { eventoSlug: SLUG, correo: datos.correo } },
      update: {}, // dos envíos simultáneos del mismo correo
      create: {
        eventoSlug: SLUG,
        nombre: datos.nombre.replace(/\s+/g, ' '),
        correo: datos.correo,
        telefono: datos.telefono || null,
        categoria: datos.categoria,
        procedencia: datos.procedencia || null,
        codigo: randomBytes(18).toString('base64url'),
        origen,
      },
      select,
    })
  }
  return resultado(registro, yaRegistrado, await marcarIngreso(registro.id, origen))
}

/** Marca el ingreso de hoy de alguien ya registrado, por su correo o su pase. */
export async function ingresoAsistente(datos: z.output<typeof ingresoAsistenteSchema>): Promise<ResultadoIngreso> {
  const registro = await prisma.registroAsistente.findFirst({
    where: { eventoSlug: SLUG, ...('codigo' in datos ? { codigo: datos.codigo } : { correo: datos.correo }) },
    select: { id: true, nombre: true, codigo: true },
  })
  if (!registro) {
    throw createError({ statusCode: 404, message: 'codigo' in datos ? 'Su pase ya no es válido. Regístrese de nuevo con su correo.' : 'No encontramos ese correo. Revise que esté bien escrito o regístrese.' })
  }
  if (!fechaIngresoHoy()) throw createError({ statusCode: 409, message: 'El registro de ingresos sólo está abierto los días del evento.' })
  return resultado(registro, true, await marcarIngreso(registro.id, 'AUTOREGISTRO'))
}

// -----------------------------------------------------------------------------
//  Plataforma (personal de la Federación)
// -----------------------------------------------------------------------------

export async function resumenRegistro() {
  const [total, porCategoria, porOrigen, porDia, nuevosPorDia, conteoDias] = await Promise.all([
    prisma.registroAsistente.count({ where: { eventoSlug: SLUG } }),
    prisma.registroAsistente.groupBy({ by: ['categoria'], where: { eventoSlug: SLUG }, _count: { _all: true } }),
    prisma.registroAsistente.groupBy({ by: ['origen'], where: { eventoSlug: SLUG }, _count: { _all: true } }),
    prisma.ingresoAsistente.groupBy({ by: ['fecha'], where: { registro: { eventoSlug: SLUG } }, _count: { _all: true }, orderBy: { fecha: 'asc' } }),
    prisma.$queryRaw<{ fecha: Date, n: bigint }[]>`
      SELECT ("creadoEn" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')::date AS fecha, count(*) AS n
      FROM "RegistroAsistente" WHERE "eventoSlug" = ${SLUG} GROUP BY 1`,
    prisma.$queryRaw<{ dias: number, n: bigint }[]>`
      SELECT d.dias::int AS dias, count(*) AS n FROM (
        SELECT r.id, count(i.id) AS dias FROM "RegistroAsistente" r
        LEFT JOIN "IngresoAsistente" i ON i."registroId" = r.id
        WHERE r."eventoSlug" = ${SLUG} GROUP BY r.id
      ) d GROUP BY 1`,
  ])
  const ingresos = new Map(porDia.map(d => [aTexto(d.fecha), d._count._all]))
  const nuevos = new Map(nuevosPorDia.map(d => [aTexto(d.fecha), Number(d.n)]))
  const fechasEvento = new Set<string>(DIAS_JORNADAS.map(d => d.fecha))
  return {
    ...estadoRegistro(),
    total,
    sinIngreso: Number(conteoDias.find(d => d.dias === 0)?.n ?? 0),
    todosLosDias: Number(conteoDias.find(d => d.dias >= DIAS_JORNADAS.length)?.n ?? 0),
    porDia: DIAS_JORNADAS.map(d => ({ ...d, ingresos: ingresos.get(d.fecha) ?? 0, nuevos: nuevos.get(d.fecha) ?? 0 })),
    /** Ingresos fuera de los días del evento (pruebas). */
    otrosDias: [...ingresos].filter(([f]) => !fechasEvento.has(f)).map(([fecha, n]) => ({ fecha, ingresos: n })),
    porCategoria: porCategoria.map(c => ({ categoria: c.categoria, etiqueta: NOMBRE_CATEGORIA[c.categoria], total: c._count._all })).sort((a, b) => b.total - a.total),
    porOrigen: Object.fromEntries(porOrigen.map(o => [o.origen, o._count._all])) as Partial<Record<OrigenRegistro, number>>,
  }
}

export async function listarRegistrados(q: string) {
  const texto = q.trim()
  const filas = await prisma.registroAsistente.findMany({
    where: {
      eventoSlug: SLUG,
      ...(texto ? { OR: [{ nombre: { contains: texto, mode: 'insensitive' } }, { correo: { contains: texto.toLowerCase() } }, { procedencia: { contains: texto, mode: 'insensitive' } }] } : {}),
    },
    orderBy: { creadoEn: 'desc' },
    take: 300,
    select: { id: true, nombre: true, correo: true, telefono: true, categoria: true, procedencia: true, origen: true, creadoEn: true, ingresos: { select: { fecha: true }, orderBy: { fecha: 'asc' } } },
  })
  return filas.map(({ ingresos, ...f }) => ({ ...f, dias: ingresos.map(i => aTexto(i.fecha)) }))
}
export type RegistradoDto = Awaited<ReturnType<typeof listarRegistrados>>[number]

export async function corregirIngreso(registroId: string, fecha: string, presente: boolean) {
  const registro = await prisma.registroAsistente.findFirst({ where: { id: registroId, eventoSlug: SLUG }, select: { id: true, nombre: true } })
  if (!registro) throw createError({ statusCode: 404, message: 'Registro no encontrado' })
  if (presente) {
    await prisma.ingresoAsistente.createMany({ data: [{ registroId, fecha: aDate(fecha), origen: 'MESA' }], skipDuplicates: true })
  }
  else {
    await prisma.ingresoAsistente.deleteMany({ where: { registroId, fecha: aDate(fecha) } })
  }
  return registro
}

export async function registradosCsv() {
  const filas = await listarTodos()
  return aCsv(
    ['Nombre', 'Correo', 'Teléfono', 'Categoría', 'Procedencia', 'Registro', ...DIAS_JORNADAS.map(d => d.etiqueta), 'Días asistidos', 'Origen'],
    filas.map(f => [
      f.nombre, f.correo, f.telefono, NOMBRE_CATEGORIA[f.categoria], f.procedencia,
      new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Mexico_City' }).format(f.creadoEn),
      ...DIAS_JORNADAS.map(d => (f.dias.includes(d.fecha) ? 'Sí' : '')),
      f.dias.filter(d => DIAS_JORNADAS.some(x => x.fecha === d)).length,
      f.origen === 'MESA' ? 'Mesa' : 'QR',
    ]),
  )
}

async function listarTodos() {
  const filas = await prisma.registroAsistente.findMany({
    where: { eventoSlug: SLUG },
    orderBy: { nombre: 'asc' },
    select: { nombre: true, correo: true, telefono: true, categoria: true, procedencia: true, origen: true, creadoEn: true, ingresos: { select: { fecha: true } } },
  })
  return filas.map(({ ingresos, ...f }) => ({ ...f, dias: ingresos.map(i => aTexto(i.fecha)) }))
}
