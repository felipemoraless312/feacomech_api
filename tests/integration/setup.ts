// Corre antes de importar cada archivo de prueba: el cliente Prisma
// (server/utils/prisma.ts) se conecta a la base de pruebas, nunca a la de desarrollo.
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import 'dotenv/config'

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
// Archivos subidos en una carpeta temporal; correos a la bandeja en memoria (sin SMTP).
process.env.NUXT_DIR_ALMACEN = join(tmpdir(), 'feacomech-pruebas-almacen')
delete process.env.NUXT_SMTP_HOST
