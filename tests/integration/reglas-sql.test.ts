import { describe, expect, it } from 'vitest'
import { auditar } from '../../server/utils/auditoria'
import { siguienteFolio } from '../../server/utils/folios'
import { prisma } from '../../server/utils/prisma'
import { crearRolPrueba, ctxPrueba, unico } from './helpers'

describe('reglas en la base', () => {
  it('la bitácora no se modifica ni se borra', async () => {
    const id = `prueba-${unico()}`
    await auditar(prisma, ctxPrueba, { accion: 'CREAR', entidad: 'Prueba', entidadId: id })
    const fila = await prisma.auditoria.findFirstOrThrow({ where: { entidadId: id } })
    await expect(prisma.auditoria.update({ where: { id: fila.id }, data: { motivo: 'x' } })).rejects.toThrow(/no se pueden modificar/)
    await expect(prisma.auditoria.delete({ where: { id: fila.id } })).rejects.toThrow(/no se pueden modificar/)
  })

  it('el correo se guarda normalizado', async () => {
    await expect(prisma.usuario.create({
      data: { email: `Mayus.${unico()}@Feacomech.test`, passwordHash: 'x', nombre: 'A', apellidoPaterno: 'B' },
    })).rejects.toThrow(/Usuario_email_normalizado/)
  })

  it('los roles del sistema no se borran y el superadministrador no se desactiva', async () => {
    const rol = await crearRolPrueba({})
    await prisma.rol.update({ where: { id: rol.id }, data: { sistema: true } })
    await expect(prisma.rol.delete({ where: { id: rol.id } })).rejects.toThrow(/no se puede borrar/)

    const superadmin = await prisma.rol.upsert({
      where: { clave: 'SUPERADMIN' },
      update: {},
      create: { clave: 'SUPERADMIN', nombre: 'Superadministrador', sistema: true },
    })
    await expect(prisma.rol.update({ where: { id: superadmin.id }, data: { activo: false } })).rejects.toThrow(/no se puede desactivar/)
  })

  it('un rol que no es del sistema sí se borra, con sus permisos', async () => {
    const rol = await crearRolPrueba({ 'censo.ver': 'TOTAL' })
    await prisma.rol.delete({ where: { id: rol.id } })
    expect(await prisma.rolPermiso.count({ where: { rolId: rol.id } })).toBe(0)
  })

  it('folios consecutivos sin repetir bajo concurrencia', async () => {
    const folios = await Promise.all(Array.from({ length: 8 }, () => prisma.$transaction(tx => siguienteFolio(tx, 'CREDENCIAL'))))
    expect(new Set(folios).size).toBe(8)
    expect(folios.every(f => /^CRED-\d{6}$/.test(f))).toBe(true)
  })
})
