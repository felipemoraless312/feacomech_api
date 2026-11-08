import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed/index.ts',
  },
  datasource: {
    // `env()` lanza un error si la variable no existe, y `prisma generate` (postinstall)
    // corre en entornos sin base de datos (p. ej. la instalación en Vercel). Generar el
    // cliente no necesita la URL; migrate/db/studio sí y fallarán con un mensaje claro.
    url: process.env.DATABASE_URL ?? '',
  },
})
