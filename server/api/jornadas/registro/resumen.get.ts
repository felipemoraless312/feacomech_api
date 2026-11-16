import QRCode from 'qrcode'
import { resumenRegistro, rutaRegistro } from '~~/server/services/registro-asistentes'
import { urlPublica } from '~~/server/utils/correo'

/** Cifras del registro en sede y el enlace oculto con su QR (sólo para el personal). */
export default defineEventHandler(async (event) => {
  await requireGestionJornadas(event)
  const url = urlPublica(rutaRegistro())
  const qr = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1f2a6b', light: '#ffffff' } })
  return { ...(await resumenRegistro()), url, qr }
})
