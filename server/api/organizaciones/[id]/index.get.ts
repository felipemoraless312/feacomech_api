import { obtenerOrganizacion } from '~~/server/services/organizaciones'

export default defineEventHandler(async (event) => {
  const id = idDeRuta(event)
  await requirePermisoEn(event, 'organizacion.ver', id)
  return obtenerOrganizacion(id)
})
