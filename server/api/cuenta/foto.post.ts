import { MAX_FOTO_BYTES, guardarFoto } from '../../services/perfil'

// multipart/form-data con el campo "foto". El tipo real se valida por su firma (magic bytes).
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  exigirFrecuencia(`foto:${usuario.id}`, 20, 60 * 60_000)

  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (largo > MAX_FOTO_BYTES + 64 * 1024) throw createError({ statusCode: 413, message: 'La foto supera el máximo de 3 MB' })

  const partes = await readMultipartFormData(event)
  const foto = partes?.find(p => p.name === 'foto' && p.filename)
  if (!foto) throw createError({ statusCode: 400, message: 'Adjunte una imagen' })
  return guardarFoto(usuario.id, foto.data, foto.filename ?? 'foto', ctx)
})
