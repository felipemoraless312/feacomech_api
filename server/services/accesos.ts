// Enlaces de un solo uso por correo: recuperar la contraseña y activar cuentas nuevas.
// Sólo se guarda el hash SHA-256 del token; el token en claro viaja únicamente en el correo.
import { createHash, randomBytes } from 'node:crypto'
import { createError } from 'h3'
import type { TipoTokenAcceso } from '../generated/prisma/enums'
import type { RestablecerInput } from '../../shared/schemas/auth'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { hashContrasena } from '../utils/contrasenas'
import { enviarCorreo, plantillaCorreo, urlPublica } from '../utils/correo'
import { prisma, type Tx } from '../utils/prisma'
import { notificar } from './notificaciones'
import { cerrarSesiones } from './sesiones'

export const VIGENCIA_MS: Record<TipoTokenAcceso, number> = {
  RECUPERACION: 30 * 60_000,
  INVITACION: 72 * 60 * 60_000,
}
/** Máximo de enlaces de recuperación por usuario y hora (evita usar la plataforma para enviar spam). */
export const MAX_RECUPERACIONES_HORA = 3

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

/** Emite un token nuevo y anula los anteriores del mismo tipo que sigan sin usar. */
async function emitirToken(tx: Tx, usuarioId: string, tipo: TipoTokenAcceso, ip: string | null, ahora = new Date()) {
  await tx.tokenAcceso.updateMany({
    where: { usuarioId, tipo, usadoEn: null, expiraEn: { gt: ahora } },
    data: { expiraEn: ahora },
  })
  const token = randomBytes(32).toString('base64url') // 43 caracteres
  await tx.tokenAcceso.create({
    data: { usuarioId, tipo, tokenHash: hashToken(token), expiraEn: new Date(ahora.getTime() + VIGENCIA_MS[tipo]), ip },
  })
  return token
}

const enlaceDe = (token: string) => urlPublica(`/plataforma/restablecer?token=${token}`)

/**
 * Envía el enlace de recuperación si el correo pertenece a una cuenta activa.
 * La respuesta al cliente es siempre la misma (no revela qué correos existen).
 */
export async function solicitarRecuperacion(email: string, ctx: ContextoAuditoria, ahora = new Date()) {
  const u = await prisma.usuario.findUnique({ where: { email }, select: { id: true, nombre: true, activo: true } })
  if (!u?.activo) return

  const recientes = await prisma.tokenAcceso.count({
    where: { usuarioId: u.id, tipo: 'RECUPERACION', creadoEn: { gt: new Date(ahora.getTime() - 60 * 60_000) } },
  })
  if (recientes >= MAX_RECUPERACIONES_HORA) return

  const token = await prisma.$transaction(async (tx) => {
    const t = await emitirToken(tx, u.id, 'RECUPERACION', ctx.ip ?? null, ahora)
    await auditar(tx, { ...ctx, usuarioId: null }, { accion: 'CREAR', entidad: 'TokenAcceso.recuperacion', entidadId: u.id })
    return t
  })

  await enviarCorreo({
    para: email,
    asunto: 'Restablecer su contraseña',
    ...plantillaCorreo({
      titulo: `Hola, ${u.nombre}`,
      parrafos: [
        'Recibimos una solicitud para restablecer la contraseña de su cuenta en la plataforma FEACOMECH.',
        'El enlace es válido durante 30 minutos y sólo se puede usar una vez. Si usted no lo solicitó, ignore este mensaje: su contraseña no cambiará.',
      ],
      boton: { texto: 'Definir nueva contraseña', url: enlaceDe(token) },
    }),
  })
}

/**
 * Envía (o reenvía) la invitación para que una cuenta nueva defina su contraseña.
 * Si no hay SMTP configurado devuelve el enlace para que el administrador lo entregue.
 */
export async function enviarInvitacion(usuarioId: string, ctx: ContextoAuditoria) {
  const u = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { email: true, nombre: true, activo: true, ultimoAcceso: true } })
  if (!u) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
  if (!u.activo) throw createError({ statusCode: 400, message: 'El usuario está desactivado' })
  const nueva = !u.ultimoAcceso

  const token = await prisma.$transaction(async (tx) => {
    const t = await emitirToken(tx, usuarioId, 'INVITACION', ctx.ip ?? null)
    await auditar(tx, ctx, { accion: 'CREAR', entidad: 'TokenAcceso.invitacion', entidadId: usuarioId, motivo: nueva ? 'Activación de cuenta' : 'Restablecimiento de acceso por administrador' })
    return t
  })

  const enviado = await enviarCorreo({
    para: u.email,
    asunto: nueva ? 'Su acceso a la plataforma FEACOMECH' : 'Restablecimiento de su acceso a FEACOMECH',
    ...plantillaCorreo(nueva
      ? {
          titulo: `Bienvenido(a), ${u.nombre}`,
          parrafos: [
            'La Federación de Asociaciones y Colegios Médicos del Estado de Chiapas creó su cuenta en la plataforma institucional.',
            `Para activarla, defina su contraseña con el siguiente enlace. Es válido durante 72 horas. Su usuario es su correo: ${u.email}.`,
          ],
          boton: { texto: 'Activar mi cuenta', url: enlaceDe(token) },
        }
      : {
          titulo: `Hola, ${u.nombre}`,
          parrafos: [
            'Un administrador de la Federación generó un enlace para que defina una nueva contraseña.',
            'El enlace es válido durante 72 horas y sólo se puede usar una vez. Su contraseña actual sigue funcionando hasta que la cambie.',
          ],
          boton: { texto: 'Definir nueva contraseña', url: enlaceDe(token) },
        }),
  })
  return enviado ? { enviado: true as const } : { enviado: false as const, enlace: enlaceDe(token) }
}

async function buscarVigente(token: string, ahora: Date) {
  const t = await prisma.tokenAcceso.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, tipo: true, usuarioId: true, usadoEn: true, expiraEn: true, usuario: { select: { email: true, nombre: true, activo: true } } },
  })
  if (!t || t.usadoEn || t.expiraEn <= ahora || !t.usuario.activo) return null
  return t
}

/** Para la página de restablecer: si el enlace sigue vigente y de qué tipo es. */
export async function consultarToken(token: string, ahora = new Date()) {
  const t = await buscarVigente(token, ahora)
  return t ? { valido: true as const, tipo: t.tipo, nombre: t.usuario.nombre, email: t.usuario.email } : { valido: false as const }
}

/** Define la contraseña con un enlace vigente, lo consume y cierra todas las sesiones abiertas. */
export async function usarToken(datos: RestablecerInput, ctx: ContextoAuditoria, ahora = new Date()) {
  const t = await buscarVigente(datos.token, ahora)
  if (!t) throw createError({ statusCode: 400, message: 'El enlace no es válido o ya venció. Solicite uno nuevo.' })

  const passwordHash = await hashContrasena(datos.nueva)
  await prisma.$transaction(async (tx) => {
    // Consumo atómico: si dos peticiones usan el mismo enlace a la vez, sólo una gana.
    const consumido = await tx.tokenAcceso.updateMany({ where: { id: t.id, usadoEn: null }, data: { usadoEn: ahora } })
    if (!consumido.count) throw createError({ statusCode: 400, message: 'El enlace ya fue utilizado' })

    await tx.tokenAcceso.updateMany({ where: { usuarioId: t.usuarioId, usadoEn: null, expiraEn: { gt: ahora } }, data: { expiraEn: ahora } })
    await tx.usuario.update({
      where: { id: t.usuarioId },
      data: { passwordHash, debeCambiarPassword: false, intentosFallidos: 0, bloqueadoHasta: null, versionSesion: { increment: 1 } },
    })
    await cerrarSesiones(tx, t.usuarioId, 'CAMBIO_CONTRASENA')
    await auditar(tx, { ...ctx, usuarioId: t.usuarioId }, {
      accion: 'ACTUALIZAR',
      entidad: 'Usuario.password',
      entidadId: t.usuarioId,
      motivo: t.tipo === 'INVITACION' ? 'Activación de cuenta' : 'Recuperación por correo',
    })
    await notificar(tx, t.usuarioId, {
      tipo: 'SEGURIDAD',
      titulo: t.tipo === 'INVITACION' ? 'Cuenta activada' : 'Contraseña restablecida',
      cuerpo: 'Si no fue usted, comuníquese de inmediato con la Federación.',
      enlace: '/plataforma/cuenta/seguridad',
    })
  })
  return { email: t.usuario.email }
}
