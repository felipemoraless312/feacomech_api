import type { Permiso } from '~~/shared/permisos'
import { bandejaAfiliaciones } from '~~/server/services/membresias'
import { ambitoDe, type Ambito } from '~~/server/services/permisos'

const PERMISOS: Permiso[] = ['afiliacion.validar', 'afiliacion.solicitar', 'organizacion.administrar', 'organizacion.editar']

/** Solicitudes pendientes dentro del ámbito del usuario (toda la Federación o sus organizaciones). */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireAlguno(event, PERMISOS)
  const ambitos = (await Promise.all(PERMISOS.map(p => ambitoDe(usuario.id, p)))).filter((a): a is Ambito => !!a)
  const ambito: Ambito = ambitos.some(a => a.todas)
    ? { todas: true }
    : { todas: false, ids: [...new Set(ambitos.flatMap(a => (a.todas ? [] : a.ids)))] }
  return bandejaAfiliaciones(ambito)
})
