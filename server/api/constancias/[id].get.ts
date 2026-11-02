import QRCode from 'qrcode'
import { constanciaParaImprimir } from '~~/server/services/eventos'
import { ambitoDe } from '~~/server/services/permisos'
import { urlPublica } from '~~/server/utils/correo'

/** Constancia para imprimir: la ve su titular o quien gestiona el evento. Incluye el QR de verificación. */
export default defineEventHandler(async (event) => {
  const { usuario, ctx } = await requireUsuarioActivo(event)
  const c = await constanciaParaImprimir(idDeRuta(event), usuario.id, await ambitoDe(usuario.id, 'constancia.emitir'))
  const urlVerificacion = urlPublica(`/verificar/${c.codigo}`)
  const qr = await QRCode.toString(urlVerificacion, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#3f2759', light: '#ffffff' } })
  await auditar(prisma, ctx, { accion: 'CONSULTAR', entidad: 'Constancia', entidadId: c.id })
  return { ...c, urlVerificacion, qr }
})
