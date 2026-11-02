// Datos iniciales. Idempotente: se puede correr varias veces sin duplicar ni sobrescribir
// lo que los administradores ya hayan editado (roles, permisos, parámetros).
//   npm run db:seed
//
// No se carga información institucional inventada: organizaciones, mesa directiva,
// noticias y eventos los captura la Federación desde el panel.
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../server/generated/prisma/client'
import { DEFINICION_PARAMETROS } from '../../shared/parametros'
import { PERMISOS_INICIALES, ROLES_INICIALES, ROL_SUPERADMIN, entradasPermisos } from '../../shared/permisos'
import { correoSchema } from '../../shared/schemas/auth'
import { hashContrasena } from '../../server/utils/contrasenas'
import { REGIONES } from './chiapas'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function sembrarRoles() {
  for (const r of ROLES_INICIALES) {
    const existente = await prisma.rol.findUnique({ where: { clave: r.clave } })
    if (existente) continue // ya existe: sus permisos los administra la Federación
    await prisma.rol.create({
      data: {
        ...r,
        sistema: true,
        permisos: { create: entradasPermisos(PERMISOS_INICIALES[r.clave]).map(([permiso, alcance]) => ({ permiso, alcance })) },
      },
    })
    console.log(`  Rol ${r.clave} creado.`)
  }

  // El superadministrador siempre tiene todos los permisos del catálogo (incluidos los nuevos).
  const superadmin = await prisma.rol.findUniqueOrThrow({ where: { clave: ROL_SUPERADMIN } })
  for (const [permiso, alcance] of entradasPermisos(PERMISOS_INICIALES.SUPERADMIN)) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permiso: { rolId: superadmin.id, permiso } },
      update: { alcance },
      create: { rolId: superadmin.id, permiso, alcance },
    })
  }
}

// Catálogo inicial de especialidades (nombres de uso general en México). Es configurable:
// la Federación agrega, renombra o desactiva desde Configuración → Especialidades.
const ESPECIALIDADES = [
  'Medicina general',
  'Medicina familiar',
  'Medicina interna',
  'Cardiología',
  'Cirugía general',
  'Pediatría',
  'Ginecología y obstetricia',
  'Anestesiología',
  'Medicina de urgencias',
  'Traumatología y ortopedia',
  'Dermatología',
  'Oftalmología',
  'Psiquiatría',
  'Imagenología diagnóstica y terapéutica',
]

async function sembrarEspecialidades() {
  if (await prisma.especialidad.count()) return // ya administradas desde el panel
  await prisma.especialidad.createMany({ data: ESPECIALIDADES.map(nombre => ({ nombre })) })
  console.log(`  ${ESPECIALIDADES.length} especialidades creadas.`)
}

/**
 * Estructura base de la Federación: órganos y cargos genéricos, SIN personas. Es una plantilla
 * configurable: la Federación ajusta cargos y captura los nombramientos que valide.
 */
async function sembrarEstructura() {
  if (await prisma.organo.count({ where: { organizacionId: null } })) return
  const mesa = await prisma.organo.create({ data: { tipo: 'MESA_DIRECTIVA', nombre: 'Mesa directiva', orden: 0 } })
  const presidencia = await prisma.cargo.create({ data: { organoId: mesa.id, nombre: 'Presidencia', orden: 0 } })
  const subordinados = ['Vicepresidencia', 'Secretaría general', 'Tesorería', 'Vocalía']
  for (const [i, nombre] of subordinados.entries()) {
    await prisma.cargo.create({ data: { organoId: mesa.id, nombre, orden: i + 1, superiorId: presidencia.id } })
  }
  const consejo = await prisma.organo.create({ data: { tipo: 'CONSEJO_CONSULTIVO', nombre: 'Consejo consultivo', orden: 1 } })
  await prisma.cargo.create({ data: { organoId: consejo.id, nombre: 'Consejero(a)', orden: 0 } })
  console.log('  Estructura base creada (órganos y cargos, sin nombramientos).')
}

/** Sin acentos ni símbolos, para los slugs de los grupos. */
const slug = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Categorías de la biblioteca institucional (configurables después). */
const CATEGORIAS_DOCUMENTO = [
  'Estatutos', 'Reglamentos', 'Actas', 'Convocatorias', 'Oficios', 'Convenios',
  'Documentos académicos', 'Publicaciones científicas', 'Material de congresos',
]

/** Regiones y municipios de Chiapas (sólo crea lo que falte; no cambia asignaciones ya corregidas). */
async function sembrarGeografia() {
  for (const r of REGIONES) {
    const region = await prisma.region.upsert({ where: { numero: r.numero }, update: {}, create: { numero: r.numero, nombre: r.nombre } })
    for (const nombre of r.municipios) {
      if (!(await prisma.municipio.findUnique({ where: { nombre } }))) await prisma.municipio.create({ data: { nombre, regionId: region.id } })
    }
  }
}

async function sembrarCategoriasDocumento() {
  for (const [orden, nombre] of CATEGORIAS_DOCUMENTO.entries()) {
    const existente = await prisma.categoriaDocumento.findUnique({ where: { nombre } })
    if (!existente) await prisma.categoriaDocumento.create({ data: { nombre, slug: slug(nombre), orden } })
  }
}

/**
 * Espacios de la comunidad: general, debates académicos, uno por especialidad principal y uno
 * (privado) por organización. Idempotente: sólo crea los que falten.
 */
async function sembrarComunidad() {
  const base = [
    { tipo: 'GENERAL', nombre: 'Comunidad general', slug: 'comunidad-general', privacidad: 'ABIERTO', descripcion: 'Espacio de comunicación para todos los integrantes de la plataforma.' },
    { tipo: 'DEBATE', nombre: 'Debates académicos', slug: 'debates-academicos', privacidad: 'ABIERTO', descripcion: 'Temas científicos, casos de estudio sin datos de pacientes y publicaciones.' },
  ] as const
  for (const g of base) {
    if (!(await prisma.grupo.findUnique({ where: { slug: g.slug } }))) await prisma.grupo.create({ data: g })
  }
  for (const e of await prisma.especialidad.findMany({ where: { padreId: null, grupos: { none: {} } } })) {
    await prisma.grupo.create({ data: { tipo: 'ESPECIALIDAD', especialidadId: e.id, privacidad: 'MIEMBROS', nombre: e.nombre, slug: `esp-${slug(e.nombre)}-${e.id.slice(-4)}` } })
  }
  for (const o of await prisma.organizacion.findMany({ where: { grupo: null } })) {
    await prisma.grupo.create({ data: { tipo: 'ORGANIZACION', organizacionId: o.id, privacidad: 'PRIVADO', nombre: o.nombre, descripcion: 'Espacio de comunicación de los integrantes de la organización.', slug: `org-${o.slug}` } })
  }
}

async function sembrarParametros() {
  for (const [clave, def] of Object.entries(DEFINICION_PARAMETROS)) {
    await prisma.parametro.upsert({
      where: { clave },
      update: { descripcion: def.descripcion },
      create: { clave, valor: def.defecto, descripcion: def.descripcion },
    })
  }
}

async function sembrarSuperadmin() {
  const email = correoSchema.parse(process.env.SEED_ADMIN_EMAIL ?? 'admin@feacomech.local')
  if (await prisma.usuario.findUnique({ where: { email } })) return
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!password) throw new Error('Defina SEED_ADMIN_PASSWORD en .env para crear el superadministrador')

  const rol = await prisma.rol.findUniqueOrThrow({ where: { clave: ROL_SUPERADMIN } })
  await prisma.usuario.create({
    data: {
      email,
      passwordHash: await hashContrasena(password),
      nombre: 'Administrador',
      apellidoPaterno: 'del sistema',
      debeCambiarPassword: true,
      roles: { create: { rolId: rol.id } },
    },
  })
  console.log(`  Superadministrador ${email} creado (se pedirá cambiar la contraseña al entrar).`)
}

async function main() {
  console.log('Sembrando datos iniciales…')
  await sembrarRoles()
  await sembrarParametros()
  await sembrarEspecialidades()
  await sembrarEstructura()
  await sembrarComunidad()
  await sembrarCategoriasDocumento()
  await sembrarGeografia()
  await sembrarSuperadmin()
  console.log('Listo.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
