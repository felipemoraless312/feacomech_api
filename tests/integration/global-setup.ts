// Aplica las migraciones pendientes a la base de pruebas (docker compose, servicio
// "db-test") antes de correr las pruebas de integración.
// No se borra nada: esa base vive en tmpfs y se crea vacía cada vez que arranca su
// contenedor, y las pruebas no dependen de una base limpia (usan datos con sufijo único).
import { execSync } from 'node:child_process'
import 'dotenv/config'

export default function setup() {
  const url = process.env.DATABASE_URL_TEST
  if (!url) throw new Error('Defina DATABASE_URL_TEST en .env (ver .env.example)')
  if (url === process.env.DATABASE_URL) throw new Error('DATABASE_URL_TEST no puede ser la base de desarrollo')
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  })
}
