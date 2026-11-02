import { usuarioListaQuery } from '../../../shared/schemas/usuario'
import { listarUsuarios } from '../../services/usuarios'

export default defineEventHandler(async (event) => {
  const { ambito } = await requirePermiso(event, 'usuario.ver')
  return listarUsuarios(leerQuery(event, usuarioListaQuery), ambito)
})
