import { z } from 'zod'
import { listarEspecialidades } from '../../services/especialidades'

const query = z.object({ todas: z.enum(['true', 'false']).optional() })

/** Catálogo para el perfil (activas). Con ?todas=true, también las inactivas (configuración). */
export default defineEventHandler(async (event) => {
  const { todas } = leerQuery(event, query)
  if (todas === 'true') await requirePermiso(event, 'config.administrar')
  else await requireUsuarioActivo(event)
  return listarEspecialidades({ incluirInactivas: todas === 'true' })
})
