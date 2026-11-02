import { inscribirse } from '~~/server/services/eventos'

export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`inscripcion:${usuario.id}`, 30, 60 * 60_000)
  const i = await inscribirse(idDeRuta(event), usuario.id, ctx)
  return { estado: i.estado }
})
