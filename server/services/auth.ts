import type { User } from '#auth-utils'
import { createError } from 'h3'
import type { CambiarPasswordInput, LoginInput } from '../../shared/schemas/auth'
import { nombreCompleto } from '../../shared/texto'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { hashContrasena, obtenerHashSenuelo, verificarContrasena } from '../utils/contrasenas'
import { prisma } from '../utils/prisma'
import { notificar } from './notificaciones'
import { cerrarSesiones } from './sesiones'

export const MAX_INTENTOS = 5
export const BLOQUEO_MINUTOS = 15

export const SELECT_USUARIO_SESION = {
  id: true,
  email: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  debeCambiarPassword: true,
  versionSesion: true,
} as const

type FilaSesion = {
  id: string
  email: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  debeCambiarPassword: boolean
  versionSesion: number
}

export function aUsuarioSesion(u: FilaSesion): User {
  return {
    id: u.id,
    email: u.email,
    nombre: nombreCompleto(u),
    debeCambiarPassword: u.debeCambiarPassword,
    versionSesion: u.versionSesion,
  }
}

const credencialesInvalidas = () =>
  createError({ statusCode: 401, message: 'Correo o contraseña incorrectos' })

/**
 * Verifica credenciales. Cinco intentos fallidos seguidos bloquean la cuenta 15 minutos.
 * Todo intento (exitoso o no) queda en la bitácora.
 */
export async function iniciarSesion(datos: LoginInput, ctx: ContextoAuditoria, ahora = new Date()): Promise<User> {
  const u = await prisma.usuario.findUnique({
    where: { email: datos.email },
    select: { ...SELECT_USUARIO_SESION, passwordHash: true, activo: true, bloqueadoHasta: true },
  })

  const fallido = (entidadId: string, motivo: string, usuarioId: string | null = null) =>
    auditar(prisma, { ...ctx, usuarioId }, { accion: 'LOGIN_FALLIDO', entidad: 'Usuario', entidadId, motivo })

  if (!u) {
    await verificarContrasena(await obtenerHashSenuelo(), datos.password) // mismo tiempo de respuesta
    await fallido(datos.email, 'Usuario inexistente')
    throw credencialesInvalidas()
  }

  if (u.bloqueadoHasta && u.bloqueadoHasta > ahora) {
    await fallido(u.id, 'Cuenta bloqueada', u.id)
    throw createError({
      statusCode: 423,
      message: `Cuenta bloqueada por intentos fallidos. Intente de nuevo en ${Math.ceil((u.bloqueadoHasta.getTime() - ahora.getTime()) / 60_000)} min.`,
    })
  }

  if (!(await verificarContrasena(u.passwordHash, datos.password))) {
    const { intentosFallidos } = await prisma.usuario.update({
      where: { id: u.id },
      data: { intentosFallidos: { increment: 1 } },
      select: { intentosFallidos: true },
    })
    if (intentosFallidos >= MAX_INTENTOS) {
      await prisma.usuario.update({
        where: { id: u.id },
        data: { intentosFallidos: 0, bloqueadoHasta: new Date(ahora.getTime() + BLOQUEO_MINUTOS * 60_000) },
      })
    }
    await fallido(u.id, `Contraseña incorrecta (intento ${intentosFallidos})`, u.id)
    throw credencialesInvalidas()
  }

  if (!u.activo) {
    await fallido(u.id, 'Usuario desactivado', u.id)
    throw createError({ statusCode: 403, message: 'Su cuenta está desactivada. Comuníquese con la Federación.' })
  }

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: u.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoAcceso: ahora },
    })
    await auditar(tx, { ...ctx, usuarioId: u.id }, { accion: 'LOGIN', entidad: 'Usuario', entidadId: u.id })
  })

  return aUsuarioSesion(u)
}

/** Cambia la contraseña propia y cierra las demás sesiones abiertas del usuario. */
export async function cambiarContrasena(usuarioId: string, datos: CambiarPasswordInput, ctx: ContextoAuditoria, sesionActual?: string): Promise<User> {
  const u = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { passwordHash: true } })
  if (!(await verificarContrasena(u.passwordHash, datos.actual))) {
    throw createError({ statusCode: 400, message: 'La contraseña actual no es correcta', data: { campos: { actual: 'Incorrecta' } } })
  }

  const passwordHash = await hashContrasena(datos.nueva)
  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.usuario.update({
      where: { id: usuarioId },
      data: { passwordHash, debeCambiarPassword: false, versionSesion: { increment: 1 } },
      select: SELECT_USUARIO_SESION,
    })
    await cerrarSesiones(tx, usuarioId, 'CAMBIO_CONTRASENA', sesionActual)
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'Usuario.password', entidadId: usuarioId })
    await notificar(tx, usuarioId, {
      tipo: 'SEGURIDAD',
      titulo: 'Contraseña actualizada',
      cuerpo: 'Se cerraron sus sesiones en otros dispositivos.',
      enlace: '/plataforma/cuenta/seguridad',
    })
    return aUsuarioSesion(actualizado)
  })
}

export async function registrarLogout(ctx: ContextoAuditoria & { usuarioId: string }) {
  await auditar(prisma, ctx, { accion: 'LOGOUT', entidad: 'Usuario', entidadId: ctx.usuarioId })
}
