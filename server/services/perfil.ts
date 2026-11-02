// Cuenta propia: datos de contacto, perfil profesional, foto y consentimiento del directorio.
import { createError } from 'h3'
import type { PerfilDatos } from '../../shared/schemas/perfil'
import { IMAGENES, borrarDeDisco, guardarArchivo } from '../utils/almacen'
import { auditar, type ContextoAuditoria } from '../utils/auditoria'
import { prisma, type Tx } from '../utils/prisma'
import { accesoDeUsuario } from './permisos'

export const MAX_FOTO_BYTES = 3 * 1024 * 1024

const SELECT_PERFIL = {
  cedulaProfesional: true,
  especialidadId: true,
  subespecialidadId: true,
  cedulaEspecialidad: true,
  municipioId: true,
  municipio: { select: { nombre: true, region: { select: { nombre: true } } } },
  institucionTrabajo: true,
  mostrarInstitucion: true,
  cargoInstitucional: true,
  fotoId: true,
  publicarDirectorio: true,
  consentimientoEn: true,
  estadoValidacion: true,
  validadoEn: true,
  motivoRechazo: true,
  especialidad: { select: { nombre: true } },
  subespecialidad: { select: { nombre: true } },
} as const

export async function obtenerMiCuenta(usuarioId: string) {
  const u = await prisma.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      telefono: true,
      creadoEn: true,
      perfil: { select: SELECT_PERFIL },
    },
  })
  const { roles } = await accesoDeUsuario(usuarioId)
  return { ...u, roles }
}
export type MiCuentaDto = Awaited<ReturnType<typeof obtenerMiCuenta>>

/** Comprueba que la especialidad sea principal y la subespecialidad pertenezca a ella. */
async function validarEspecialidades(tx: Tx, d: PerfilDatos) {
  if (!d.especialidadId) return
  const ids = [d.especialidadId, d.subespecialidadId].filter((x): x is string => !!x)
  const filas = await tx.especialidad.findMany({ where: { id: { in: ids }, activo: true }, select: { id: true, padreId: true } })
  const esp = filas.find(f => f.id === d.especialidadId)
  if (!esp || esp.padreId) {
    throw createError({ statusCode: 400, message: 'Especialidad no válida', data: { campos: { especialidadId: 'No válida' } } })
  }
  if (d.subespecialidadId && filas.find(f => f.id === d.subespecialidadId)?.padreId !== d.especialidadId) {
    throw createError({ statusCode: 400, message: 'La subespecialidad no corresponde a la especialidad', data: { campos: { subespecialidadId: 'No corresponde' } } })
  }
}

export async function actualizarPerfil(usuarioId: string, d: PerfilDatos, ctx: ContextoAuditoria) {
  await prisma.$transaction(async (tx) => {
    await validarEspecialidades(tx, d)
    if (d.municipioId && !(await tx.municipio.findUnique({ where: { id: d.municipioId }, select: { id: true } }))) {
      throw createError({ statusCode: 400, message: 'Municipio no válido', data: { campos: { municipioId: 'No válido' } } })
    }
    const antes = await tx.perfilProfesional.findUnique({ where: { usuarioId }, select: SELECT_PERFIL })
    const usuarioAntes = await tx.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { telefono: true } })

    // Si cambian datos que la Federación valida, el perfil vuelve a revisión.
    const cambiaValidable = !antes
      || antes.cedulaProfesional !== d.cedulaProfesional
      || antes.cedulaEspecialidad !== d.cedulaEspecialidad
      || antes.especialidadId !== d.especialidadId
      || antes.subespecialidadId !== d.subespecialidadId
    const otorgaConsentimiento = d.publicarDirectorio && !antes?.publicarDirectorio

    const datos = {
      cedulaProfesional: d.cedulaProfesional,
      especialidadId: d.especialidadId,
      subespecialidadId: d.subespecialidadId,
      cedulaEspecialidad: d.cedulaEspecialidad,
      municipioId: d.municipioId,
      institucionTrabajo: d.institucionTrabajo,
      mostrarInstitucion: d.mostrarInstitucion,
      cargoInstitucional: d.cargoInstitucional,
      publicarDirectorio: d.publicarDirectorio,
      consentimientoEn: d.publicarDirectorio ? (otorgaConsentimiento ? new Date() : antes?.consentimientoEn ?? new Date()) : null,
      ...(cambiaValidable && antes?.estadoValidacion !== 'PENDIENTE'
        ? { estadoValidacion: 'PENDIENTE' as const, validadoEn: null, validadoPorId: null, motivoRechazo: null }
        : {}),
    }
    const despues = await tx.perfilProfesional.upsert({
      where: { usuarioId },
      create: { usuarioId, ...datos },
      update: datos,
      select: SELECT_PERFIL,
    })
    await tx.usuario.update({ where: { id: usuarioId }, data: { telefono: d.telefono } })

    // La foto sólo es pública si el usuario autorizó aparecer en el directorio.
    if (despues.fotoId) {
      await tx.archivo.update({ where: { id: despues.fotoId }, data: { visibilidad: d.publicarDirectorio ? 'PUBLICO' : 'AUTENTICADO' } })
    }

    await auditar(tx, ctx, {
      accion: 'ACTUALIZAR',
      entidad: 'PerfilProfesional',
      entidadId: usuarioId,
      antes: antes ? { ...antes, telefono: usuarioAntes.telefono } : null,
      despues: { ...despues, telefono: d.telefono },
    })
    if (antes?.publicarDirectorio !== d.publicarDirectorio) {
      await auditar(tx, ctx, {
        accion: 'ACTUALIZAR',
        entidad: 'PerfilProfesional.consentimiento',
        entidadId: usuarioId,
        motivo: d.publicarDirectorio ? 'Autorizó aparecer en el directorio público' : 'Retiró la autorización del directorio público',
      })
    }
  })
  return obtenerMiCuenta(usuarioId)
}

/** Reemplaza la foto de perfil (JPG, PNG o WebP, máx. 3 MB). */
export async function guardarFoto(usuarioId: string, datos: Buffer, nombre: string, ctx: ContextoAuditoria) {
  const rutaAnterior = await prisma.$transaction(async (tx) => {
    const perfil = await tx.perfilProfesional.findUnique({
      where: { usuarioId },
      select: { publicarDirectorio: true, foto: { select: { id: true, ruta: true } } },
    })
    const archivo = await guardarArchivo(tx, {
      datos,
      nombreOriginal: nombre,
      permitidos: IMAGENES,
      maxBytes: MAX_FOTO_BYTES,
      visibilidad: perfil?.publicarDirectorio ? 'PUBLICO' : 'AUTENTICADO',
      subidoPorId: usuarioId,
    })
    await tx.perfilProfesional.upsert({
      where: { usuarioId },
      create: { usuarioId, fotoId: archivo.id },
      update: { fotoId: archivo.id },
    })
    if (perfil?.foto) await tx.archivo.delete({ where: { id: perfil.foto.id } })
    await auditar(tx, ctx, { accion: 'ACTUALIZAR', entidad: 'PerfilProfesional.foto', entidadId: usuarioId, despues: { archivoId: archivo.id } })
    return perfil?.foto?.ruta
  })
  if (rutaAnterior) await borrarDeDisco(rutaAnterior)
  return obtenerMiCuenta(usuarioId)
}

export async function quitarFoto(usuarioId: string, ctx: ContextoAuditoria) {
  const ruta = await prisma.$transaction(async (tx) => {
    const perfil = await tx.perfilProfesional.findUnique({ where: { usuarioId }, select: { foto: { select: { id: true, ruta: true } } } })
    if (!perfil?.foto) return null
    await tx.perfilProfesional.update({ where: { usuarioId }, data: { fotoId: null } })
    await tx.archivo.delete({ where: { id: perfil.foto.id } })
    await auditar(tx, ctx, { accion: 'ELIMINAR', entidad: 'PerfilProfesional.foto', entidadId: usuarioId })
    return perfil.foto.ruta
  })
  if (ruta) await borrarDeDisco(ruta)
  return obtenerMiCuenta(usuarioId)
}
