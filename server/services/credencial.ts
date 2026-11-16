// Credencial digital del afiliado.
//
// La credencial no se guarda: se arma con el perfil profesional y las membresías vigentes.
// Su QR lleva a /verificar/credencial/<usuarioId>.<firma>; la firma es un HMAC del id con la
// clave de sesión, así nadie puede recorrer los ids para consultar credenciales ajenas. Si la
// clave cambia, los QR anteriores dejan de validar (basta volver a abrir la credencial).
//
// Vigente = perfil VALIDADO por la Federación + al menos una membresía ACTIVA en un colegio o
// asociación AFILIADA. La verificación pública sólo muestra lo indispensable para comprobarla.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { createError } from 'h3'
import { nombreCompleto } from '../../shared/texto'
import { prisma } from '../utils/prisma'

function firmar(usuarioId: string): string {
  const secreto = process.env.NUXT_SESSION_PASSWORD
  if (!secreto) throw createError({ statusCode: 503, message: 'Credencial no disponible' })
  return createHmac('sha256', secreto).update(`credencial:${usuarioId}`).digest('base64url').slice(0, 22)
}

export const codigoCredencial = (usuarioId: string) => `${usuarioId}.${firmar(usuarioId)}`

/** Folio corto y legible derivado de la firma (no permite reconstruir el código). */
const folioDe = (usuarioId: string) => `FEA-${firmar(usuarioId).replace(/[-_]/g, '').slice(0, 8).toUpperCase()}`

async function datosCredencial(usuarioId: string) {
  const u = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      activo: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      perfil: {
        select: {
          cedulaProfesional: true,
          estadoValidacion: true,
          validadoEn: true,
          fotoId: true,
          publicarDirectorio: true,
          especialidad: { select: { nombre: true } },
          subespecialidad: { select: { nombre: true } },
        },
      },
      membresias: {
        where: { estado: 'ACTIVA', organizacion: { estadoAfiliacion: 'AFILIADA' } },
        orderBy: { desde: 'asc' },
        select: {
          numeroSocio: true,
          desde: true,
          organizacion: { select: { nombre: true, siglas: true, tipo: true, logoId: true } },
        },
      },
    },
  })
  if (!u) return null
  const validado = u.perfil?.estadoValidacion === 'VALIDADO'
  return {
    u,
    nombre: nombreCompleto(u),
    vigente: u.activo && validado && u.membresias.length > 0,
    validado,
  }
}

/** Credencial completa para su titular (plataforma). */
export async function miCredencial(usuarioId: string) {
  const d = await datosCredencial(usuarioId)
  if (!d) throw createError({ statusCode: 404, message: 'No encontrado' })
  const { u } = d
  return {
    folio: folioDe(u.id),
    codigo: codigoCredencial(u.id),
    nombre: d.nombre,
    vigente: d.vigente,
    validado: d.validado,
    estadoValidacion: u.perfil?.estadoValidacion ?? 'PENDIENTE',
    validadoEn: u.perfil?.validadoEn ?? null,
    cedulaProfesional: u.perfil?.cedulaProfesional ?? null,
    especialidad: u.perfil?.especialidad?.nombre ?? null,
    subespecialidad: u.perfil?.subespecialidad?.nombre ?? null,
    fotoId: u.perfil?.fotoId ?? null,
    membresias: u.membresias.map(m => ({
      organizacion: m.organizacion.nombre,
      siglas: m.organizacion.siglas,
      tipo: m.organizacion.tipo,
      logoId: m.organizacion.logoId,
      numeroSocio: m.numeroSocio,
      desde: m.desde,
    })),
  }
}
export type MiCredencialDto = Awaited<ReturnType<typeof miCredencial>>

/** Verificación pública (destino del QR). Firma inválida = "no encontrada", igual que un id inexistente. */
export async function verificarCredencial(codigo: string) {
  const [usuarioId, firma] = codigo.split('.')
  if (!usuarioId || !firma || !/^[0-9a-f-]{36}$/i.test(usuarioId)) return { encontrada: false as const }
  const a = Buffer.from(firma)
  const b = Buffer.from(firmar(usuarioId))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { encontrada: false as const }

  const d = await datosCredencial(usuarioId)
  if (!d) return { encontrada: false as const }
  const { u } = d
  return {
    encontrada: true as const,
    vigente: d.vigente,
    folio: folioDe(u.id),
    nombre: d.nombre,
    especialidad: u.perfil?.especialidad?.nombre ?? null,
    // La foto sólo si su titular la hizo pública (consentimiento del directorio).
    fotoId: u.perfil?.publicarDirectorio ? u.perfil.fotoId : null,
    organizaciones: u.membresias.map(m => m.organizacion.nombre),
    consultadaEn: new Date(),
  }
}
export type VerificacionCredencialDto = Awaited<ReturnType<typeof verificarCredencial>>
