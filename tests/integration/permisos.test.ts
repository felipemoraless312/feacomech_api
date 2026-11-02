import { describe, expect, it } from 'vitest'
import { accesoDeUsuario, invalidarPermisos } from '../../server/services/permisos'
import { prisma } from '../../server/utils/prisma'
import { crearRolPrueba, crearUsuarioPrueba } from './helpers'

describe('permisos desde la base', () => {
  it('une los permisos de varios roles con el alcance más amplio', async () => {
    const a = await crearRolPrueba({ 'evento.gestionar': 'ORGANIZACION', 'comunidad.participar': 'TOTAL' })
    const b = await crearRolPrueba({ 'evento.gestionar': 'TOTAL' })
    const u = await crearUsuarioPrueba({ rolIds: [a.id, b.id] })

    const { roles, permisos } = await accesoDeUsuario(u.id)
    expect(roles).toHaveLength(2)
    expect(permisos).toEqual({ 'evento.gestionar': 'TOTAL', 'comunidad.participar': 'TOTAL' })
  })

  it('un rol desactivado deja de otorgar permisos', async () => {
    const rol = await crearRolPrueba({ 'censo.ver': 'TOTAL' })
    const u = await crearUsuarioPrueba({ rolIds: [rol.id] })
    expect((await accesoDeUsuario(u.id)).permisos).toEqual({ 'censo.ver': 'TOTAL' })

    await prisma.rol.update({ where: { id: rol.id }, data: { activo: false } })
    invalidarPermisos(u.id)
    expect((await accesoDeUsuario(u.id)).permisos).toEqual({})
  })

  it('ignora permisos que ya no existen en el catálogo', async () => {
    const rol = await crearRolPrueba({})
    await prisma.rolPermiso.create({ data: { rolId: rol.id, permiso: 'permiso.retirado', alcance: 'TOTAL' } })
    const u = await crearUsuarioPrueba({ rolIds: [rol.id] })
    expect((await accesoDeUsuario(u.id)).permisos).toEqual({})
  })

  it('un usuario sin roles no tiene permisos', async () => {
    const u = await crearUsuarioPrueba()
    expect(await accesoDeUsuario(u.id)).toEqual({ roles: [], permisos: {}, organizaciones: {} })
  })
})
