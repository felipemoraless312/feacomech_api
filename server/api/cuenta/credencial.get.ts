import QRCode from 'qrcode'
import { miCredencial } from '~~/server/services/credencial'
import { urlPublica } from '~~/server/utils/correo'

/** Credencial digital de quien inició sesión, con el QR de verificación. */
export default defineEventHandler(async (event) => {
  const { usuario } = await requireUsuarioActivo(event)
  const c = await miCredencial(usuario.id)
  const urlVerificacion = urlPublica(`/verificar/credencial/${c.codigo}`)
  const qr = await QRCode.toString(urlVerificacion, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#402858', light: '#ffffff' } })
  return { ...c, urlVerificacion, qr }
})
