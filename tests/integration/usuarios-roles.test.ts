import { describe, expect, it } from 'vitest'
import { accesoDeUsuario } from '../../server/services/permisos'
import { actualizarRol, crearRol, eliminarRol } from '../../server/services/roles'
import { abrirSesion, validarSesion } from '../../server/services/sesiones'
import { actualizarUsuario, cambiarActivo, crearUsuario, listarUsuarios } from '../../server/services/usuarios'
import { PERMISOS } from '../../shared/permisos'
import { rolSchema } from '../../shared/schemas/rol'
import { prisma } from '../../server/utils/prisma'
import { crearRolPrueba, crearUsuarioPrueba, ctxPrueba, rolSuperadmin, unico } from './helpers'

const datosUsuario = (rolIds: string[] = []) => ({
  email: `nuevo.${unico()}@feacomech.test`,
  nombre: 'Ana',
  apellidoPaterno: 'Pérez',
  apellidoMaterno: null,
  telefono: null,
  rolIds,
})

async function admin(opts: { superadmin?: boolean } = {}) {
  const rolIds = opts.superadmin ? [(await rolSuperadmin()).id] : [(await crearRolPrueba({ 'usuario.administrar': 'TOTAL' })).id]
  const u = await crearUsuarioPrueba({ rolIds })
  return { ...u, ctx: { ...ctxPrueba, usuarioId: u.id } }
}

describe('administración de usuarios', () => {
  it('crea la cuenta con roles y genera la invitación (sin contraseña visible)', async () => {
    const a = await admin()
    const rol = await crearRolPrueba({ 'censo.ver': 'TOTAL' })
    const { usuario, invitacion } = await crearUsuario(datosUsuario([rol.id]), a.ctx)
    expect(usuario).toMatchObject({ roles: [{ id: rol.id }], sinActivar: true })
    expect(invitacion.enviado).toBe(false) // sin SMTP en pruebas
    expect(invitacion).toHaveProperty('enlace')
    expect(await prisma.tokenAcceso.count({ where: { usuarioId: usuario.id, tipo: 'INVITACION' } })).toBe(1)
    expect((await accesoDeUsuario(usuario.id)).permisos).toEqual({ 'censo.ver': 'TOTAL' })
  })

  it('correo duplicado → 409', async () => {
    const a = await admin()
    const d = datosUsuario()
    await crearUsuario(d, a.ctx)
    await expect(crearUsuario(d, a.ctx)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('sólo un superadministrador asigna o quita ese rol', async () => {
    const sup = await rolSuperadmin()
    const a = await admin()
    await expect(crearUsuario(datosUsuario([sup.id]), a.ctx)).rejects.toMatchObject({ statusCode: 403 })

    const s = await admin({ superadmin: true })
    const { usuario } = await crearUsuario(datosUsuario([sup.id]), s.ctx)
    await expect(actualizarUsuario(usuario.id, { ...datosUsuario(), email: usuario.email }, a.ctx)).rejects.toMatchObject({ statusCode: 403 })
    // Ni un superadministrador se lo quita a sí mismo
    await expect(actualizarUsuario(s.id, { ...datosUsuario(), email: s.email }, s.ctx)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('cambiar roles actualiza los permisos al instante y notifica', async () => {
    const a = await admin()
    const r1 = await crearRolPrueba({ 'censo.ver': 'TOTAL' })
    const r2 = await crearRolPrueba({ 'noticia.publicar': 'PROPIO' })
    const { usuario } = await crearUsuario(datosUsuario([r1.id]), a.ctx)
    await accesoDeUsuario(usuario.id) // queda en caché
    await actualizarUsuario(usuario.id, { ...datosUsuario([r2.id]), email: usuario.email }, a.ctx)
    expect((await accesoDeUsuario(usuario.id)).permisos).toEqual({ 'noticia.publicar': 'PROPIO' })
    expect(await prisma.notificacion.count({ where: { usuarioId: usuario.id, titulo: 'Sus roles cambiaron' } })).toBe(1)
  })

  it('desactivar cierra sus sesiones; no puede desactivarse a sí mismo', async () => {
    const a = await admin()
    const u = await crearUsuarioPrueba()
    const s = await abrirSesion(u.id, ctxPrueba)
    await cambiarActivo(u.id, false, 'Baja de prueba', a.ctx)
    expect(await validarSesion(s, u.id, 1)).toBe(false)
    expect(await prisma.sesion.findUniqueOrThrow({ where: { id: s } })).toMatchObject({ motivoCierre: 'DESACTIVADO' })
    await expect(cambiarActivo(a.id, false, 'x', a.ctx)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('con alcance ORGANIZACION sin organizaciones no lista a nadie', async () => {
    await crearUsuarioPrueba()
    const r = await listarUsuarios({ pagina: 1, porPagina: 5 }, { todas: false, ids: [] })
    expect(r).toMatchObject({ total: 0, datos: [] })
    expect((await listarUsuarios({ pagina: 1, porPagina: 5 }, { todas: true })).total).toBeGreaterThan(0)
  })
})

describe('roles', () => {
  const ctx = ctxPrueba

  it('crea y edita permisos; los cambios aplican de inmediato', async () => {
    const rol = await crearRol({ clave: `R_${unico().toUpperCase()}`, nombre: 'Coordinación', descripcion: null, activo: true, permisos: [{ permiso: 'noticia.publicar', alcance: 'PROPIO' }] }, ctx)
    const u = await crearUsuarioPrueba({ rolIds: [rol.id] })
    expect((await accesoDeUsuario(u.id)).permisos).toEqual({ 'noticia.publicar': 'PROPIO' })

    await actualizarRol(rol.id, { nombre: 'Coordinación', descripcion: null, activo: true, permisos: [{ permiso: 'noticia.publicar', alcance: 'TOTAL' }] }, ctx)
    expect((await accesoDeUsuario(u.id)).permisos).toEqual({ 'noticia.publicar': 'TOTAL' })
  })

  it('el esquema rechaza permisos desconocidos, repetidos o con alcance no válido', () => {
    const base = { nombre: 'X', descripcion: null, activo: true }
    expect(rolSchema.safeParse({ ...base, permisos: [{ permiso: 'no.existe', alcance: 'TOTAL' }] }).success).toBe(false)
    expect(rolSchema.safeParse({ ...base, permisos: [{ permiso: 'rol.administrar', alcance: 'ORGANIZACION' }] }).success).toBe(false)
    expect(rolSchema.safeParse({ ...base, permisos: [{ permiso: 'censo.ver', alcance: 'TOTAL' }, { permiso: 'censo.ver', alcance: 'TOTAL' }] }).success).toBe(false)
  })

  it('el superadministrador conserva todo el catálogo y no se desactiva', async () => {
    const sup = await rolSuperadmin()
    await actualizarRol(sup.id, { nombre: 'Superadministrador', descripcion: 'Acceso total', activo: true, permisos: [] }, ctx)
    expect(await prisma.rolPermiso.count({ where: { rolId: sup.id } })).toBe(PERMISOS.length)
    await expect(actualizarRol(sup.id, { nombre: 'Superadministrador', descripcion: null, activo: false, permisos: [] }, ctx)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('sólo se eliminan roles creados desde el panel y sin usuarios', async () => {
    const libre = await crearRolPrueba({})
    const ocupado = await crearRolPrueba({})
    await crearUsuarioPrueba({ rolIds: [ocupado.id] })
    await expect(eliminarRol(ocupado.id, ctx)).rejects.toMatchObject({ statusCode: 409 })
    await expect(eliminarRol((await rolSuperadmin()).id, ctx)).rejects.toMatchObject({ statusCode: 400 })
    await eliminarRol(libre.id, ctx)
    expect(await prisma.rol.findUnique({ where: { id: libre.id } })).toBeNull()
  })
})
