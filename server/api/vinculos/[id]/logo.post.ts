import { MAX_LOGO_VINCULO, guardarLogoVinculo } from '~~/server/services/portal'

export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'contenido.administrar')
  const { datos, nombre } = await leerImagenSubida(event, 'logo', MAX_LOGO_VINCULO)
  await guardarLogoVinculo(idDeRuta(event), datos, nombre, ctx)
  return { ok: true }
})
