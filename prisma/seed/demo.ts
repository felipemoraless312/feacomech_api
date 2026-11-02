// Datos de DEMOSTRACIÓN para ver la plataforma con contenido en desarrollo.
//   npm run db:demo
// Todo va marcado: organizaciones con "[DEMO]", personas con "(demo)" y correos
// @demo.feacomech.local. No son datos de la Federación. Nunca se carga en producción.
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../server/generated/prisma/client'
import { hashContrasena } from '../../server/utils/contrasenas'

if (process.env.NODE_ENV === 'production') {
  console.error('Los datos de demostración no se cargan en producción.')
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const CONTRASENA = 'Demo-Feacomech-2026'
const fecha = (iso: string) => new Date(`${iso}T00:00:00Z`)

const ORGANIZACIONES = [
  { slug: 'demo-colegio-a', tipo: 'COLEGIO', nombre: '[DEMO] Colegio Médico de Ejemplo A', siglas: 'DEMO-A', municipio: 'Tuxtla Gutiérrez', estado: 'AFILIADA', desde: '2021-03-01' },
  { slug: 'demo-colegio-b', tipo: 'COLEGIO', nombre: '[DEMO] Colegio Médico de Ejemplo B', siglas: 'DEMO-B', municipio: 'Tapachula', estado: 'AFILIADA', desde: '2022-08-15' },
  { slug: 'demo-asociacion-c', tipo: 'ASOCIACION', nombre: '[DEMO] Asociación de Especialistas de Ejemplo C', siglas: 'DEMO-C', municipio: 'San Cristóbal de las Casas', estado: 'EN_TRAMITE', desde: '2026-09-01' },
] as const

const MEDICOS = [
  { nombre: 'Andrea', apellido: 'Ruiz', esp: 'Pediatría', org: 'demo-colegio-a', estado: 'ACTIVA', publica: true },
  { nombre: 'Carlos', apellido: 'Méndez', esp: 'Cardiología', org: 'demo-colegio-a', estado: 'ACTIVA', publica: true },
  { nombre: 'Daniela', apellido: 'Torres', esp: 'Medicina familiar', org: 'demo-colegio-a', estado: 'ACTIVA', publica: false },
  { nombre: 'Ernesto', apellido: 'López', esp: 'Cirugía general', org: 'demo-colegio-b', estado: 'ACTIVA', publica: true },
  { nombre: 'Fernanda', apellido: 'Cruz', esp: 'Ginecología y obstetricia', org: 'demo-colegio-b', estado: 'ACTIVA', publica: false },
  { nombre: 'Gabriel', apellido: 'Hernández', esp: 'Anestesiología', org: 'demo-colegio-a', estado: 'SOLICITADA', publica: false },
  { nombre: 'Hilda', apellido: 'Pérez', esp: 'Medicina interna', org: 'demo-asociacion-c', estado: 'SOLICITADA', publica: false },
] as const

async function main() {
  console.log('Cargando datos de demostración…')
  const passwordHash = await hashContrasena(CONTRASENA)
  const especialidades = new Map((await prisma.especialidad.findMany({ where: { padreId: null } })).map(e => [e.nombre, e.id]))
  const rolAfiliado = await prisma.rol.findUnique({ where: { clave: 'MEDICO_AFILIADO' } })
  const rolRepresentante = await prisma.rol.findUnique({ where: { clave: 'REPRESENTANTE_COLEGIO' } })

  const orgs = new Map<string, string>()
  for (const o of ORGANIZACIONES) {
    const existente = await prisma.organizacion.findUnique({ where: { slug: o.slug } })
    const org = existente ?? await prisma.organizacion.create({
      data: {
        slug: o.slug,
        tipo: o.tipo,
        nombre: o.nombre,
        siglas: o.siglas,
        municipio: o.municipio,
        descripcion: 'Organización de DEMOSTRACIÓN para probar la plataforma. No corresponde a ninguna organización real.',
        estadoAfiliacion: o.estado,
        afiliaciones: { create: { estado: o.estado, desde: fecha(o.desde), motivo: 'Datos de demostración' } },
      },
    })
    orgs.set(o.slug, org.id)
  }

  for (const [i, m] of MEDICOS.entries()) {
    const email = `${m.nombre.toLowerCase()}.${m.apellido.toLowerCase()}@demo.feacomech.local`
    if (await prisma.usuario.findUnique({ where: { email } })) continue
    const activa = m.estado === 'ACTIVA'
    await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre: m.nombre,
        apellidoPaterno: `${m.apellido} (demo)`,
        debeCambiarPassword: false,
        ultimoAcceso: activa ? new Date() : null,
        perfil: {
          create: {
            cedulaProfesional: String(9000000 + i),
            especialidadId: especialidades.get(m.esp) ?? null,
            publicarDirectorio: m.publica,
            consentimientoEn: m.publica ? new Date() : null,
          },
        },
        membresias: {
          create: {
            organizacionId: orgs.get(m.org)!,
            estado: m.estado,
            desde: activa ? fecha(`2026-0${1 + (i % 9)}-15`) : null,
            comentario: activa ? null : 'Solicitud de demostración',
          },
        },
        ...(activa && rolAfiliado ? { roles: { create: { rolId: rolAfiliado.id } } } : {}),
      },
    })
  }

  // Representante del colegio A, para probar la vista con alcance de organización.
  const repEmail = 'representante@demo.feacomech.local'
  if (rolRepresentante && !(await prisma.usuario.findUnique({ where: { email: repEmail } }))) {
    await prisma.usuario.create({
      data: {
        email: repEmail,
        passwordHash,
        nombre: 'Representante',
        apellidoPaterno: 'Colegio A (demo)',
        debeCambiarPassword: false,
        roles: { create: { rolId: rolRepresentante.id, organizacionId: orgs.get('demo-colegio-a')! } },
      },
    })
  }

  console.log(`Listo. Usuarios de demostración con contraseña "${CONTRASENA}":`)
  console.log(`  ${repEmail} (representante del Colegio A)`)
  console.log('  andrea.ruiz@demo.feacomech.local (médica afiliada)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
