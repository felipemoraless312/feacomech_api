import { listarRoles } from '../../services/roles'

// También lo usa el formulario de usuarios para elegir roles.
export default defineEventHandler(async (event) => {
  await requireAlguno(event, ['rol.administrar', 'usuario.administrar', 'usuario.ver'])
  return listarRoles()
})
