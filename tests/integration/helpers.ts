import { hashContrasena } from '../../server/utils/contrasenas'
import { prisma } from '../../server/utils/prisma'
import type { Alcance, Permiso } from '../../shared/permisos'

/** Sufijo único: las pruebas no borran datos (la bitácora es de sólo inserción). */
export const unico = () => Math.random().toString(36).slice(2, 10)

export const ctxPrueba = { ip: '127.0.0.1', userAgent: 'vitest' }

/** Rol de prueba con los permisos indicados. */
export async function crearRolPrueba(permisos: Partial<Record<Permiso, Alcance>>) {
  return prisma.rol.create({
    data: {
      clave: `PRUEBA_${unico().toUpperCase()}`,
      nombre: 'Rol de prueba',
      permisos: { create: Object.entries(permisos).map(([permiso, alcance]) => ({ permiso, alcance: alcance! })) },
    },
  })
}

/** Rol de superadministrador (la base de pruebas no corre el seed). */
export function rolSuperadmin() {
  return prisma.rol.upsert({
    where: { clave: 'SUPERADMIN' },
    update: {},
    create: { clave: 'SUPERADMIN', nombre: 'Superadministrador', sistema: true },
  })
}

export async function crearUsuarioPrueba(opts: { rolIds?: string[], contrasena?: string, activo?: boolean } = {}) {
  return prisma.usuario.create({
    data: {
      email: `prueba.${unico()}@feacomech.test`,
      passwordHash: await hashContrasena(opts.contrasena ?? 'Correcta-2026'),
      nombre: 'Prueba',
      apellidoPaterno: 'Integración',
      debeCambiarPassword: false,
      activo: opts.activo ?? true,
      roles: { create: (opts.rolIds ?? []).map(rolId => ({ rolId })) },
    },
  })
}
