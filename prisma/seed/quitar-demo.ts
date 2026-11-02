// Retira los datos de DEMOSTRACIÓN (npm run db:demo):
//   npm run db:quitar-demo
// Borra las organizaciones "[DEMO]" con sus membresías, roles y grupos. Las cuentas
// @demo.feacomech.local se borran; si ya tienen historial en la bitácora (que no se puede
// alterar), se desactivan.
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../server/generated/prisma/client'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const orgs = await prisma.organizacion.findMany({ where: { slug: { startsWith: 'demo-' } }, select: { id: true, nombre: true } })
  const ids = orgs.map(o => o.id)
  if (ids.length) {
    await prisma.$transaction(async (tx) => {
      await tx.membresia.deleteMany({ where: { organizacionId: { in: ids } } })
      await tx.solicitudCambio.deleteMany({ where: { organizacionId: { in: ids } } })
      await tx.noticia.updateMany({ where: { organizacionId: { in: ids } }, data: { organizacionId: null } })
      await tx.evento.updateMany({ where: { organizacionId: { in: ids } }, data: { organizacionId: null } })
      await tx.documento.deleteMany({ where: { organizacionId: { in: ids } } })
      await tx.nombramiento.updateMany({ where: { organizacionProcedenciaId: { in: ids } }, data: { organizacionProcedenciaId: null } })
      await tx.organizacion.deleteMany({ where: { id: { in: ids } } }) // roles, grupos, órganos y periodos en cascada
    })
    console.log(`  ${ids.length} organización(es) de demostración eliminada(s).`)
  }

  const usuarios = await prisma.usuario.findMany({ where: { email: { endsWith: '@demo.feacomech.local' } }, select: { id: true, email: true } })
  let borrados = 0
  let desactivados = 0
  for (const u of usuarios) {
    try {
      await prisma.usuario.delete({ where: { id: u.id } })
      borrados++
    }
    catch {
      await prisma.usuario.update({ where: { id: u.id }, data: { activo: false, versionSesion: { increment: 1 } } })
      await prisma.usuarioRol.deleteMany({ where: { usuarioId: u.id } })
      await prisma.perfilProfesional.updateMany({ where: { usuarioId: u.id }, data: { publicarDirectorio: false, consentimientoEn: null } })
      desactivados++
    }
  }
  console.log(`  Cuentas de demostración: ${borrados} eliminada(s), ${desactivados} desactivada(s) (tenían historial).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
