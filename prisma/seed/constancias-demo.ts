// Constancias de DEMOSTRACIÓN de las Jornadas 2026, para revisar el apartado en local.
//   npm run db:constancias-demo
// Ponentes y coordinadores salen del temario oficial (sin correo: sólo se encuentran por
// folio). Los asistentes son ficticios, marcados "(demo)" con correos @demo.feacomech.local.
// Idempotente: borra y vuelve a crear las del evento. No se ejecuta en producción.
import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../server/generated/prisma/client'
import { JORNADAS_2026 as J } from '../../shared/jornadas2026'
import { PROGRAMA_2026 } from '../../shared/jornadas2026-programa'

if (process.env.NODE_ENV === 'production') {
  console.error('Las constancias de demostración no se cargan en producción.')
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const codigo = () => randomBytes(18).toString('base64url')

type Tipo = 'ASISTENTE' | 'PONENTE' | 'TALLER' | 'CARTEL' | 'COORDINADOR'
interface Fila { tipo: Tipo, nombre: string, correo?: string, detalle?: string, horas?: number }

const actividades = PROGRAMA_2026.flatMap(d => d.actividades)
const filas: Fila[] = [
  // Asistentes de demostración (con correo, para probar la búsqueda)
  { tipo: 'ASISTENTE', nombre: 'Ana Sofía Ruiz Pérez (demo)', correo: 'ana.ruiz@demo.feacomech.local', horas: 24 },
  { tipo: 'TALLER', nombre: 'Ana Sofía Ruiz Pérez (demo)', correo: 'ana.ruiz@demo.feacomech.local', detalle: 'Electrocardiografía para Médicos Generales', horas: 2 },
  { tipo: 'CARTEL', nombre: 'Ana Sofía Ruiz Pérez (demo)', correo: 'ana.ruiz@demo.feacomech.local', detalle: 'Prevalencia de dermatitis atópica en escolares de Tuxtla Gutiérrez' },
  { tipo: 'ASISTENTE', nombre: 'Luis Alberto Gómez Hernández (demo)', correo: 'luis.gomez@demo.feacomech.local', horas: 24 },
  { tipo: 'TALLER', nombre: 'Luis Alberto Gómez Hernández (demo)', correo: 'luis.gomez@demo.feacomech.local', detalle: 'Accesos Vasculares', horas: 2 },
  { tipo: 'ASISTENTE', nombre: 'Mariana López Cruz (demo)', correo: 'mariana.lopez@demo.feacomech.local', horas: 24 },
  // Ponentes del temario (una constancia por ponencia o taller impartido)
  ...actividades
    .filter(a => (a.tipo === 'ponencia' || a.tipo === 'taller') && a.ponente && !a.ponente.startsWith('Dermatólogos del'))
    .map(a => ({ tipo: 'PONENTE' as const, nombre: a.ponente!, detalle: a.tipo === 'taller' ? `Taller: ${a.titulo}` : a.titulo })),
  // Coordinadores de bloque
  ...[...new Map(actividades.filter(a => a.bloque && a.coordina).map(a => [`${a.coordina}|${a.bloque}`, a])).values()]
    .flatMap(a => a.coordina!.split(/\s+y\s+/).map(nombre => ({ tipo: 'COORDINADOR' as const, nombre, detalle: a.bloque! }))),
]

async function main() {
  await prisma.participacionEvento.deleteMany({ where: { eventoSlug: J.slug } })
  await prisma.participacionEvento.createMany({
    data: filas.map((f, i) => ({
      eventoSlug: J.slug,
      folio: `JAF-26-${String(i + 1).padStart(4, '0')}`,
      codigo: codigo(),
      tipo: f.tipo,
      nombre: f.nombre,
      correo: f.correo ?? null,
      detalle: f.detalle ?? null,
      horas: f.horas ?? null,
      emitidaEn: new Date('2026-11-28T18:00:00-06:00'),
    })),
  })
  const porTipo = filas.reduce<Record<string, number>>((m, f) => ({ ...m, [f.tipo]: (m[f.tipo] ?? 0) + 1 }), {})
  console.log(`Constancias de demostración: ${filas.length}`, porTipo)
  console.log('Pruebe la búsqueda con: ana.ruiz@demo.feacomech.local · luis.gomez@demo.feacomech.local · JAF-26-0007')
}

main().finally(() => prisma.$disconnect())
