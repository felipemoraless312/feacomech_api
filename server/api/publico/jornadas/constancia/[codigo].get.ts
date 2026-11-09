import QRCode from 'qrcode'
import { constanciaPorCodigo } from '~~/server/services/participaciones'
import { urlPublica } from '~~/server/utils/correo'

/** Constancia de las Jornadas por su código (el mismo del QR), con el QR de verificación. */
export default defineEventHandler(async (event) => {
  const { ip } = contextoDe(event)
  exigirFrecuencia(`constancia-jornadas:${ip}`, 60, 10 * 60_000)
  const c = await constanciaPorCodigo(getRouterParam(event, 'codigo') ?? '')
  const url = urlPublica(`/jornadas-2026/constancia/${c.codigo}`)
  const qr = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1f2a6b', light: '#ffffff' } })
  return { ...c, url, qr }
})
