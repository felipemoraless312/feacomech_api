import { MAX_LOGO_BYTES, guardarLogo } from '~~/server/services/organizaciones'

// multipart/form-data con el campo "logo" (JPG, PNG o WebP).
export default defineEventHandler(async (event) => {
  const { ctx } = await requirePermiso(event, 'organizacion.administrar')
  const largo = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (largo > MAX_LOGO_BYTES + 64 * 1024) throw createError({ statusCode: 413, message: 'El logotipo supera el máximo de 2 MB' })
  const partes = await readMultipartFormData(event)
  const logo = partes?.find(p => p.name === 'logo' && p.filename)
  if (!logo) throw createError({ statusCode: 400, message: 'Adjunte una imagen' })
  await guardarLogo(idDeRuta(event), logo.data, logo.filename ?? 'logo', ctx)
  return { ok: true }
})
