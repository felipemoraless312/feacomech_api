import { contarNoLeidas } from '../services/notificaciones'
import { accesoDeUsuario } from '../services/permisos'
import { prisma } from '../utils/prisma'

/**
 * Indicadores del resumen, calculados de la base. Cada bloque aparece sólo si el usuario
 * tiene el permiso correspondiente; los módulos futuros agregan los suyos aquí.
 */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const { permisos } = await accesoDeUsuario(usuario.id)
  const hace30 = new Date(Date.now() - 30 * 86_400_000)

  const indicadores: { clave: string, etiqueta: string, valor: number, to?: string, tono?: 'alerta' }[] = []

  if (permisos['usuario.ver'] === 'TOTAL') {
    const [activos, nuevos, sinActivar] = await Promise.all([
      prisma.usuario.count({ where: { activo: true } }),
      prisma.usuario.count({ where: { creadoEn: { gte: hace30 } } }),
      prisma.usuario.count({ where: { activo: true, ultimoAcceso: null } }),
    ])
    indicadores.push(
      { clave: 'usuarios', etiqueta: 'Usuarios activos', valor: activos, to: '/plataforma/usuarios' },
      { clave: 'nuevos', etiqueta: 'Nuevos registros (30 días)', valor: nuevos, to: '/plataforma/usuarios' },
      { clave: 'sinActivar', etiqueta: 'Cuentas sin activar', valor: sinActivar, to: '/plataforma/usuarios', ...(sinActivar ? { tono: 'alerta' as const } : {}) },
    )
  }
  if (permisos['profesional.ver'] === 'TOTAL') {
    const pendientes = await prisma.perfilProfesional.count({ where: { estadoValidacion: 'PENDIENTE', cedulaProfesional: { not: null } } })
    indicadores.push({ clave: 'perfilesPendientes', etiqueta: 'Perfiles por validar', valor: pendientes, to: '/plataforma/profesionales?validacion=PENDIENTE', ...(pendientes ? { tono: 'alerta' as const } : {}) })
  }
  if (permisos['organizacion.ver'] === 'TOTAL') {
    const [registradas, afiliadas, miembros] = await Promise.all([
      prisma.organizacion.count(),
      prisma.organizacion.count({ where: { estadoAfiliacion: 'AFILIADA' } }),
      prisma.membresia.groupBy({ by: ['usuarioId'], where: { estado: 'ACTIVA' } }).then(f => f.length),
    ])
    indicadores.push(
      { clave: 'organizaciones', etiqueta: 'Organizaciones registradas', valor: registradas, to: '/plataforma/organizaciones' },
      { clave: 'afiliadas', etiqueta: 'Organizaciones afiliadas', valor: afiliadas, to: '/plataforma/organizaciones' },
      { clave: 'miembros', etiqueta: 'Profesionales afiliados', valor: miembros, to: '/plataforma/profesionales' },
    )
  }
  if (permisos['afiliacion.validar'] === 'TOTAL' || permisos['organizacion.administrar'] === 'TOTAL') {
    const [membresias, cambios] = await Promise.all([
      prisma.membresia.count({ where: { OR: [{ estado: 'SOLICITADA' }, { estado: 'ACTIVA', bajaSolicitadaEn: { not: null } }] } }),
      prisma.solicitudCambio.count({ where: { estado: 'PENDIENTE' } }),
    ])
    const total = membresias + cambios
    indicadores.push({ clave: 'solicitudes', etiqueta: 'Solicitudes pendientes', valor: total, to: '/plataforma/afiliaciones', ...(total ? { tono: 'alerta' as const } : {}) })
  }

  if (permisos['evento.gestionar'] === 'TOTAL') {
    const proximos = await prisma.evento.count({ where: { estado: 'PUBLICADO', fin: { gte: new Date() } } })
    indicadores.push({ clave: 'eventos', etiqueta: 'Eventos próximos', valor: proximos, to: '/plataforma/eventos/gestion' })
  }
  if (permisos['comunidad.moderar'] === 'TOTAL') {
    const [publicaciones, reportes] = await Promise.all([
      prisma.publicacion.count({ where: { eliminadaEn: null, creadaEn: { gte: hace30 } } }),
      prisma.reporte.count({ where: { estado: 'PENDIENTE' } }),
    ])
    indicadores.push(
      { clave: 'actividad', etiqueta: 'Publicaciones en la comunidad (30 días)', valor: publicaciones, to: '/plataforma/comunidad' },
      { clave: 'reportes', etiqueta: 'Reportes por moderar', valor: reportes, to: '/plataforma/moderacion', ...(reportes ? { tono: 'alerta' as const } : {}) },
    )
  }
  if (permisos['noticia.administrar'] === 'TOTAL') {
    const revision = await prisma.noticia.count({ where: { estado: 'REVISION' } })
    indicadores.push({ clave: 'noticias', etiqueta: 'Noticias por revisar', valor: revision, to: '/plataforma/noticias', ...(revision ? { tono: 'alerta' as const } : {}) })
  }

  return { noLeidas: await contarNoLeidas(usuario.id), indicadores }
})
