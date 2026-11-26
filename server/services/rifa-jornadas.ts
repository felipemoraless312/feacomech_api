// Rifa de las Jornadas 2026 (sólo el superadministrador).
//
// Hay una rifa por día: participan quienes marcaron su ingreso a la sede ese día y aún no
// han ganado ese día. El sorteo ocurre aquí con números aleatorios criptográficos, nunca en
// el navegador; la ruleta de la plataforma sólo lo anima.
import { randomInt } from 'node:crypto'
import { createError } from 'h3'
import { JORNADAS_2026 } from '~~/shared/jornadas2026'
import type { EstadoGanadorRifa } from '../generated/prisma/enums'
import { prisma } from '../utils/prisma'
import { esSuperadmin } from './usuarios'

const SLUG = JORNADAS_2026.slug

const aDate = (fecha: string) => new Date(`${fecha}T00:00:00Z`)

/** Exige el rol de superadministrador (403 si no). */
export async function exigirSuperadmin(usuarioId: string) {
  if (!(await esSuperadmin(usuarioId))) throw createError({ statusCode: 403, message: 'Sólo el superadministrador puede usar la rifa' })
}

// Registros de prueba que no deben entrar a la rifa ("test", "prueba 14", "hola", correos de ejemplo).
const PRUEBA_NOMBRE = /\b(test(s|ing)?\d*|pruebas?\d*|demo\d*|ejemplos?\d*|ho+la\d*|hola ?mundo|asdf\w*|qwert\w*|fake|dummy)\b/
const PRUEBA_CORREO = /(^|[^a-z])(test|prueba|ejemplo|example|fake|dummy)s?\d*([^a-z]|$)|^ho+la\d*@/
const sinAcentos = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export function esRegistroPrueba(nombre: string, correo: string) {
  return PRUEBA_NOMBRE.test(sinAcentos(nombre)) || PRUEBA_CORREO.test(correo.trim().toLowerCase())
}

/** Quienes ingresaron ese día y todavía no ganan ese día; aparte, los descartados por parecer prueba. */
async function candidatos(fecha: string, db: Pick<typeof prisma, 'registroAsistente'> = prisma) {
  const filas = await db.registroAsistente.findMany({
    where: {
      eventoSlug: SLUG,
      ingresos: { some: { fecha: aDate(fecha) } },
      ganadoresRifa: { none: { fecha: aDate(fecha) } },
    },
    select: { id: true, nombre: true, correo: true, procedencia: true },
  })
  const elegibles: typeof filas = []
  const prueba: typeof filas = []
  for (const f of filas) (esRegistroPrueba(f.nombre, f.correo) ? prueba : elegibles).push(f)
  return { elegibles, prueba }
}

/** Mezcla Fisher–Yates con números criptográficos. */
function mezclar<T>(lista: T[]): T[] {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Participantes del día en orden aleatorio, para dibujar la ruleta. */
export async function elegiblesRifa(fecha: string) {
  const { elegibles, prueba } = await candidatos(fecha)
  return {
    fecha,
    total: elegibles.length,
    nombres: mezclar(elegibles).map(e => e.nombre),
    excluidosPrueba: prueba.map(p => ({ nombre: p.nombre, correo: p.correo })),
  }
}

export interface GanadorRifaDto {
  id: string
  numero: number
  nombre: string
  correo: string
  telefono: string | null
  procedencia: string | null
  premio: string | null
  estado: EstadoGanadorRifa
  sorteadoEn: Date
  entregadoEn: Date | null
}

const SELECT_GANADOR = {
  id: true, numero: true, premio: true, estado: true, sorteadoEn: true, entregadoEn: true,
  registro: { select: { nombre: true, correo: true, telefono: true, procedencia: true } },
} as const

type FilaGanador = { id: string, numero: number, premio: string | null, estado: EstadoGanadorRifa, sorteadoEn: Date, entregadoEn: Date | null, registro: { nombre: string, correo: string, telefono: string | null, procedencia: string | null } }
const aDto = ({ registro, ...g }: FilaGanador): GanadorRifaDto => ({ ...g, ...registro })

export async function ganadoresRifa(fecha: string): Promise<GanadorRifaDto[]> {
  const filas = await prisma.ganadorRifa.findMany({ where: { eventoSlug: SLUG, fecha: aDate(fecha) }, orderBy: { numero: 'desc' }, select: SELECT_GANADOR })
  return filas.map(aDto)
}

/** Elige y guarda los ganadores de un giro. */
export async function girarRifa(fecha: string, cantidad: number, premio: string | null): Promise<GanadorRifaDto[]> {
  return prisma.$transaction(async (tx) => {
    // Un solo sorteo a la vez (dos pestañas abiertas no pueden repetir ganador ni número).
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`rifa:${SLUG}`}))`
    const { elegibles } = await candidatos(fecha, tx)
    if (!elegibles.length) throw createError({ statusCode: 400, message: 'No quedan participantes por sortear hoy' })

    const elegidos = mezclar(elegibles).slice(0, Math.min(cantidad, elegibles.length))
    const ultimo = await tx.ganadorRifa.aggregate({ where: { eventoSlug: SLUG, fecha: aDate(fecha) }, _max: { numero: true } })
    const siguiente = (ultimo._max.numero ?? 0) + 1

    const creados: GanadorRifaDto[] = []
    for (const [i, e] of elegidos.entries()) {
      const g = await tx.ganadorRifa.create({
        data: { eventoSlug: SLUG, fecha: aDate(fecha), numero: siguiente + i, registroId: e.id, premio },
        select: SELECT_GANADOR,
      })
      creados.push(aDto(g))
    }
    return creados
  })
}

export async function actualizarGanadorRifa(id: string, cambios: { estado?: EstadoGanadorRifa, premio?: string | null }) {
  const g = await prisma.ganadorRifa.findFirst({ where: { id, eventoSlug: SLUG }, select: { id: true } })
  if (!g) throw createError({ statusCode: 404, message: 'Ganador no encontrado' })
  return aDto(await prisma.ganadorRifa.update({
    where: { id },
    data: {
      ...(cambios.estado ? { estado: cambios.estado, entregadoEn: cambios.estado === 'ENTREGADO' ? new Date() : null } : {}),
      ...(cambios.premio !== undefined ? { premio: cambios.premio?.trim() || null } : {}),
    },
    select: SELECT_GANADOR,
  }))
}

/** Borra los ganadores del día: todos vuelven a participar. No toca la asistencia. */
export async function reiniciarRifa(fecha: string) {
  const { count } = await prisma.ganadorRifa.deleteMany({ where: { eventoSlug: SLUG, fecha: aDate(fecha) } })
  return count
}
