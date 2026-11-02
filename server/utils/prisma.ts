import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Prisma } from '../generated/prisma/client'

function crearCliente() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Falta la variable de entorno DATABASE_URL')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

// Una sola instancia por proceso (en desarrollo sobrevive a la recarga en caliente).
const global = globalThis as unknown as { __feacomechPrisma?: ReturnType<typeof crearCliente> }

export const prisma = global.__feacomechPrisma ?? (global.__feacomechPrisma = crearCliente())

/** Cliente dentro de `prisma.$transaction(async tx => …)`. */
export type Tx = Prisma.TransactionClient

/** Acepta el cliente global o uno de transacción. */
export type Db = typeof prisma | Tx
